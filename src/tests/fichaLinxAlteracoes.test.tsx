import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { useFichaLinxAlteracoes } from '../pages/Home/components/useFichaLinxAlteracoes';
import { conteudoAlteracoesLinx } from '../services/fichaLinxAlteracoes';
import { api } from '../services/api';
import { marca, colecao, peca } from '../../tests/manual/precificacao/fixtures';
import type { PecaItem } from '../types/plm';
import type { FichaAnexo } from '../services/fichaAnexosStorage';

vi.mock('../services/api', () => ({
  api: {
    get: vi
      .fn()
      .mockResolvedValue({ subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] }),
    post: vi.fn(),
  },
}));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxCoresMostruario: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/fichaAnexosStorage', async (original) => ({
  ...(await original<typeof import('../services/fichaAnexosStorage')>()),
  listFichaAnexos: vi.fn().mockResolvedValue([]),
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
afterEach(cleanup);
const botao = () => screen.getByRole('button', { name: 'Integrar no Linx' }) as HTMLButtonElement;
async function abrir(item = peca, save = vi.fn()) {
  const view = render(
    <PecaFichaTecnicaView
      peca={item}
      colecao={colecao}
      marca={marca}
      onBack={() => {}}
      onUpdatePeca={save}
    />
  );
  await waitFor(() => expect(screen.queryByText('Conferindo alterações para o Linx…')).toBeNull());
  return view;
}
function hook(estado: PecaItem, anexos: FichaAnexo[] = []) {
  return renderHook(
    ({ item, arquivos }) =>
      useFichaLinxAlteracoes({
        peca: item,
        referencia: peca,
        anexos: arquivos,
        chave: 'teste',
        carregando: false,
      }),
    { initialProps: { item: estado, arquivos: anexos } }
  );
}

describe('Alterações pendentes para o Linx', () => {
  it('código integrado permanece fixo e editar a categoria preserva a referência antiga', async () => {
    const integrada = {
      ...structuredClone(peca),
      linxOrigem: { codigoProduto: peca.codigo, colecaoCodigo: '025', griffe: 'KING&JOE' as const },
      fichaTecnica: { ...structuredClone(peca.fichaTecnica), codigoReferencia: ' MODELO ' },
    };
    const save = vi.fn();
    await abrir(integrada, save);
    expect((screen.getByLabelText('Código do produto') as HTMLInputElement).readOnly).toBe(true);
    expect(screen.queryByLabelText('Código de Referência')).toBeNull();
    fireEvent.change(screen.getByLabelText('Categoria'), {
      target: { value: 'CATEGORIA DE TESTE' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    await waitFor(() => expect(save).toHaveBeenCalled());
    const salva = save.mock.calls.at(-1)![0] as PecaItem;
    expect(salva.codigo).toBe(peca.codigo);
    expect(salva.linxOrigem).toEqual(integrada.linxOrigem);
    expect(salva.fichaTecnica!.codigoReferencia).toBe(' MODELO ');
    expect(salva.fichaTecnica!.integracao!.categoria).toBe('CATEGORIA DE TESTE');
    expect(api.post).not.toHaveBeenCalled();
  });
  it('marca a alteração, abre a conferência sem enviar ao Linx e apaga ao desfazer', async () => {
    const save = vi.fn();
    await abrir(peca, save);
    expect(botao().disabled).toBe(true);
    expect(botao().getAttribute('data-pendente')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Variantes' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Selecionar variante Outra' }));
    expect(botao().disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Geral' }));
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'a' },
    });
    await waitFor(() => expect(botao().disabled).toBe(false));
    expect(botao().getAttribute('data-pendente')).toBe('true');
    fireEvent.click(botao());
    const dialog = within(screen.getByRole('dialog', { name: 'Integração Linx' }));
    expect(dialog.getByText(/Sem prévia confirmada não há gravação/)).toBeDefined();
    expect(dialog.getByRole('button', { name: 'Conferir envio ao Linx' })).toBeDefined();
    expect(api.post).not.toHaveBeenCalled();
    fireEvent.click(dialog.getByRole('button', { name: 'Entendi' }));
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: '' },
    });
    await waitFor(() => expect(botao().disabled).toBe(true));
  });

  it('continua pendente depois de salvar e reabrir a ficha', async () => {
    const save = vi.fn();
    const view = await abrir(peca, save);
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'a' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const salva = save.mock.calls[0]![0] as PecaItem;
    await waitFor(() => expect(botao().disabled).toBe(false));
    view.unmount();
    await abrir(salva);
    expect(botao().disabled).toBe(false);
    expect(api.post).not.toHaveBeenCalled();
  });

  it('abre a movimentação pelo resumo Etapa e detecta o avanço automático', async () => {
    const save = vi.fn();
    await abrir(peca, save);
    const resumo = within(screen.getByRole('group', { name: 'Resumo da ficha' }));
    fireEvent.click(resumo.getByRole('button', { name: 'Entregar / alterar etapa' }));
    expect(screen.getByRole('dialog', { name: 'Fluxos de etapas' })).toBeDefined();
    expect(screen.getByLabelText('Nova Etapa')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    await waitFor(() => expect(botao().disabled).toBe(false));
    expect(save).toHaveBeenCalledOnce();
    expect(api.post).not.toHaveBeenCalled();
  });

  it.each([
    [
      'informações',
      (p: PecaItem) => {
        p.fichaTecnica!.descricao = ' ';
      },
    ],
    [
      'etapa',
      (p: PecaItem) => {
        p.etapaAtual = '03 modelagem';
      },
    ],
    [
      'responsável',
      (p: PecaItem) => {
        p.responsavel = 'Outro';
      },
    ],
    [
      'insumo',
      (p: PecaItem) => {
        p.fichaTecnica!.variantes![0]!.tecidos[0]!.consumo = '2,0001';
      },
    ],
    [
      'preço',
      (p: PecaItem) => {
        p.preco = 0.01;
      },
    ],
    [
      'modelagem',
      (p: PecaItem) => {
        p.fichaTecnica!.observacoesModelagem = 'a';
      },
    ],
    [
      'corte',
      (p: PecaItem) => {
        p.fichaTecnica!.observacoesCorte = 'a';
      },
    ],
  ])('detecta mudanças mínimas em %s', async (_area, editar) => {
    const view = hook(peca);
    await waitFor(() => expect(view.result.current.carregando).toBe(false));
    const alterada = structuredClone(peca);
    editar(alterada);
    view.rerender({ item: alterada, arquivos: [] });
    await waitFor(() => expect(view.result.current.temAlteracoes).toBe(true));
  });

  it('arquivos e imagens ficam no portal e conclusão não representa um envio', async () => {
    const view = hook(peca);
    await waitFor(() => expect(view.result.current.carregando).toBe(false));
    const arquivo: FichaAnexo = {
      id: 'pdf',
      pieceKey: 'teste',
      categoria: 'projeto',
      nome: 'projeto.pdf',
      tamanho: 1,
      tipo: 'application/pdf',
      arquivo: new Blob(['a']),
      criadoEm: 1,
    };
    view.rerender({ item: peca, arquivos: [arquivo] });
    await act(async () => {});
    expect(view.result.current.temAlteracoes).toBe(false);
    view.rerender({ item: peca, arquivos: [] });
    await waitFor(() => expect(view.result.current.temAlteracoes).toBe(false));
    const comImagem = structuredClone(peca);
    comImagem.fichaTecnica!.variantes![0]!.imagemUrl = 'imagem-nova';
    await act(async () => view.rerender({ item: comImagem, arquivos: [] }));
    expect(view.result.current.temAlteracoes).toBe(false);
    const preparada = structuredClone(peca);
    preparada.fichaTecnica!.processo = {
      revisao: 'nova',
      integracaoPreparada: {
        revisao: 'nova',
        registradoEm: new Date().toISOString(),
        status: 'PENDENTE_MAPEAMENTO',
      },
    };
    await act(async () => view.rerender({ item: preparada, arquivos: [] }));
    expect(view.result.current.temAlteracoes).toBe(false);
  });

  it('usa o último recibo confirmado e ignora a ordem de propriedades e metadados de leitura', async () => {
    const integrada = structuredClone(peca);
    integrada.historicoIntegracoes = [
      {
        numero: 1,
        marcaId: marca.id,
        pecaId: peca.id,
        peca: structuredClone(peca),
        recibo: {
          status: 'CONFIRMADA',
          integracaoId: 'recibo-1',
          confirmadaEm: new Date().toISOString(),
          produto: 'TESTE',
          griffe: 'KING&JOE',
          colecaoId: colecao.id,
          descColecao: colecao.nome,
          colecaoLinxCodigo: '1',
          versaoLinx: '1',
        },
      },
    ];
    integrada.fichaTecnica!.descricao = 'Mudou';
    const view = hook(integrada);
    await waitFor(() => expect(view.result.current.temAlteracoes).toBe(true));
    const atualizada = structuredClone(integrada);
    const snapshot = structuredClone(integrada);
    delete snapshot.historicoIntegracoes;
    atualizada.historicoIntegracoes!.push({
      ...atualizada.historicoIntegracoes![0]!,
      numero: 2,
      peca: snapshot,
      recibo: {
        ...atualizada.historicoIntegracoes![0]!.recibo,
        integracaoId: 'recibo-2',
        versaoLinx: '2',
      },
    });
    view.rerender({ item: atualizada, arquivos: [] });
    await waitFor(() => expect(view.result.current.temAlteracoes).toBe(false));
    expect(
      conteudoAlteracoesLinx(
        { ...peca, fichaTecnica: { ...peca.fichaTecnica, linxVersaoImportada: '2' } },
        []
      )
    ).toBe(conteudoAlteracoesLinx(peca, []));
    expect(conteudoAlteracoesLinx({ ...peca, nome: peca.nome }, [])).toBe(
      conteudoAlteracoesLinx(peca, [])
    );
  });
});
