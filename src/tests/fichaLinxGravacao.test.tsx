import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { api } from '../services/api';
import {
  aplicarReciboCamposMapeados,
  aplicarReciboNovaVersao,
  prepararGravacaoDireta,
  prepararNovaVersao,
  validarReciboGravacao,
} from '../services/fichaLinxGravacao';
import { LinxIntegrationDialog } from '../pages/Home/components/LinxIntegrationDialog';
import { confirmarAusentesTeste } from './fixtures/conferencia';
import { peca, colecao } from '../../tests/manual/precificacao/fixtures';
import type { PecaItem } from '../types/plm';
import type { LinxWritePreview, LinxWriteReceipt } from '../types/linxGravacao';

vi.mock('../services/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));
const collection = { ...colecao, griffe: 'KING&JOE' as const };
function integrated(): PecaItem {
  const item = structuredClone(peca);
  item.codigo = 'TESTE01';
  item.linxOrigem = { codigoProduto: 'TESTE01', griffe: 'KING&JOE', colecaoCodigo: 'TESTE' };
  item.fichaTecnica!.nomeProduto = 'Nome de teste';
  item.fichaTecnica!.linxVersaoImportada = '00001';
  item.fichaTecnica!.linxColecaoOrigem = 'TESTE';
  item.fichaTecnica!.tamanhos = ['P', 'M'];
  item.fichaTecnica!.gradeLinx = {
    grade: 'PM',
    numeroTamanhos: 2,
    posicoes: [
      { posicao: 1, tamanho: 'P' },
      { posicao: 2, tamanho: null },
      { posicao: 3, tamanho: 'M' },
    ],
  };
  item.fichaTecnica!.conferencia = { gradeCompleta: true };
  const principal = item.fichaTecnica!.variantes![0]!;
  principal.aviamentos = [];
  principal.tecidos[0] = {
    ...principal.tecidos[0]!,
    codigo: 'M1',
    uso: 'Corpo',
    consumoPorTamanho: { P: { valor: '1' }, M: { valor: '2' } },
    linxDados: {
      codigo: 'M1',
      item: '0001',
      nome: 'Tecido teste',
      grupo: 'TECIDO',
      cores: [],
      dados: {
        PRODUTO: 'TESTE01',
        VERSAO_FICHA: '00001',
        DESC_USO_MATERIAL: 'Corpo',
        C1: 1,
        C3: 2,
      },
    },
  };
  item.fichaTecnica!.processo = {
    revisao: 'r1',
    concluida: {
      revisao: 'r1',
      registradoEm: '2026-10-15T12:00:00Z',
      responsavel: { id: 'u', nome: 'Teste' },
    },
  };
  return confirmarAusentesTeste(item);
}
const preview: LinxWritePreview = {
  planoId: 'e9ec05cc-8b5a-4e7b-a184-bd0cb7ed272e',
  expiraEm: '2099-10-15T12:00:00Z',
  identidade: {
    produto: 'TESTE01',
    griffe: 'KING&JOE',
    colecao: 'TESTE',
    descColecao: collection.nome,
    versao: '00001',
  },
  exigeConfirmacaoGlobal: false,
  avisos: ['Custo continua somente no portal.'],
  alteracoes: [
    {
      tabela: 'PRODUTO_VERSAO_MATERIAL',
      chave: { MATERIAL: 'M1', ITEM: '0001' },
      campo: 'DESC_USO_MATERIAL',
      antes: 'Corpo',
      depois: 'Novo uso',
      exclusao: false,
    },
  ],
};
const receipt: LinxWriteReceipt = {
  status: 'CONFIRMADA',
  escopo: 'CAMPOS_MAPEADOS',
  integracaoId: 'real-receipt-test',
  confirmadaEm: '2026-10-15T12:00:00Z',
  identidade: preview.identidade,
  camposGravados: 1,
  avisos: [],
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.get).mockResolvedValue({
    habilitada: true,
    servidor: '192.168.1.3:1433',
    banco: 'HOMOLOGACAO_ATUAL',
  });
  vi.mocked(api.post).mockImplementation(
    async <T,>(path: string) =>
      (path.endsWith('/preparar') ? structuredClone(preview) : structuredClone(receipt)) as T
  );
});
afterEach(cleanup);
describe('Contrato do gravador direto da Principal', () => {
  it('projeta apenas campos conhecidos, sem arquivos, preço, fiscal, categoria ou variantes locais', () => {
    const item = integrated();
    item.fichaTecnica!.descricao = 'Descrição local';
    item.fichaTecnica!.integracao = { categoria: 'Categoria local' };
    item.fichaTecnica!.variantes![1]!.nome = 'Variante privada';
    const request = prepararGravacaoDireta(item, item, collection);
    expect(request.alteracoes).toEqual([]);
    // O preço aparece somente na conferência já existente, nunca como valor a gravar.
    expect(request.conferencia.variantes).toHaveLength(1);
    expect(JSON.stringify(request.alteracoes)).not.toMatch(
      /custo|preco|categoria|Variante privada|CLASSIF_FISCAL|tribut/i
    );
  });
  it('mapeia apenas o consumo alterado na posição real da grade, sem compactar posições vazias', () => {
    const item = integrated();
    item.fichaTecnica!.variantes![0]!.tecidos[0]!.consumoPorTamanho!.M!.valor = '2,5';
    const request = prepararGravacaoDireta(confirmarAusentesTeste(item), item, collection);
    expect(request.alteracoes[0]).toMatchObject({
      chave: { MATERIAL: 'M1', ITEM: '0001' },
      valores: { C3: '2,5' },
    });
    expect(request.alteracoes[0]!.valores).not.toHaveProperty('C1');
  });
  it('não transforma ausência em zero nem inventa cadastro fiscal ou chave de material novo', () => {
    const fresh = integrated();
    fresh.linxOrigem = undefined;
    expect(() => prepararGravacaoDireta(fresh, fresh, collection)).toThrow(/Produto novo depende/);
    const item = integrated();
    item.fichaTecnica!.variantes![0]!.tecidos[0]!.linxDados = undefined;
    expect(() => prepararGravacaoDireta(item, item, collection)).toThrow(/item, fase e setor/);
    const erased = integrated();
    erased.fichaTecnica!.variantes![0]!.tecidos[0]!.consumoPorTamanho!.M!.valor = '';
    expect(() =>
      prepararGravacaoDireta(confirmarAusentesTeste(erased), erased, collection)
    ).toThrow(/vazio não será convertido/);
  });
  it('descarte depende de confirmação explícita; omissão não é pedido de exclusão', () => {
    const base = integrated();
    const item = integrated();
    item.fichaTecnica!.variantes![0]!.tecidos = [];
    confirmarAusentesTeste(item);
    expect(() => prepararGravacaoDireta(item, base, collection)).toThrow(/Confirme expressamente/);
    expect(prepararGravacaoDireta(item, base, collection, true).alteracoes[0]).toMatchObject({
      excluir: true,
      descarteConfirmado: true,
      chave: { MATERIAL: 'M1', ITEM: '0001' },
    });
  });
  it('recusa troca de griffe, coleção ou origem da linha sem enviar', () => {
    const item = integrated();
    item.fichaTecnica!.variantes![0]!.tecidos[0]!.linxDados!.dados.VERSAO_FICHA = '00002';
    expect(() => prepararGravacaoDireta(item, item, collection)).toThrow(/origem do insumo/);
    const wrong = integrated();
    wrong.fichaTecnica!.linxColecaoOrigem = 'OUTRA';
    expect(() => prepararGravacaoDireta(wrong, wrong, collection)).toThrow(/vínculo explícito/);
  });
  it('não aceita recibo de outra ficha e não cria histórico de versão por atualização parcial', () => {
    expect(() =>
      validarReciboGravacao(
        { ...receipt, identidade: { ...receipt.identidade, produto: 'OUTRO' } },
        preview
      )
    ).toThrow(/confirmação válida/);
    const item = integrated();
    const saved = aplicarReciboCamposMapeados(item, preview, receipt);
    expect(saved.linxUltimaGravacao).toEqual(receipt);
    expect(saved.historicoIntegracoes).toBeUndefined();
    expect(saved.fichaTecnica!.variantes![0]!.tecidos[0]!.linxDados!.dados.DESC_USO_MATERIAL).toBe(
      'Novo uso'
    );
    expect(item.fichaTecnica!.variantes![0]!.tecidos[0]!.linxDados!.dados.DESC_USO_MATERIAL).toBe(
      'Corpo'
    );
  });
});
async function open() {
  const item = integrated();
  const onConfirmada = vi.fn().mockResolvedValue(undefined);
  const props = {
    peca: item,
    referencia: item,
    colecao: collection,
    marcaId: item.marcaId!,
    onClose: vi.fn(),
    onConfirmada,
  };
  const view = render(<LinxIntegrationDialog {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Conferir envio ao Linx' }));
  return { view, props, onConfirmada };
}
describe('Confirmação visual da gravação', () => {
  it('apresenta prévia sem operações globais e exige consentimento antes de confirmar', async () => {
    const { onConfirmada } = await open();
    await screen.findByRole('region', { name: 'Prévia da gravação' });
    const send = screen.getByRole('button', {
      name: 'Confirmar gravação',
    }) as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    expect(api.post).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText(/Conferi o antes e depois/));
    expect(send.disabled).toBe(false);
    fireEvent.click(send);
    await screen.findByText(/Gravação dos campos mapeados confirmada pelo backend/);
    expect(api.post).toHaveBeenLastCalledWith(
      '/linx/integracao/confirmar',
      {
        planoId: preview.planoId,
        confirmar: true,
        confirmarCadastroCompartilhado: false,
      },
      'precificacao-marca'
    );
    expect(onConfirmada).toHaveBeenCalledWith(receipt, preview);
  });
  it('gravador desligado não envia pedido de preparação ou gravação', async () => {
    vi.mocked(api.get).mockResolvedValue({
      habilitada: false,
      mensagem: 'Aguardando aprovação no .6.',
    });
    await open();
    expect((await screen.findByRole('alert')).textContent).toContain('Aguardando aprovação no .6.');
    expect(api.post).not.toHaveBeenCalled();
  });
  it('mudança após a prévia bloqueia a confirmação', async () => {
    const { view, props } = await open();
    await screen.findByRole('region', { name: 'Prévia da gravação' });
    const changed = structuredClone(props.peca);
    changed.fichaTecnica!.nomeProduto = 'Alterado durante a prévia';
    view.rerender(<LinxIntegrationDialog {...props} peca={changed} />);
    expect(screen.getByRole('alert').textContent).toMatch(/mudou depois da prévia/);
    expect(
      (screen.getByRole('button', { name: 'Confirmar gravação' }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
  it('falha ao confirmar não simula sucesso nem reenvia automaticamente', async () => {
    const { onConfirmada } = await open();
    await screen.findByRole('region', { name: 'Prévia da gravação' });
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Resposta perdida'));
    fireEvent.click(screen.getByLabelText(/Conferi o antes e depois/));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar gravação' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toMatch(/Consulte o estado no Linx/)
    );
    expect(onConfirmada).not.toHaveBeenCalled();
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/Gravação dos campos mapeados confirmada/)).toBeNull();
  });
  it('recusa uma prévia que tente atingir um cadastro global', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ ...preview, exigeConfirmacaoGlobal: true });
    await open();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'cadastro global compartilhado'
    );
    expect(screen.queryByRole('button', { name: 'Confirmar gravação' })).toBeNull();
  });
});

describe('Mesma referência, versões independentes por coleção', () => {
  const newCollection = { ...collection, regraFicha: 'integracao-colecao-v1' as const };
  function fresh() {
    const item = integrated();
    item.id = 'f24cbbad-63db-474a-b3a3-cf329698156a';
    item.linxReferenciaCopia = {
      ...preview.identidade,
      colecao: 'ORIGEM',
      descColecao: 'Coleção anterior',
    };
    delete item.linxOrigem;
    delete item.fichaTecnica!.linxVersaoImportada;
    delete item.fichaTecnica!.linxColecaoOrigem;
    return item;
  }
  it('reutilizar o código gera pedido de NOVA versão, não atualização da origem', () => {
    const item = fresh();
    const before = structuredClone(item);
    const request = prepararNovaVersao(item, item, newCollection, 'DEST', 'Ficha nova');
    expect(request.origem).toEqual(item.linxReferenciaCopia);
    expect(request.destino).toEqual({ colecao: 'DEST', descColecao: collection.nome });
    expect(request.alteracoes).toEqual([]);
    expect(request.pecaId).toBe(item.id);
    expect(item).toEqual(before);
    expect(item.linxOrigem).toBeUndefined();
  });
  it('recusa a coleção de referência como destino e uma peça já integrada', () => {
    const item = fresh();
    expect(() => prepararNovaVersao(item, item, newCollection, 'ORIGEM', 'Ficha')).toThrow(
      /diferente da referência/
    );
    expect(() =>
      prepararNovaVersao(integrated(), integrated(), newCollection, 'DEST', 'Ficha')
    ).toThrow(/já possui versão própria/);
  });
  it('vincula e rebaseia somente após recibo real da nova versão, preservando a origem', () => {
    const item = fresh();
    const before = structuredClone(item);
    const versionPreview = {
      ...preview,
      identidade: { ...preview.identidade, colecao: 'DEST', versao: '00005' },
    };
    const versionReceipt: LinxWriteReceipt = {
      ...receipt,
      escopo: 'NOVA_VERSAO_COLECAO',
      integracaoId: item.id,
      identidade: versionPreview.identidade,
    };
    const saved = aplicarReciboNovaVersao(item, newCollection, versionPreview, versionReceipt);
    expect(item).toEqual(before);
    expect(saved.linxOrigem?.colecaoCodigo).toBe('DEST');
    expect(saved.fichaTecnica!.linxVersaoImportada).toBe('00005');
    expect(saved.fichaTecnica!.variantes![0]!.tecidos[0]!.linxDados!.dados.VERSAO_FICHA).toBe(
      '00005'
    );
    expect(saved.historicoIntegracoes).toHaveLength(1);
    expect(saved.linxReferenciaCopia).toEqual(item.linxReferenciaCopia);
    expect(() =>
      aplicarReciboNovaVersao(
        { ...item, colecaoId: 'OUTRA' },
        newCollection,
        versionPreview,
        versionReceipt
      )
    ).toThrow(/não pertence/);
  });
  it('usa as rotas de criação, sem confirmar ou marcar a versão ao abrir a tela', async () => {
    const item = fresh();
    const versionPreview = {
      ...preview,
      identidade: { ...preview.identidade, colecao: 'DEST', versao: '00005' },
    };
    const versionReceipt = {
      ...receipt,
      escopo: 'NOVA_VERSAO_COLECAO',
      integracaoId: item.id,
      identidade: versionPreview.identidade,
    };
    vi.mocked(api.post).mockImplementation(
      async <T,>(path: string) =>
        (path.endsWith('/preparar') ? versionPreview : versionReceipt) as T
    );
    const onConfirmada = vi.fn().mockResolvedValue(undefined);
    render(
      <LinxIntegrationDialog
        peca={item}
        referencia={item}
        colecao={newCollection}
        marcaId={item.marcaId!}
        onClose={vi.fn()}
        onConfirmada={onConfirmada}
      />
    );
    expect(api.post).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Código Linx da coleção de destino'), {
      target: { value: 'DEST' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Conferir envio ao Linx' }));
    await screen.findByRole('region', { name: 'Prévia da gravação' });
    expect(api.post).toHaveBeenCalledWith(
      '/linx/integracao/versoes/preparar',
      expect.objectContaining({
        pecaId: item.id,
        destino: { colecao: 'DEST', descColecao: collection.nome },
      }),
      item.marcaId
    );
    expect(onConfirmada).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(/Conferi o antes e depois/));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar nova versão' }));
    await screen.findByText('Nova versão da coleção confirmada pelo backend.');
    expect(api.post).toHaveBeenLastCalledWith(
      '/linx/integracao/versoes/confirmar',
      { planoId: preview.planoId, confirmar: true, confirmarCadastroCompartilhado: false },
      item.marcaId
    );
    expect(onConfirmada).toHaveBeenCalledWith(versionReceipt, versionPreview);
  });
});
