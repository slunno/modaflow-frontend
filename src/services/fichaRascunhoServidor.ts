import { api, ApiError } from './api';
import type { PecaItem } from '../types/plm';

export type ValorRascunho = string | number | boolean | null | ValorRascunho[] | ConteudoRascunho;
export interface ConteudoRascunho {
  [campo: string]: ValorRascunho;
}
export interface IdentidadeRascunho {
  pecaId: string;
  marcaId: string;
  colecaoId: string;
}
interface AutorRascunho {
  usuarioId: string;
  nome: string;
}
export interface SnapshotRascunhoServidor {
  identity: IdentidadeRascunho;
  schemaVersion: 1;
  revisao: string;
  conteudo: ConteudoRascunho;
  anexos: [];
  criadoEm: string;
  criadoPor: AutorRascunho;
  atualizadoEm: string;
  atualizadoPor: AutorRascunho;
}
export interface EventoRascunhoServidor {
  eventoId: string;
  operation: 'CRIAR' | 'ATUALIZAR';
  antes: SnapshotRascunhoServidor | null;
  depois: SnapshotRascunhoServidor;
}
export interface SalvarRascunhoServidorRequest {
  schemaVersion: 1;
  expectedRevision: string | null;
  conteudo: ConteudoRascunho;
  anexos: [];
}

/** Opt-in estrito: ausência, false e qualquer outro valor mantêm as requisições desativadas. */
export function fichaServerDraftEnabled(): boolean {
  return import.meta.env.VITE_FICHA_SERVER_DRAFT_ENABLED === 'true';
}

function exigirHabilitacao() {
  if (!fichaServerDraftEnabled()) throw new Error('Rascunho central desativado nesta instalação.');
}

function validarIdentidade(identity: IdentidadeRascunho) {
  for (const campo of ['pecaId', 'marcaId', 'colecaoId'] as const) {
    if (!textoIdentidadeValido(identity[campo]))
      throw new Error(
        'Peça, marca e coleção precisam de identificadores válidos para o rascunho central.'
      );
  }
}

function textoIdentidadeValido(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 128 &&
    value === value.trim() &&
    !Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || (code >= 127 && code <= 159);
    })
  );
}

function pathRascunho(identity: IdentidadeRascunho): string {
  validarIdentidade(identity);
  return `/fichas/rascunhos/${encodeURIComponent(identity.colecaoId)}/pecas/${encodeURIComponent(identity.pecaId)}`;
}

const URI_LOCAL = /^(data|blob):/i;
const CAMPOS_MIDIA = new Set(['imagemCroquiUrl', 'imagemUrl', 'simbologiaImagemUrl']);

/** Cópia JSON sem bytes/URLs temporárias. Metadados e IDs estáveis ficam intactos. */
export function projetarPecaSemMidias(peca: PecaItem): ConteudoRascunho {
  const ancestrais = new WeakSet<object>();
  const projetar = (value: unknown, campo = '', path = 'peça'): ValorRascunho | undefined => {
    if (value === undefined) return undefined;
    const midiaConhecida = CAMPOS_MIDIA.has(campo) || campo === 'imagensList';
    if (typeof value === 'string') {
      if (!URI_LOCAL.test(value.trimStart())) return value;
      if (midiaConhecida) return undefined;
      throw new Error(
        `O campo ${path} contém uma URI data:/blob: fora dos campos de mídia conhecidos. Nada foi removido do rascunho local ou enviado. Revise esse campo antes de salvar no servidor.`
      );
    }
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) throw new Error('O rascunho contém um número inválido.');
      return value;
    }
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      if (midiaConhecida) return undefined;
      throw new Error(
        `O campo ${path} contém um arquivo binário fora dos campos de mídia conhecidos. Nada foi removido do rascunho local ou enviado.`
      );
    }
    if (typeof value !== 'object')
      throw new Error('O rascunho contém dados incompatíveis com JSON.');
    if (ancestrais.has(value)) throw new Error('O rascunho contém uma referência circular.');
    ancestrais.add(value);
    try {
      if (Array.isArray(value)) {
        // Mantém posição e metadados. Não usa índices para vincular mídia ou hidratar a ficha.
        return value.map((entry, index) => projetar(entry, campo, `${path}[${index}]`) ?? null);
      }
      const prototype = Object.getPrototypeOf(value);
      if (prototype !== Object.prototype && prototype !== null)
        throw new Error('O rascunho contém um objeto incompatível com JSON.');
      return Object.fromEntries(
        Object.entries(value).flatMap(([key, entry]) => {
          const projected = projetar(entry, key, `${path}.${key}`);
          return projected === undefined ? [] : [[key, projected]];
        })
      );
    } finally {
      ancestrais.delete(value);
    }
  };
  return projetar(peca) as ConteudoRascunho;
}

function validarConteudo(conteudo: ConteudoRascunho, identity: IdentidadeRascunho) {
  if (
    conteudo.id !== identity.pecaId ||
    conteudo.marcaId !== identity.marcaId ||
    conteudo.colecaoId !== identity.colecaoId
  )
    throw new Error(
      'Os identificadores da peça não correspondem à marca e coleção abertas. Nada foi enviado.'
    );
}

function objeto(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validarSnapshot(value: unknown, identity: IdentidadeRascunho): SnapshotRascunhoServidor {
  if (
    !objeto(value) ||
    !objeto(value.identity) ||
    !objeto(value.conteudo) ||
    value.schemaVersion !== 1 ||
    !textoIdentidadeValido(value.revisao) ||
    !Array.isArray(value.anexos) ||
    value.anexos.length !== 0 ||
    value.identity.pecaId !== identity.pecaId ||
    value.identity.marcaId !== identity.marcaId ||
    value.identity.colecaoId !== identity.colecaoId ||
    typeof value.criadoEm !== 'string' ||
    typeof value.atualizadoEm !== 'string' ||
    !objeto(value.criadoPor) ||
    !objeto(value.atualizadoPor) ||
    typeof value.criadoPor.usuarioId !== 'string' ||
    typeof value.criadoPor.nome !== 'string' ||
    typeof value.atualizadoPor.usuarioId !== 'string' ||
    typeof value.atualizadoPor.nome !== 'string'
  ) {
    throw new Error(
      'O servidor retornou um rascunho inválido ou de outra peça. Os dados locais foram preservados.'
    );
  }
  validarConteudo(value.conteudo as ConteudoRascunho, identity);
  return value as unknown as SnapshotRascunhoServidor;
}

export async function consultarRascunhoServidor(
  identity: IdentidadeRascunho
): Promise<SnapshotRascunhoServidor | null> {
  exigirHabilitacao();
  try {
    const value = await api.get<unknown>(pathRascunho(identity), identity.marcaId);
    return validarSnapshot(value, identity);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      if (objeto(error.data) && error.data.code === 'DRAFT_NOT_FOUND') return null;
      throw new ApiError(
        'Não foi possível confirmar a consulta do rascunho. Verifique se a API de rascunhos está habilitada; nenhum dado local foi alterado.',
        error.status,
        error.statusText,
        error.data
      );
    }
    throw error;
  }
}

export async function salvarRascunhoServidor(
  identity: IdentidadeRascunho,
  peca: PecaItem,
  expectedRevision: string | null
): Promise<SnapshotRascunhoServidor> {
  exigirHabilitacao();
  validarIdentidade(identity);
  const conteudo = projetarPecaSemMidias(peca);
  validarConteudo(conteudo, identity);
  if (expectedRevision !== null && !textoIdentidadeValido(expectedRevision))
    throw new Error('Consulte uma revisão válida do rascunho central antes de salvar.');
  const request: SalvarRascunhoServidorRequest = {
    schemaVersion: 1,
    expectedRevision,
    conteudo,
    anexos: [],
  };
  const value = await api.put<unknown>(pathRascunho(identity), request, identity.marcaId);
  return validarSnapshot(value, identity);
}

export async function consultarHistoricoRascunhoServidor(
  identity: IdentidadeRascunho,
  options: { afterEventoId?: string; limit?: number } = {}
): Promise<EventoRascunhoServidor[]> {
  exigirHabilitacao();
  const limit = options.limit ?? 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    throw new Error('O limite do histórico deve estar entre 1 e 100.');
  if (
    options.afterEventoId &&
    !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(options.afterEventoId)
  )
    throw new Error('Cursor de histórico inválido.');
  const params = new URLSearchParams({ limit: String(limit) });
  if (options.afterEventoId) params.set('afterEventoId', options.afterEventoId);
  const value = await api.get<unknown>(
    `${pathRascunho(identity)}/historico?${params}`,
    identity.marcaId
  );
  if (!Array.isArray(value)) throw new Error('O servidor retornou um histórico inválido.');
  return value.map((entry: unknown) => {
    if (
      !objeto(entry) ||
      typeof entry.eventoId !== 'string' ||
      !entry.eventoId ||
      (entry.operation !== 'CRIAR' && entry.operation !== 'ATUALIZAR')
    )
      throw new Error('O servidor retornou um evento de histórico inválido.');
    return {
      eventoId: entry.eventoId,
      operation: entry.operation,
      antes: entry.antes === null ? null : validarSnapshot(entry.antes, identity),
      depois: validarSnapshot(entry.depois, identity),
    };
  });
}
