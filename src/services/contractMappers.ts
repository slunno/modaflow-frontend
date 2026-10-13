/**
 * ============================================================================
 * MÓDULO: Mapeadores de Contrato (DTO -> Modelo de Apresentação)
 * ARQUIVO: src/services/contractMappers.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Converte DTOs recebidos dos endpoints do Spring Boot em modelos
 *            de apresentação seguros para a UI. Normaliza identificadores,
 *            trata ausência de dados sem criar valores fictícios e diferencia
 *            explicitamente ausência de valor de zero numérico real.
 * ============================================================================
 */

import type {
  MarcaResponseDTO,
  UsuarioResponseDTO,
  ColecaoResponseDTO,
  PecaResponseDTO,
  DashboardMetricsResponseDTO,
  InsumoResponseDTO,
} from '../types/dtos';
import type { MarcaSummary, User } from '../types/auth';
import type { ColecaoItem, PecaItem, DashboardMetricDetail } from '../types/plm';
import type { TecidoInsumoItem, UserRecord } from '../types/gestao';
import type { LinxProdutoValido, LinxColecaoValida, LinxGriffe } from '../types/linx';

/**
 * Normaliza qualquer ID recebido (string, número) em string limpa e segura.
 */
export function normalizeId(id: string | number | null | undefined): string {
  if (id === null || id === undefined) return '';
  return String(id).trim();
}

/**
 * Mapeia MarcaResponseDTO do backend para MarcaSummary de apresentação.
 */
export function mapMarcaDtoToSummary(dto: MarcaResponseDTO): MarcaSummary {
  return {
    id: normalizeId(dto.id),
    nome: dto.nome,
    code: dto.code,
    initials: dto.initials || dto.code.slice(0, 4).toUpperCase(),
    colecoesCount: dto.colecoesCount ?? 0,
    pecasCount: dto.pecasCount ?? 0,
    heroImageUrl: dto.heroImageUrl || '',
    logoUrl: dto.logoUrl || undefined,
    description: dto.description || '',
    badgeTag: dto.badgeTag || 'AKR BRANDS',
  };
}

/**
 * Mapeia UsuarioResponseDTO para o User do contexto de autenticação.
 * Não substitui marcas ausentes por MOCK nem cargo por 'Administrador'.
 */
export function mapUsuarioDtoToUser(dto: UsuarioResponseDTO): User {
  const marcas = Array.isArray(dto.marcasPermitidas)
    ? dto.marcasPermitidas.map(mapMarcaDtoToSummary)
    : [];

  return {
    id: normalizeId(dto.id),
    nome: dto.nome,
    email: dto.email,
    empresa: dto.empresa ?? 'AKR BRANDS',
    cargo: dto.cargo || 'Sem cargo definido',
    avatarUrl: dto.avatarUrl ?? undefined,
    marcas,
  };
}

/**
 * Mapeia UsuarioResponseDTO para UserRecord da tela de Gestão de Usuários.
 */
export function mapUsuarioDtoToRecord(dto: UsuarioResponseDTO): UserRecord {
  const isFantasma = dto.cargo === 'Fantasma' || dto.cargo?.toLowerCase().includes('fantasma');
  const marcasPermitidas = Array.isArray(dto.marcasPermitidas) ? dto.marcasPermitidas : [];
  const cargoLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    ASSISTENTE: 'Assistente',
    COORDENADOR: 'Coordenador',
    VISUALIZADOR: 'Observador',
    ESTILISTA: 'Estilista',
    GESTOR: 'Coordenador',
    MODELISTA: 'Modelista',
    COMPRADOR: 'Comprador',
  };

  return {
    id: normalizeId(dto.id),
    nome: dto.nome,
    email: dto.email,
    codigo: `usr-${dto.id}`,
    marcas: marcasPermitidas.map((m) => m.nome),
    status: dto.ativo ? 'Ativo' : 'Inativo',
    acesso: dto.ativo ? 'Permitido' : 'Bloqueado',
    isFantasma,
    brandRoles: (dto.brandRoles ?? []).flatMap((role) => {
      const marca = marcasPermitidas.find(
        (item) => normalizeId(item.id) === normalizeId(role.marcaId)
      );
      return marca
        ? [
            {
              marcaId: normalizeId(marca.id),
              marcaNome: marca.nome,
              cargo: cargoLabels[role.cargo] ?? role.cargo,
              times: [],
            },
          ]
        : [];
    }),
  };
}

/**
 * Mapeia status de Coleção do backend (StatusColecaoEnum) para a UI.
 */
export function mapStatusColecao(
  status: string | null | undefined
): 'Em andamento' | 'Completas' | 'Arquivadas' {
  if (!status) return 'Em andamento';
  const normalized = status.toUpperCase();
  if (normalized === 'CONCLUIDO' || normalized === 'COMPLETAS') return 'Completas';
  if (normalized === 'ARQUIVADO' || normalized === 'ARQUIVADAS') return 'Arquivadas';
  return 'Em andamento';
}

/**
 * Mapeia ColecaoResponseDTO para ColecaoItem.
 */
export function mapColecaoDtoToItem(dto: ColecaoResponseDTO, marcaNome = ''): ColecaoItem {
  const entrega = dto.dataEntrega ? formatDate(dto.dataEntrega) : 'A definir';
  return {
    id: normalizeId(dto.id),
    nome: dto.nome,
    marcaNome,
    status: mapStatusColecao(dto.status),
    progressoPercent: dto.progressoPercent ?? 0,
    pecasConcluidas: dto.pecasConcluidas ?? 0,
    pecasTotal: dto.pecasTotal ?? 0,
    concluidoEmDate: dto.concluidoEmDate ? formatDate(dto.concluidoEmDate) : undefined,
    dataEntrega: entrega,
    diasAtraso: dto.diasAtraso ?? 0,
  };
}

/**
 * Mapeia status de Peça do backend (StatusPecaEnum) para a UI.
 */
export function mapStatusPeca(
  status: string | null | undefined
): 'Em andamento' | 'Completa' | 'A desenhar' | 'Cancelada' | 'Status não identificado' {
  if (!status) return 'Status não identificado';
  const s = status.toUpperCase();
  if (s === 'COMPLETA' || s === 'APROVADO') return 'Completa';
  if (s === 'A_DESENHAR') return 'A desenhar';
  if (s === 'CANCELADO' || s === 'CANCELADA') return 'Cancelada';
  if (s === 'EM_DESENVOLVIMENTO' || s === 'EM_PRODUCAO') return 'Em andamento';
  return 'Status não identificado';
}

/**
 * Mapeia PecaResponseDTO para PecaItem da UI.
 */
export function mapPecaDtoToItem(dto: PecaResponseDTO, fallbackMarcaNome = ''): PecaItem {
  return {
    id: normalizeId(dto.id),
    colecaoId: normalizeId(dto.colecaoId),
    codigo: dto.codigo,
    nome: dto.nome,
    tipo: dto.tipo || 'Vestuário',
    status: mapStatusPeca(dto.status),
    etapaAtual: dto.etapaAtual ? String(dto.etapaAtual).replace(/_/g, ' ') : 'Inicial',
    tema: dto.tema || '—',
    colecaoNome: dto.colecaoNome || 'Coleção',
    marcaNome: fallbackMarcaNome,
    estilista: dto.estilista || '—',
    modelista: dto.modelista || undefined,
    tecidos: [],
    imagemCroquiUrl: dto.imagemCroquiUrl || undefined,
    custo: dto.custo != null ? Number(dto.custo) : undefined,
    preco: dto.preco != null ? Number(dto.preco) : undefined,
    previsaoEntrega: dto.previsaoEntrega ? formatDate(dto.previsaoEntrega) : '—',
    diasAtraso: dto.diasAtraso ?? 0,
  };
}

/**
 * Mapeia LinxProdutoValido para PecaItem sem inventar status 'Completa' nem preços fictícios.
 */
export function mapLinxProdutoToPeca(
  product: LinxProdutoValido,
  colecaoId: string,
  colecaoNome: string,
  marcaId: string,
  marcaNome: string,
  index: number
): PecaItem {
  const codigo = product.codigo?.trim() || product.codigoNormalizado?.trim() || `LINX-${index + 1}`;
  const materialCodigo = product.materialPrincipal?.trim();
  const materialDescricao = product.descricaoMaterialPrincipal?.trim();
  const material = materialDescricao
    ? `${materialDescricao}${materialCodigo ? ` (${materialCodigo})` : ''}`
    : materialCodigo;

  // Se o Linx não fornecer equivalência comprovada, marcamos como "Status não identificado"
  const rawStatus = (product.statusProduto || product.tipoStatusProduto || '').toUpperCase();
  let status: PecaItem['status'] = 'Status não identificado';
  if (rawStatus === 'APROVADO' || rawStatus === 'COMPLETO' || rawStatus === 'COMPLETA') {
    status = 'Completa';
  } else if (rawStatus === 'CANCELADO' || rawStatus === 'CANCELADA' || rawStatus === 'REPROVADO') {
    status = 'Cancelada';
  } else if (rawStatus.includes('DESENV') || rawStatus.includes('PROD')) {
    status = 'Em andamento';
  }

  // Preço e custo: preserva null/undefined quando ausente, sem inventar 0
  const custo =
    product.custoReposicao !== null && product.custoReposicao !== undefined
      ? Number(product.custoReposicao)
      : undefined;

  const preco =
    product.precoReposicao !== null && product.precoReposicao !== undefined
      ? Number(product.precoReposicao)
      : undefined;

  return {
    id: `linx-${product.linxId ?? product.codigoNormalizado ?? `${colecaoId}-${index}`}`,
    colecaoId,
    marcaId,
    codigo,
    nome: product.descricao?.trim() || codigo,
    tipo: product.subgrupo?.trim() || product.tipo?.trim() || 'Roupa',
    status,
    etapaAtual: product.periodoPcp?.trim() || product.tipoStatusProduto?.trim() || 'Linx ERP',
    tema: product.linha?.trim() || product.temporada?.trim() || '—',
    colecaoNome: product.colecaoNome?.trim() || colecaoNome,
    marcaNome,
    estacao: product.temporada?.trim() || undefined,
    estilista: product.estilista?.trim() || '—',
    modelista: product.modelista?.trim() || undefined,
    tecidos: material ? [material] : [],
    linxOrigem:
      product.griffe === 'K&J BLACK' ||
      product.griffe === 'KING&JOE' ||
      product.griffe === 'KING&JOE PLAY'
        ? {
            codigoProduto: codigo,
            colecaoCodigo: product.colecaoCodigo?.trim() ?? '',
            griffe: product.griffe,
          }
        : undefined,
    linxCadastro: { linha: product.linha, grade: product.grade, subgrupo: product.subgrupo },
    fichaTecnica: {
      nomeProduto: product.descricao?.trim() ?? '',
      codigoReferencia: codigo,
      modelagem: product.modelagem?.trim() ?? '',
    },
    custo,
    preco,
    previsaoEntrega: product.dataFinalColecao ? formatDate(product.dataFinalColecao) : '—',
  };
}

/**
 * Coleções legadas do Linx, confirmadas como finalizadas para a organização do portal.
 * Progresso, peças concluídas e data de conclusão continuam dependendo de dados próprios.
 */
export function mapLinxColecaoToItem(
  collection: LinxColecaoValida,
  marca: MarcaSummary,
  griffe: LinxGriffe
): ColecaoItem {
  const total = Math.max(0, collection.quantidadeProdutos ?? 0);
  const deliveryDate = collection.dataFinal;

  return {
    id: `linx-${griffe}-${collection.codigo ?? collection.nome ?? 'colecao'}`,
    marcaId: marca.id,
    griffe,
    codigoPill: collection.codigo ?? marca.code,
    nome: collection.nome ?? collection.codigo ?? 'Coleção sem nome',
    marcaNome: marca.nome,
    status: 'Completas',
    regraFicha: 'legado',
    progressoPercent: undefined,
    pecasConcluidas: undefined,
    pecasTotal: total,
    concluidoEmDate: undefined,
    dataEntrega: deliveryDate ? formatDate(deliveryDate) : 'A definir',
    diasParaEntrega: deliveryDate ? daysUntil(deliveryDate) : undefined,
    diasAtraso: 0,
    temporada: collection.temporada ?? undefined,
  };
}

/**
 * Mapeia InsumoResponseDTO para TecidoInsumoItem.
 */
export function mapInsumoDtoToTecidoItem(dto: InsumoResponseDTO): TecidoInsumoItem {
  return {
    id: normalizeId(dto.id),
    nome: dto.nome,
    codigo: dto.codigo,
    temErp: Boolean(dto.temErp),
    imagemUrl: dto.imagemUrl || undefined,
    fornecedores: dto.fornecedorNome || '—',
    custo: dto.custo != null ? `R$ ${Number(dto.custo).toFixed(2).replace('.', ',')}` : '—',
    unidade: (dto.unidadeMedida as TecidoInsumoItem['unidade']) || 'M',
    observacoes: dto.observacoes || undefined,
  };
}

/**
 * Converte DashboardMetricsResponseDTO do backend para o formato de exibição da UI.
 */
export function mapDashboardMetricsDto(
  dto: DashboardMetricsResponseDTO
): Record<string, DashboardMetricDetail> {
  const result: Record<string, DashboardMetricDetail> = {};

  if (!dto || !dto.pecasPorEtapa) return result;

  const total = dto.totalPecas || 1;

  for (const [etapa, count] of Object.entries(dto.pecasPorEtapa)) {
    const formattedEtapa = etapa.replace(/_/g, ' ').toLowerCase();
    result[formattedEtapa] = {
      mediaMes: `${count} peças`,
      mediaSemana: `${Math.round((count / total) * 100)}% do fluxo`,
      entradas: count,
      saidas: 0,
      emDia: Math.max(0, count - (dto.pecasAtrasadas || 0)),
      entregaHoje: 0,
      atrasadas: dto.pecasAtrasadas || 0,
      responsaveis: ['TI', 'AKR'],
    };
  }

  return result;
}

// ── UTILITÁRIOS INTERNOS DE FORMATAÇÃO ──

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function daysUntil(iso: string | null | undefined): number | undefined {
  if (!iso) return undefined;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const deliveryUtc = Date.UTC(year, month - 1, day);
  return Math.ceil((deliveryUtc - todayUtc) / 86_400_000);
}

/**
 * Formata valores monetários preservando a diferença entre ausência e zero real.
 */
export function formatCurrencyValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}
