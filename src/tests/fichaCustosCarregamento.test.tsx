import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PecaFichaTecnicaView } from '../pages/Home/components/PecaFichaTecnicaView';
import { getLinxFichaAtual, getLinxFichaCustos } from '../services/linxService';
import type { LinxFichaCustos, LinxFichaDetalhe } from '../types/linx';
import type { ColecaoItem, PecaItem } from '../types/plm';
import { custosV2Fixture } from './fixtures/custosV2';
import type { MarcaSummary } from '../types/auth';

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      subgrupos: [],
      linhas: [],
      grades: [],
      griffes: [],
      categorias: [],
    }),
  },
}));
vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxModelagens: vi.fn().mockResolvedValue([]),
  getLinxFichaAtual: vi.fn(),
  getLinxFichaCustos: vi.fn(),
}));
vi.mock('../pages/Home/components/MostruarioColorsPicker', () => ({
  MostruarioColorsPicker: () => null,
}));

const marca: MarcaSummary = {
  id: 'm',
  nome: 'King & Joe',
  code: 'KJ',
  initials: 'KJ',
  colecoesCount: 0,
  pecasCount: 0,
  heroImageUrl: '',
  description: '',
  badgeTag: '',
};
const colecao: ColecaoItem = {
  id: 'c',
  marcaId: 'm',
  nome: 'Coleção teste',
  marcaNome: marca.nome,
  status: 'Completas',
  dataEntrega: '',
  diasAtraso: 0,
  regraFicha: 'legado',
};
const peca: PecaItem = {
  id: 'p',
  marcaId: 'm',
  colecaoId: 'c',
  codigo: 'TESTE',
  nome: 'Peça teste',
  tipo: 'Camisa',
  status: 'Completa',
  etapaAtual: '',
  tema: '',
  colecaoNome: colecao.nome,
  marcaNome: marca.nome,
  estilista: '',
  tecidos: [],
  previsaoEntrega: '',
  linxOrigem: { codigoProduto: 'TESTE', colecaoCodigo: '028', griffe: 'KING&JOE' },
  fichaTecnica: {
    linxVersaoImportada: '00001',
    variantes: [
      {
        id: 'principal',
        nome: 'Principal',
        tecidos: [
          {
            id: 'manual',
            nome: 'Tecido manual preservado',
            codigo: 'MAN',
            temErp: false,
            custo: '77',
            fornecedores: '',
            unidade: 'MT',
          },
        ],
        aviamentos: [],
      },
    ],
  },
};
const custos: LinxFichaCustos = {
  versao: {
    produto: 'TESTE',
    versao: '00001',
    descricao: null,
    dataCriacao: null,
    responsavel: null,
    status: null,
    colecaoCodigo: null,
    colecaoNome: null,
  },
  bancoOrigem: 'HOMOLOG_COBRANCA',
  tamanhos: [],
  materiais: [],
  fornecedores: [],
  operacoes: [],
  outrosCustos: [],
  precosProduto: [],
  diagnostico: [],
  avisos: [],
};
const ficha: LinxFichaDetalhe = { versao: custos.versao, materiais: [] };
const mount = (item = peca, collection = colecao, save = vi.fn()) =>
  render(
    <PecaFichaTecnicaView
      peca={item}
      colecao={collection}
      marca={marca}
      onBack={() => {}}
      onUpdatePeca={save}
    />
  );

describe('Consulta de custos separada do rascunho', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLinxFichaAtual).mockResolvedValue(ficha);
    vi.mocked(getLinxFichaCustos).mockResolvedValue(custos);
  });
  it('mostra custos Linx e precificação no cabeçalho ainda em Geral, sem exigir preço manual importado', async () => {
    vi.mocked(getLinxFichaCustos).mockResolvedValue(custosV2Fixture());
    mount({
      ...peca,
      fichaTecnica: {
        ...peca.fichaTecnica,
        variantes: [{ id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [] }],
      },
    });
    await waitFor(() => expect(getLinxFichaCustos).toHaveBeenCalledOnce());
    const cabecalho = within(screen.getByRole('group', { name: 'Resumo da ficha' }));
    await waitFor(() => expect(cabecalho.getByText(/115,0000/)).toBeDefined());
    expect(cabecalho.getByText(/293,5500/)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Precificação' }));
    const tabela = screen.getByRole('table', { name: 'Precificação — Principal' });
    await waitFor(() => expect(within(tabela).getByText(/103,0000/)).toBeDefined());
    expect(screen.queryByText(/Preencha preço/)).toBeNull();
  });
  it('salva a seleção e os ajustes locais, compartilha o custo com Precificação e preserva o preço manual', async () => {
    const dados = custosV2Fixture(),
      original = structuredClone(dados),
      save = vi.fn();
    vi.mocked(getLinxFichaCustos).mockResolvedValue(dados);
    const view = mount(peca, colecao, save);
    fireEvent.click(screen.getByRole('button', { name: 'Custos' }));
    await screen.findByLabelText('Base dos custos');
    fireEvent.change(screen.getByLabelText('Base dos custos'), { target: { value: 'linx' } });
    fireEvent.change(screen.getByLabelText('Tamanho', { exact: true }), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Quantidade a ser produzida'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Custo de Corte'), { target: { value: '2,5' } });
    const resumo = screen.getByRole('table', { name: 'Resumo dos custos — Principal' });
    expect(
      within(resumo).getByRole('rowheader', { name: 'Total' }).closest('tr')?.textContent
    ).toContain('549,0000');
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    const saved = save.mock.calls.at(-1)![0] as PecaItem;
    expect(saved.fichaTecnica!.variantes![0]!.custos).toMatchObject({
      fonte: 'linx',
      posicao: 2,
      quantidadeProducao: '3',
    });
    expect(saved.fichaTecnica!.variantes![0]!.tecidos[0]!.custo).toBe('77');
    expect(saved.historicoAlteracoes?.some((evento) => evento.secao === 'Custos')).toBe(true);
    view.unmount();
    mount(saved, colecao, save);
    fireEvent.click(screen.getByRole('button', { name: 'Precificação' }));
    const tabela = screen.getByRole('table', { name: 'Precificação — Principal' });
    await waitFor(() => expect(within(tabela).getByText(/153,0000/)).toBeDefined());
    fireEvent.change(screen.getByLabelText('Base do cálculo'), { target: { value: 'producao' } });
    expect(within(tabela).getByText(/183,0000/)).toBeDefined();
    expect(within(tabela).getByText(/521,5500/)).toBeDefined();
    expect(dados).toEqual(original);
  });
  it('consulta já em Geral usando a identidade exata sem substituir preço manual', async () => {
    const save = vi.fn();
    mount(peca, colecao, save);
    await waitFor(() =>
      expect(getLinxFichaCustos).toHaveBeenCalledWith(
        'TESTE',
        '00001',
        'KING&JOE',
        '028',
        colecao.nome,
        true
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    await waitFor(() =>
      expect(screen.queryByText('Consultando preços e custos no Linx…')).toBeNull()
    );
    expect(screen.getByText('R$ 77 / MT')).toBeDefined();
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Geral' }));
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'Edição após consultar os custos' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(save.mock.calls[0]![0].fichaTecnica.variantes[0].tecidos[0].custo).toBe('77');
    expect(save.mock.calls[0]![0].fichaTecnica.linxVersaoImportada).toBe('00001');
  });
  it('rascunho sem versão identifica a ficha atual somente para consultar custos', async () => {
    const save = vi.fn();
    mount(
      { ...peca, fichaTecnica: { ...peca.fichaTecnica, linxVersaoImportada: undefined } },
      colecao,
      save
    );
    fireEvent.click(screen.getByRole('button', { name: 'Custos' }));
    await screen.findByText('HOMOLOG_COBRANCA');
    expect(getLinxFichaAtual).toHaveBeenCalledWith('TESTE', 'KING&JOE', '028', colecao.nome);
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Geral' }));
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'Edição sem versão vinculada' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(save.mock.calls[0]![0].fichaTecnica.linxVersaoImportada).toBeUndefined();
    expect(save.mock.calls[0]![0].fichaTecnica.variantes[0].tecidos[0].custo).toBe('77');
  });
  it('nova coleção sem integração não busca custos de versões antigas', async () => {
    mount(
      { ...peca, fichaTecnica: { ...peca.fichaTecnica, linxVersaoImportada: undefined } },
      { ...colecao, regraFicha: 'integracao-colecao-v1' }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Custos' }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(getLinxFichaAtual).not.toHaveBeenCalled();
    expect(getLinxFichaCustos).not.toHaveBeenCalled();
  });
  it('legado recarrega a versão atual para custos mas mantém a versão e os insumos do rascunho', async () => {
    const save = vi.fn();
    vi.mocked(getLinxFichaAtual).mockResolvedValue({
      ...ficha,
      versao: { ...ficha.versao, versao: '00003' },
    });
    vi.mocked(getLinxFichaCustos).mockResolvedValue({
      ...custos,
      versao: { ...custos.versao, versao: '00003' },
    });
    mount(peca, colecao, save);
    fireEvent.click(screen.getByRole('button', { name: 'Custos' }));
    await waitFor(() =>
      expect(getLinxFichaCustos).toHaveBeenCalledWith(
        'TESTE',
        '00003',
        'KING&JOE',
        '028',
        colecao.nome,
        true
      )
    );
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Geral' }));
    fireEvent.change(screen.getByLabelText('Descrição', { exact: true }), {
      target: { value: 'Edição preservando a versão do rascunho' },
    });
    fireEvent.blur(screen.getByRole('group', { name: 'Ficha técnica' }));
    expect(save.mock.calls[0]![0].fichaTecnica.linxVersaoImportada).toBe('00001');
    expect(save.mock.calls[0]![0].fichaTecnica.variantes[0].tecidos[0].custo).toBe('77');
  });
  it('falha nos custos é visível nos insumos e permite nova consulta sem apagar os dados', async () => {
    vi.mocked(getLinxFichaCustos).mockRejectedValueOnce(new Error('Consulta indisponível'));
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Tecidos' }));
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      expect.stringContaining('Consulta indisponível')
    );
    expect(screen.getByText('R$ 77 / MT')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar consultar novamente' }));
    await waitFor(() => expect(getLinxFichaCustos).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});
