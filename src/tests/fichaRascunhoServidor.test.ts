import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  consultarHistoricoRascunhoServidor,
  consultarRascunhoServidor,
  fichaServerDraftEnabled,
  projetarPecaSemMidias,
  salvarRascunhoServidor,
  type IdentidadeRascunho,
  type SnapshotRascunhoServidor,
} from '../services/fichaRascunhoServidor';
import { ApiError } from '../services/api';
import type { PecaItem } from '../types/plm';

const identity: IdentidadeRascunho = {
  pecaId: 'peca 1',
  marcaId: 'marca-1',
  colecaoId: 'colecao/1',
};
const revisao = '2912e1ba-473b-4ced-8d12-328c6741e678';
function makePeca(): PecaItem & { fichaTecnica: NonNullable<PecaItem['fichaTecnica']> } {
  return {
    id: identity.pecaId,
    marcaId: identity.marcaId,
    colecaoId: identity.colecaoId,
    nome: 'Peça teste',
    codigo: '',
    tipo: 'Camisa',
    status: 'Em andamento',
    etapaAtual: '',
    tema: '',
    colecaoNome: 'Coleção',
    marcaNome: 'Marca',
    estilista: '',
    tecidos: [],
    previsaoEntrega: '',
    imagemCroquiUrl: 'blob:http://localhost/croqui',
    fichaTecnica: {
      descricao: 'Descrição manual',
      tamanhos: ['P', 'M'],
      simbologiaImagemUrl: 'data:image/png;base64,c2ltYm9sbw==',
      variantes: [
        {
          id: 'variante-estavel',
          nome: 'Principal',
          imagemAnexoId: 'anexo-estavel',
          imagemNome: 'croqui.png',
          imagemUrl: 'data:image/png;base64,aW1hZ2Vt',
          tecidos: [
            {
              id: 'tecido-estavel',
              nome: 'Tecido',
              codigo: '01',
              temErp: false,
              fornecedores: '',
              custo: '14,9799',
              unidade: 'KG',
              peso: '0,4000',
              precoOrigem: 'manual',
              consumoPorTamanho: { P: { valor: '0' }, M: { valor: '0,45', naoSeAplica: false } },
              imagensList: [
                'data:image/png;base64,cHJpbWVpcmE=',
                'https://example.invalid/remota.png',
              ],
              linxDados: {
                codigo: '01',
                nome: 'Tecido',
                grupo: 'TECIDO',
                item: '1',
                cores: [],
                dados: { C1: 0, C2: 0.45 },
              },
            },
          ],
          aviamentos: [],
        },
      ],
      provaRoupa: {
        data: '2026-10-07',
        observacoes: 'Teste',
        fotos: [
          { id: 'foto-estavel', nome: 'prova.png', imagemUrl: 'blob:http://localhost/prova' },
        ],
      },
    },
  };
}
function snapshot(peca = makePeca()): SnapshotRascunhoServidor {
  return {
    identity,
    schemaVersion: 1,
    revisao,
    conteudo: projetarPecaSemMidias(peca),
    anexos: [],
    criadoEm: '2026-10-07T13:00:00Z',
    atualizadoEm: '2026-10-07T13:00:00Z',
    criadoPor: { usuarioId: 'usuario-1', nome: 'Autor teste' },
    atualizadoPor: { usuarioId: 'usuario-1', nome: 'Autor teste' },
  };
}
const fetchMock = vi.fn();
const responder = (data: unknown, status = 200) =>
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(data), { status }));

beforeEach(() => {
  vi.stubEnv('VITE_FICHA_SERVER_DRAFT_ENABLED', 'true');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  localStorage.clear();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Projeção dos dados sem anexos binários', () => {
  it('preserva preços strings, IDs, grade, campos manuais e rawCn sem mutar mídias locais', () => {
    const peca = makePeca();
    const before = structuredClone(peca);
    const projected = projetarPecaSemMidias(peca);
    const raw = JSON.stringify(projected);
    expect(raw).not.toContain('data:image');
    expect(raw).not.toContain('blob:');
    expect(raw).toContain('14,9799');
    expect(raw).toContain('0,4000');
    expect(raw).toContain('anexo-estavel');
    expect(raw).toContain('foto-estavel');
    expect(raw).toContain('prova.png');
    expect(raw).toContain('https://example.invalid/remota.png');
    const tecido = (
      (projected.fichaTecnica as Record<string, unknown>).variantes as Array<
        Record<string, unknown>
      >
    )[0]!.tecidos as Array<Record<string, unknown>>;
    expect(tecido[0]!.imagensList).toEqual([null, 'https://example.invalid/remota.png']);
    expect(raw).toContain('"C1":0');
    expect(raw).toContain('"naoSeAplica":false');
    expect(peca).toEqual(before);
    expect(projected).not.toBe(peca);
  });

  it('mídias de fotos e terceiros preservam os objetos, nomes e IDs sem remover posições', () => {
    const peca = makePeca();
    peca.fichaTecnica!.terceiros = [
      {
        id: 'terceiro',
        tipo: 'Lavanderia',
        fornecedor: '',
        codigoFornecedor: '',
        observacoes: '',
        tela: '',
        traducao: '',
        tecnicas: '',
        variantes: [],
        imagens: [
          { id: 'foto-1', nome: 'primeira.png', imagemUrl: '  DATA:image/png;base64,YQ==' },
          { id: 'foto-2', nome: 'segunda.png', imagemUrl: 'BLOB:http://localhost/foto-2' },
        ],
      },
    ];
    const result = projetarPecaSemMidias(peca);
    const ficha = result.fichaTecnica as Record<string, unknown>;
    expect((ficha.provaRoupa as Record<string, unknown>).fotos).toEqual([
      { id: 'foto-estavel', nome: 'prova.png' },
    ]);
    expect((ficha.terceiros as Array<Record<string, unknown>>)[0]!.imagens).toEqual([
      { id: 'foto-1', nome: 'primeira.png' },
      { id: 'foto-2', nome: 'segunda.png' },
    ]);
    expect(peca.fichaTecnica.terceiros![0]!.imagens![0]!.imagemUrl).toBe(
      '  DATA:image/png;base64,YQ=='
    );
  });

  it.each(['data:image/png;base64,bm90YXM=', '  BLOB:http://localhost/nota'])(
    'URI inesperada em observação não é apagada silenciosamente: %s',
    async (note) => {
      const peca = makePeca();
      peca.fichaTecnica!.observacoesGerais = note;
      expect(() => projetarPecaSemMidias(peca)).toThrow(
        /observacoesGerais.*fora dos campos de mídia conhecidos/
      );
      await expect(salvarRascunhoServidor(identity, peca, null)).rejects.toThrow(
        /Nada foi removido/
      );
      expect(peca.fichaTecnica!.observacoesGerais).toBe(note);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('texto comum preserva espaços/case exatos e arquivos inesperados são rejeitados, não apagados', () => {
    const peca = makePeca();
    peca.fichaTecnica!.observacoesGerais = '  Texto DATA: comercial, sem ser URI inicial';
    expect(
      (projetarPecaSemMidias(peca).fichaTecnica as Record<string, unknown>).observacoesGerais
    ).toBe('  Texto DATA: comercial, sem ser URI inicial');
    Object.assign(peca.fichaTecnica, { arquivoInesperado: new Blob(['test']) });
    expect(() => projetarPecaSemMidias(peca)).toThrow(
      /arquivoInesperado.*fora dos campos de mídia conhecidos/
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejeita estruturas incompatíveis sem enviar nem descartar silenciosamente dados cadastrais', () => {
    const peca = makePeca();
    Object.assign(peca, { inesperado: new Map([['preco', '2,50']]) });
    expect(() => projetarPecaSemMidias(peca)).toThrow(/incompatível com JSON/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Cliente opt-in de rascunho central', () => {
  it.each([undefined, 'false', 'TRUE', '1'])(
    'flag %s mantém GET, PUT e histórico sem nenhuma requisição',
    async (flag) => {
      vi.stubEnv('VITE_FICHA_SERVER_DRAFT_ENABLED', flag);
      expect(fichaServerDraftEnabled()).toBe(false);
      await expect(consultarRascunhoServidor(identity)).rejects.toThrow(/desativado/);
      await expect(salvarRascunhoServidor(identity, makePeca(), null)).rejects.toThrow(
        /desativado/
      );
      await expect(consultarHistoricoRascunhoServidor(identity)).rejects.toThrow(/desativado/);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('consulta explícita usa o JWT e marca da peça, não a marca ativa de outra coleção', async () => {
    localStorage.setItem('modaflow_token', 'token-teste');
    localStorage.setItem('modaflow_active_marca', JSON.stringify({ id: 'outra-marca' }));
    responder(snapshot());
    expect(await consultarRascunhoServidor(identity)).toMatchObject({ revisao });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toContain('/fichas/rascunhos/colecao%2F1/pecas/peca%201');
    expect(init).toMatchObject({
      method: 'GET',
      headers: { Authorization: 'Bearer token-teste', 'X-Marca-Id': identity.marcaId },
    });
  });

  it('DRAFT_NOT_FOUND significa inexistente; rede/403 continuam sendo erros, nunca vazio ou sucesso', async () => {
    responder({ code: 'DRAFT_NOT_FOUND', message: 'Não encontrado' }, 404);
    expect(await consultarRascunhoServidor(identity)).toBeNull();
    responder({ message: 'Sem acesso' }, 403);
    await expect(consultarRascunhoServidor(identity)).rejects.toMatchObject({ status: 403 });
    fetchMock.mockRejectedValueOnce(new Error('Offline'));
    await expect(consultarRascunhoServidor(identity)).rejects.toMatchObject({
      isNetworkError: true,
    });
  });

  it('404 de rota indisponível não confirma ausência de rascunho nem autoriza criação', async () => {
    responder({ message: 'Rota não encontrada' }, 404);
    await expect(consultarRascunhoServidor(identity)).rejects.toMatchObject({
      status: 404,
      message: expect.stringContaining('API de rascunhos está habilitada'),
    });
  });

  it('salva o fullPeca projetado e revision CAS exatamente, sempre anexos[], sem mexer em localStorage', async () => {
    localStorage.setItem('rascunho-local-teste', 'intacto');
    const peca = makePeca();
    responder(snapshot());
    await salvarRascunhoServidor(identity, peca, revisao);
    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(init.body as string);
    expect(init).toMatchObject({ method: 'PUT', headers: { 'X-Marca-Id': identity.marcaId } });
    expect(body).toEqual({
      schemaVersion: 1,
      expectedRevision: revisao,
      conteudo: projetarPecaSemMidias(peca),
      anexos: [],
    });
    expect(localStorage.getItem('rascunho-local-teste')).toBe('intacto');
    expect(peca.imagemCroquiUrl).toBe('blob:http://localhost/croqui');
  });

  it('criação envia expectedRevision:null e 409 é propagado sem nova requisição ou retry', async () => {
    responder(
      { code: 'REVISION_CONFLICT', message: 'Outra revisão', currentRevision: 'nova' },
      409
    );
    await expect(salvarRascunhoServidor(identity, makePeca(), null)).rejects.toBeInstanceOf(
      ApiError
    );
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body as string).expectedRevision).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('identidade local divergente não envia dados e resposta inválida não confirma sucesso', async () => {
    await expect(
      salvarRascunhoServidor(identity, { ...makePeca(), marcaId: 'outra-marca' }, null)
    ).rejects.toThrow(/identificadores/);
    expect(fetchMock).not.toHaveBeenCalled();
    responder(null);
    await expect(salvarRascunhoServidor(identity, makePeca(), null)).rejects.toThrow(
      /rascunho inválido/
    );
    responder({ ...snapshot(), identity: { ...identity, pecaId: 'outra' } });
    await expect(consultarRascunhoServidor(identity)).rejects.toThrow(/outra peça/);
  });

  it.each(['', ' peca', 'peca ', 'p\u0000eca', 'p\u007feca', 'a'.repeat(129)])(
    'identificador inválido %s e revisão com controles não fazem request',
    async (id) => {
      await expect(consultarRascunhoServidor({ ...identity, pecaId: id })).rejects.toThrow(
        /identificadores válidos/
      );
      await expect(salvarRascunhoServidor(identity, makePeca(), ' revisão')).rejects.toThrow(
        /revisão válida/
      );
      await expect(salvarRascunhoServidor(identity, makePeca(), 'revi\u0000sao')).rejects.toThrow(
        /revisão válida/
      );
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('histórico consulta cursor/limite válidos e recusa registros de outra peça', async () => {
    const eventoId = '881a2b82-acdb-4ca3-b796-f57d06a6b435';
    responder([{ eventoId, operation: 'CRIAR', antes: null, depois: snapshot() }]);
    const result = await consultarHistoricoRascunhoServidor(identity, {
      afterEventoId: eventoId,
      limit: 10,
    });
    expect(result).toHaveLength(1);
    expect(fetchMock.mock.calls[0]![0]).toContain(`/historico?limit=10&afterEventoId=${eventoId}`);
    await expect(consultarHistoricoRascunhoServidor(identity, { limit: 101 })).rejects.toThrow(
      /limite/
    );
    await expect(
      consultarHistoricoRascunhoServidor(identity, { afterEventoId: 'incorreto' })
    ).rejects.toThrow(/Cursor/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    responder([
      {
        eventoId,
        operation: 'ATUALIZAR',
        antes: snapshot(),
        depois: { ...snapshot(), identity: { ...identity, marcaId: 'outra' } },
      },
    ]);
    await expect(consultarHistoricoRascunhoServidor(identity)).rejects.toThrow(/outra peça/);
  });
});
