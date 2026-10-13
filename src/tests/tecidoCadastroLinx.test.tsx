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
import { CriarTecidoModal } from '../pages/Gestao/modals/CriarTecidoModal';
import { useTecidosGestao } from '../pages/Gestao/hooks/useTecidosGestao';
import { useAviamentosGestao } from '../pages/Gestao/hooks/useAviamentosGestao';
import { FichaInsumoCard } from '../pages/Home/components/FichaInsumoCard';
import {
  getLinxMaterialCadastro,
  getLinxFornecedores,
  getLinxCoresBasicas,
} from '../services/linxService';
import { createInsumo, getInsumos } from '../services/plmService';
import type { LinxMaterialCadastro, LinxMaterialCorCadastro } from '../types/linx';
import type { TecidoInsumoItem } from '../types/gestao';

vi.mock('../services/linxService', async (original) => ({
  ...(await original<typeof import('../services/linxService')>()),
  getLinxMaterialCadastro: vi.fn(),
  getLinxFornecedores: vi.fn(),
  getLinxCoresBasicas: vi.fn().mockResolvedValue([]),
}));
vi.mock('../services/plmService', () => ({
  createInsumo: vi.fn(),
  getInsumos: vi.fn(),
  deleteInsumo: vi.fn(),
}));

function cor(codigo: string, gramatura: number | null): LinxMaterialCorCadastro {
  return {
    MATERIAL: 'MAT-TESTE',
    CODIGO_COR: codigo,
    NOME_COR: 'Cor de teste',
    GRAMATURA: gramatura,
    TEC_ENCOLHIMENTO_CORTE_X: 0,
    TEC_ENCOLHIMENTO_CORTE_Y: 2,
    TEC_ENCOLHIMENTO_ACABAMENTO_X: null,
    TEC_ENCOLHIMENTO_ACABAMENTO_Y: null,
    TEC_ENCOLHIMENTO_LAVAGEM_X: null,
    TEC_ENCOLHIMENTO_LAVAGEM_Y: null,
  };
}
function material(unidade = 'KG'): LinxMaterialCadastro {
  return {
    codigo: 'MAT-TESTE',
    nome: 'Material retornado',
    grupo: 'TECIDOS',
    unidadeEstoque: unidade,
    unidadeFichaTecnica: unidade,
    largura: 1.5,
    comprimento: null,
    altura: null,
    rendimento: null,
    cores: [cor('C01', 200), cor('C02', 250), cor('C03', null)],
  };
}
function tecido(): TecidoInsumoItem {
  return {
    id: 'insumo-1',
    nome: 'Nome anterior',
    codigo: 'MAT-TESTE',
    temErp: false,
    custo: '14.9799',
    unidade: 'Kg',
    fornecedores: '',
    composicoesList: [{ id: 'comp-1', composicao: 'Algodão', porcentagem: '100' }],
    propriedades: {
      gramatura: '310',
      largura: '1.4',
      rendimento1: '',
      rendimento2: '',
      construcao: 'Construção manual',
      encolhimento: 'Valor anterior',
    },
  };
}
const input = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const seletorCores = (tipo = 'tecido') =>
  screen.getByRole('combobox', { name: `Cores do ${tipo} no Linx` });
function alternarCor(codigo: string, tipo = 'tecido') {
  const seletor = seletorCores(tipo);
  if (seletor.getAttribute('aria-expanded') !== 'true') fireEvent.click(seletor);
  fireEvent.click(screen.getByRole('option', { name: new RegExp(`\\(${codigo}\\)$`) }));
}
function adicionarCorPersonalizada(nome = 'Cor exclusiva') {
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar cor personalizada' }));
  fireEvent.change(input('Nome da cor'), { target: { value: nome } });
  fireEvent.change(input('Hexadecimal da cor'), { target: { value: '#123456' } });
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Selecionar ou criar cor' })).getByRole('button', {
      name: 'Adicionar',
    })
  );
}
async function pesquisar() {
  fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
  await waitFor(() => expect(screen.getByText(/^Material encontrado/)).toBeDefined());
}
function selecionarFornecedorDoCadastro(nome: string) {
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar fornecedor' }));
  fireEvent.focus(screen.getByRole('combobox', { name: 'Fornecedor' }));
  fireEvent.click(screen.getByRole('option', { name: nome }));
}
beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
  vi.mocked(getLinxMaterialCadastro).mockResolvedValue(material());
  vi.mocked(getLinxCoresBasicas).mockResolvedValue([]);
  vi.mocked(getInsumos).mockResolvedValue([]);
});
afterEach(cleanup);

describe('cadastro de tecido por código e cor Linx', () => {
  it.each(['tecido', 'aviamento'] as const)(
    'permite selecionar todos, desmarcar individualmente e salvar/reabrir múltiplas cores de %s',
    async (tipo) => {
      const save = vi.fn();
      const view = render(
        <CriarTecidoModal
          isOpen
          tipo={tipo}
          editingTecido={tecido()}
          onClose={vi.fn()}
          onSave={save}
        />
      );
      await pesquisar();
      fireEvent.click(seletorCores(tipo));
      expect(screen.getByRole('listbox').getAttribute('aria-multiselectable')).toBe('true');
      fireEvent.click(screen.getByRole('option', { name: 'Selecionar todos' }));
      expect(seletorCores(tipo).textContent).toContain('3 selecionados');
      expect(screen.getByRole('option', { name: /\(C01\)$/ }).getAttribute('aria-selected')).toBe(
        'true'
      );
      alternarCor('C02', tipo);
      expect(seletorCores(tipo).textContent).toContain('2 selecionados');
      expect(screen.getByRole('option', { name: /\(C02\)$/ }).getAttribute('aria-selected')).toBe(
        'false'
      );
      fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
      const salvo = save.mock.calls[0]![0] as TecidoInsumoItem;
      expect(salvo.coresList?.map((cor) => cor.codigo)).toEqual(['C01', 'C03']);
      view.rerender(
        <CriarTecidoModal
          isOpen
          tipo={tipo}
          editingTecido={salvo}
          onClose={vi.fn()}
          onSave={save}
        />
      );
      expect(seletorCores(tipo).textContent).toContain('2 selecionados');
      await pesquisar();
      expect(seletorCores(tipo).textContent).toContain('2 selecionados');
      if (seletorCores(tipo).getAttribute('aria-expanded') !== 'true')
        fireEvent.click(seletorCores(tipo));
      expect(screen.getByRole('option', { name: /\(C01\)$/ }).getAttribute('aria-selected')).toBe(
        'true'
      );
      expect(screen.getByRole('option', { name: /\(C03\)$/ }).getAttribute('aria-selected')).toBe(
        'true'
      );
    }
  );

  it('mantém o dropdown aberto ao marcar várias cores e Escape fecha somente o seletor, não o cadastro', async () => {
    const close = vi.fn();
    render(<CriarTecidoModal isOpen editingTecido={tecido()} onClose={close} onSave={vi.fn()} />);
    await pesquisar();
    const seletor = seletorCores();
    fireEvent.keyDown(seletor, { key: 'ArrowDown' });
    fireEvent.keyDown(seletor, { key: 'ArrowDown' });
    fireEvent.keyDown(seletor, { key: 'Enter' });
    fireEvent.keyDown(seletor, { key: 'ArrowDown' });
    fireEvent.keyDown(seletor, { key: ' ' });
    expect(seletor.textContent).toContain('2 selecionados');
    fireEvent.keyDown(seletor, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Cadastro de tecido' })).toBeDefined();
  });
  it('não escolhe a primeira cor; muda a gramatura pela cor exata e preserva os campos manuais ao salvar e reabrir', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue({ ...material(), largura: '1,5' });
    const save = vi.fn();
    const view = render(
      <CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={save} />
    );
    await pesquisar();
    expect(getLinxMaterialCadastro).toHaveBeenCalledWith('MAT-TESTE');
    expect(input('Gramatura (g/m²)').value).toBe('');
    expect(input('Gramatura (g/m²)').readOnly).toBe(true);
    const escolher = alternarCor;
    escolher('C01');
    expect(input('Gramatura (g/m²)').value).toBe('200');
    expect(input('Rendimento (m²/kg)').value).toBe('5.00');
    expect(input('Rendimento (m/kg)').value).toBe('3.33');
    expect(input('Encolhimento').value).toBe('Corte X: 0, Y: 2');
    escolher('C02');
    expect(input('Gramatura (g/m²)').value).toBe('250');
    expect(input('Rendimento (m²/kg)').value).toBe('4.00');
    expect(input('Rendimento (m/kg)').value).toBe('2.67');
    expect(input('Construção').value).toBe('Construção manual');
    expect(input('Construção').readOnly).toBe(false);
    fireEvent.change(input('Construção'), { target: { value: 'Construção revisada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    const salvo = save.mock.calls[0]![0] as TecidoInsumoItem;
    expect(salvo.propriedades).toMatchObject({
      gramatura: '250',
      construcao: 'Construção revisada',
      origemLinx: { materialCodigo: 'MAT-TESTE', corCodigo: 'C02', corNome: 'Cor de teste' },
    });
    expect(salvo.composicoesList).toEqual(tecido().composicoesList);
    expect(salvo.coresList?.map((item) => item.codigo)).toEqual(['C01', 'C02']);
    view.rerender(
      <CriarTecidoModal isOpen editingTecido={salvo} onClose={vi.fn()} onSave={save} />
    );
    expect(input('Gramatura (g/m²)').value).toBe('250');
    expect(seletorCores().textContent).toContain('2 selecionados');
    expect(input('Construção').value).toBe('Construção revisada');
  });

  it('deixa a gramatura ausente vazia e não mostra nem salva rendimento para tecido em metros', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(material('M'));
    const save = vi.fn();
    render(<CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={save} />);
    await pesquisar();
    alternarCor('C01');
    expect(input('Gramatura (g/m²)').value).toBe('200');
    alternarCor('C03');
    expect(input('Gramatura (g/m²)').value).toBe('');
    expect(screen.getByText('Gramatura não informada no Linx para esta cor.')).toBeDefined();
    expect(screen.queryByLabelText('Rendimento (m²/kg)')).toBeNull();
    expect(screen.queryByLabelText('Rendimento (m/kg)')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(save.mock.calls[0]![0].propriedades).toMatchObject({
      gramatura: '',
      rendimento1: '',
      rendimento2: '',
    });
  });

  it('descarta uma resposta atrasada se o código mudar ou o modal fechar', async () => {
    let resolver!: (value: LinxMaterialCadastro) => void;
    vi.mocked(getLinxMaterialCadastro).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        })
    );
    const save = vi.fn();
    const view = render(
      <CriarTecidoModal isOpen editingTecido={null} onClose={vi.fn()} onSave={save} />
    );
    fireEvent.change(input('Código'), { target: { value: 'MAT-TESTE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
    fireEvent.change(input('Código'), { target: { value: 'NOVO-CODIGO' } });
    await act(async () => resolver(material()));
    expect(input('Código').value).toBe('NOVO-CODIGO');
    expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
    view.rerender(
      <CriarTecidoModal isOpen={false} editingTecido={null} onClose={vi.fn()} onSave={save} />
    );
    await act(async () => resolver(material()));
    view.rerender(<CriarTecidoModal isOpen editingTecido={null} onClose={vi.fn()} onSave={save} />);
    expect(input('Código').value).toBe('');
    expect(input('Gramatura (g/m²)').value).toBe('');
  });
});

describe('detalhes do tecido no navegador', () => {
  it('mantém propriedades, cor, composição e preço completo após criar e recarregar a listagem', async () => {
    const completo = tecido();
    completo.precoLinx = {
      materialCodigo: completo.codigo,
      corCodigo: 'C02',
      fonte: 'MATERIAIS_CORES.CUSTO_REPOSICAO',
      valor: completo.custo,
      unidade: 'KG',
    };
    completo.propriedades!.origemLinx = {
      materialCodigo: 'MAT-TESTE',
      corCodigo: 'C02',
      corNome: 'Cor de teste',
    };
    const retornoApi: TecidoInsumoItem = {
      id: '42',
      nome: completo.nome,
      codigo: completo.codigo,
      temErp: false,
      fornecedores: '',
      custo: 'R$ 14,98',
      unidade: 'Kg',
    };
    vi.mocked(createInsumo).mockResolvedValue(retornoApi);
    const view = renderHook(useTecidosGestao);
    await waitFor(() => expect(view.result.current.isLoadingTecidos).toBe(false));
    await act(async () => {
      await view.result.current.addTecido(completo);
    });
    expect(createInsumo).toHaveBeenCalledWith(expect.objectContaining({ custo: 14.9799 }));
    expect(view.result.current.tecidosList[0]).toMatchObject({
      id: '42',
      custo: completo.custo,
      propriedades: completo.propriedades,
      composicoesList: completo.composicoesList,
      precoLinx: completo.precoLinx,
    });
    view.unmount();
    vi.mocked(getInsumos).mockResolvedValue([retornoApi]);
    const recarregado = renderHook(useTecidosGestao);
    await waitFor(() => expect(recarregado.result.current.tecidosList).toHaveLength(1));
    expect(recarregado.result.current.tecidosList[0]).toMatchObject({
      id: '42',
      custo: completo.custo,
      propriedades: completo.propriedades,
      composicoesList: completo.composicoesList,
      precoLinx: completo.precoLinx,
    });
  });
});

describe('cadastro de aviamento pelo mesmo catálogo de materiais Linx', () => {
  const ziperLinx = (): LinxMaterialCadastro => ({
    ...material('UN'),
    codigo: '02160210',
    nome: 'Zíper de teste',
    grupo: 'AVIAMENTOS',
    largura: '',
    comprimento: '',
    altura: null,
    cores: material().cores.map((item) => ({ ...item, MATERIAL: '02160210' })),
  });

  it('seleciona múltiplas cores de um aviamento e consulta o preço da cor em edição', async () => {
    const cadastro = ziperLinx();
    cadastro.cores[0]!.CUSTO_A_VISTA = '2.81300';
    cadastro.cores[1]!.CUSTO_A_VISTA = '3.04100';
    cadastro.fornecedores = ['2.81300', '3.04100'].map((valor, indice) => ({
      CODIGO_COR: `C0${indice + 1}`,
      NOME_COR: 'Cor de teste',
      CODIGO_FORNECEDOR: 'S01',
      FORNECEDOR: 'Fornecedor teste',
      UNIDADE: 'UN',
      FATOR_CONVERSAO_FORNECEDOR: 1,
      CUSTO_REPOSICAO: valor,
      FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
    }));
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(cadastro);
    const save = vi.fn();
    render(
      <CriarTecidoModal
        isOpen
        tipo="aviamento"
        editingTecido={null}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    fireEvent.change(input('Código'), { target: { value: '02160210' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
    await waitFor(() => expect(screen.getByText(/^Material encontrado/)).toBeDefined());
    selecionarFornecedorDoCadastro('Fornecedor teste — S01');
    alternarCor('C01', 'aviamento');
    expect(input('Preço do insumo').value).toBe('2.81300');
    alternarCor('C02', 'aviamento');
    expect(input('Preço do insumo').value).toBe('3.04100');
    fireEvent.click(screen.getByRole('button', { name: 'Criar insumo' }));
    expect(save.mock.calls[0]![0].coresList.map((item: { codigo: string }) => item.codigo)).toEqual(
      ['C01', 'C02']
    );
    expect(save.mock.calls[0]![0].precoLinx).toMatchObject({
      corCodigo: 'C02',
      fonte: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      valor: '3.04100',
      unidade: 'UN',
    });
  });

  it('consulta o código do zíper por Enter, vincula a cor e preserva o preço manual sem propriedades de tecido', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(ziperLinx());
    const save = vi.fn();
    const view = render(
      <CriarTecidoModal
        isOpen
        tipo="aviamento"
        editingTecido={null}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    fireEvent.change(input('Código'), { target: { value: '02160210' } });
    fireEvent.keyDown(input('Código'), { key: 'Enter' });
    await waitFor(() =>
      expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe('Zíper de teste')
    );
    expect(getLinxMaterialCadastro).toHaveBeenCalledWith('02160210');
    expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe('Zíper de teste');
    expect((screen.getByLabelText('Unidade') as HTMLSelectElement).value).toBe('Unidade');
    expect(seletorCores('aviamento').textContent).toContain('Selecione uma ou mais cores');
    alternarCor('C02', 'aviamento');
    for (const campo of [
      'Gramatura (g/m²)',
      'Largura (em metros)',
      'Rendimento (m²/kg)',
      'Rendimento (m/kg)',
      'Encolhimento',
      'Construção',
    ]) {
      expect(screen.queryByLabelText(campo)).toBeNull();
    }
    fireEvent.change(input('Preço do insumo'), { target: { value: '3,1425' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar insumo' }));
    const salvo = save.mock.calls[0]![0] as TecidoInsumoItem;
    expect(salvo).toMatchObject({
      codigo: '02160210',
      nome: 'Zíper de teste',
      unidade: 'Unidade',
      custo: '3,1425',
      corLinx: { materialCodigo: '02160210', corCodigo: 'C02', corNome: 'Cor de teste' },
      precoLinx: undefined,
    });
    expect(salvo.propriedades).toBeUndefined();
    expect(salvo.coresList?.map((item) => item.codigo)).toEqual(['C02']);
    view.rerender(
      <CriarTecidoModal
        isOpen
        tipo="aviamento"
        editingTecido={salvo}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    expect(seletorCores('aviamento').textContent).toContain('(C02)');
    expect(input('Preço do insumo').value).toBe('3,1425');
  });

  it('permite cadastrar um aviamento que não tenha cores no Linx e informa quando outro código não é encontrado', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue({ ...ziperLinx(), cores: [] });
    const save = vi.fn();
    render(
      <CriarTecidoModal
        isOpen
        tipo="aviamento"
        editingTecido={null}
        onClose={vi.fn()}
        onSave={save}
      />
    );
    fireEvent.change(input('Código'), { target: { value: '02160210' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
    await waitFor(() =>
      expect(
        screen.getByText('Material encontrado. Não há cores cadastradas para este aviamento.')
      ).toBeDefined()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Criar insumo' }));
    expect(save).toHaveBeenCalledOnce();
    expect(save.mock.calls[0]![0].propriedades).toBeUndefined();
    vi.mocked(getLinxMaterialCadastro).mockRejectedValue(new Error('Material não encontrado.'));
    fireEvent.change(input('Código'), { target: { value: 'INEXISTENTE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('Material não encontrado.')
    );
    expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe('');
  });

  it('mantém cor, composição e precisão do preço ao recarregar a listagem de aviamentos', async () => {
    const completo: TecidoInsumoItem = {
      ...tecido(),
      codigo: '02160210',
      nome: 'Zíper de teste',
      unidade: 'Unidade',
      propriedades: undefined,
      custo: '3.1425',
      precoLinx: {
        materialCodigo: '02160210',
        corCodigo: 'C02',
        fonte: 'MATERIAIS_CORES.CUSTO_REPOSICAO',
        valor: '3.1425',
        unidade: 'UN',
      },
      coresList: [{ id: 'cor-ziper', codigo: 'C02', nome: 'Cor de teste', hex: '' }],
      corLinx: { materialCodigo: '02160210', corCodigo: 'C02', corNome: 'Cor de teste' },
    };
    const retornoApi: TecidoInsumoItem = {
      id: 'ziper-42',
      nome: completo.nome,
      codigo: completo.codigo,
      temErp: false,
      fornecedores: '',
      custo: 'R$ 3,14',
      unidade: 'Unidade',
    };
    vi.mocked(createInsumo).mockResolvedValue(retornoApi);
    const view = renderHook(useAviamentosGestao);
    await waitFor(() => expect(view.result.current.isLoadingAviamentos).toBe(false));
    await act(async () => {
      await view.result.current.addAviamento(completo);
    });
    expect(createInsumo).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'AVIAMENTO', custo: 3.1425 })
    );
    expect(view.result.current.aviamentosList[0]).toMatchObject({
      corLinx: completo.corLinx,
      coresList: completo.coresList,
      composicoesList: completo.composicoesList,
      custo: '3.1425',
      precoLinx: completo.precoLinx,
    });
    view.unmount();
    vi.mocked(getInsumos).mockResolvedValue([retornoApi]);
    const recarregado = renderHook(useAviamentosGestao);
    await waitFor(() => expect(recarregado.result.current.aviamentosList).toHaveLength(1));
    expect(recarregado.result.current.aviamentosList[0]).toMatchObject({
      corLinx: completo.corLinx,
      coresList: completo.coresList,
      composicoesList: completo.composicoesList,
      custo: '3.1425',
      precoLinx: completo.precoLinx,
    });
    expect(recarregado.result.current.aviamentosList[0]!.propriedades).toBeUndefined();
  });
});

describe('seleção vinculada de cor, fornecedor e valor', () => {
  const vinculado = (): LinxMaterialCadastro => ({
    ...material('MT'),
    custoAVista: 0,
    custoReposicao: null,
    cores: material().cores.map((item, index) => ({
      ...item,
      NOME_COR: ['Azul', 'Verde', 'Branco'][index]!,
      CUSTO_A_VISTA: 8 + index,
      CUSTO_REPOSICAO: 9 + index,
    })),
    fornecedores: [
      {
        CODIGO_COR: 'C01',
        NOME_COR: 'Azul',
        FORNECEDOR: 'Fornecedor A',
        CODIGO_FORNECEDOR: 'S01',
        UNIDADE: 'MT',
        FATOR_CONVERSAO_FORNECEDOR: 1,
        CUSTO_REPOSICAO: '10.12345',
        FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      },
      {
        CODIGO_COR: 'C02',
        NOME_COR: 'Verde',
        FORNECEDOR: 'Fornecedor A',
        CODIGO_FORNECEDOR: 'S01',
        UNIDADE: 'MT',
        FATOR_CONVERSAO_FORNECEDOR: 1,
        CUSTO_REPOSICAO: 12,
        FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      },
      {
        CODIGO_COR: 'C02',
        NOME_COR: 'Verde',
        FORNECEDOR: 'Fornecedor B',
        CODIGO_FORNECEDOR: 'S02',
        UNIDADE: 'KG',
        FATOR_CONVERSAO_FORNECEDOR: 2,
        CUSTO_REPOSICAO: 13,
        FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      },
    ],
  });
  const escolherFornecedor = (nome: string) => {
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar fornecedor' }));
    fireEvent.focus(screen.getByRole('combobox', { name: 'Fornecedor' }));
    fireEvent.click(screen.getByRole('option', { name: nome }));
  };
  it('abre um cadastro com duas cores mantendo ambas e a referência da cor em edição', () => {
    const salvo = {
      ...tecido(),
      corLinx: { materialCodigo: 'MAT-TESTE', corCodigo: 'C02', corNome: 'Cinza' },
      coresList: [
        { id: 'cor-1', codigo: 'C01', nome: 'Verde militar', hex: '' },
        { id: 'cor-2', codigo: 'C02', nome: 'Cinza', hex: '' },
      ],
    };
    const save = vi.fn();
    render(<CriarTecidoModal isOpen editingTecido={salvo} onClose={vi.fn()} onSave={save} />);
    expect(screen.getByRole('button', { name: 'Remover cor Verde militar' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Remover cor Cinza' })).toBeDefined();
    expect(input('Preço do insumo').value).toBe('14.9799');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(save.mock.calls[0]![0].coresList.map((item: { codigo: string }) => item.codigo)).toEqual(
      ['C01', 'C02']
    );
  });

  it('escolher a cor primeiro restringe fornecedores e depois preenche o preço do fornecedor', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(vinculado());
    const save = vi.fn();
    render(<CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={save} />);
    await pesquisar();
    expect(input('Preço do insumo').value).toBe('14.9799');
    alternarCor('C01');
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar fornecedor' }));
    fireEvent.focus(screen.getByRole('combobox', { name: 'Fornecedor' }));
    expect(screen.getByRole('option', { name: 'Fornecedor A — S01' })).toBeDefined();
    expect(screen.queryByRole('option', { name: 'Fornecedor B — S02' })).toBeNull();
    fireEvent.click(screen.getByRole('option', { name: 'Fornecedor A — S01' }));
    expect(getLinxFornecedores).not.toHaveBeenCalled();
    expect(input('Preço do insumo').value).toBe('10.12345');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(save.mock.calls[0]![0].coresList[0].fornecedoresList[0]).toMatchObject({
      codigo: 'S01',
    });
  });

  it('escolher o fornecedor primeiro restringe cores e não converte unidades diferentes', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(vinculado());
    render(<CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={vi.fn()} />);
    await pesquisar();
    escolherFornecedor('Fornecedor B — S02');
    fireEvent.click(seletorCores());
    expect(screen.queryByRole('option', { name: /Azul/ })).toBeNull();
    expect(screen.getByRole('option', { name: 'Verde (C02)' })).toBeDefined();
    expect(seletorCores().textContent).toContain('Selecione uma ou mais cores');
    alternarCor('C02');
    expect(screen.queryByRole('button', { name: /Usar valor de Fornecedor A/ })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Valores disponíveis no Linx' })).toBeNull();
    expect(input('Preço do insumo').value).toBe('');
    fireEvent.change(screen.getByLabelText('Unidade'), { target: { value: 'Kg' } });
    expect(input('Preço do insumo').value).toBe('13');
    expect(screen.getByText(/Preço do fornecedor escolhido para esta cor/)).toBeDefined();
  });

  it('selecionar uma cor salva seu preço com precisão e reabre sem substituir uma edição manual', async () => {
    const cadastro = vinculado();
    cadastro.cores[0]!.CUSTO_A_VISTA = '10.12345';
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(cadastro);
    const save = vi.fn();
    const view = render(
      <CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={save} />
    );
    await pesquisar();
    expect(input('Preço do insumo').value).toBe('14.9799');
    escolherFornecedor('Fornecedor A — S01');
    alternarCor('C01');
    expect(input('Preço do insumo').value).toBe('10.12345');
    expect(seletorCores().textContent).toContain('(C01)');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    const salvo = save.mock.calls[0]![0] as TecidoInsumoItem;
    expect(salvo.precoLinx).toMatchObject({
      materialCodigo: 'MAT-TESTE',
      corCodigo: 'C01',
      valor: '10.12345',
      unidade: 'MT',
      fonte: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
    });
    expect(salvo.precoLinx?.fornecedorCodigo).toBe('S01');
    view.rerender(
      <CriarTecidoModal isOpen editingTecido={salvo} onClose={vi.fn()} onSave={save} />
    );
    expect(input('Preço do insumo').value).toBe('10.12345');
    expect(screen.getByText(/Valor do Linx. Fonte:/)).toBeDefined();
    fireEvent.change(input('Preço do insumo'), { target: { value: '17,2501' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    expect(save.mock.calls[1]![0]).toMatchObject({ custo: '17,2501', precoLinx: undefined });
  });

  it('adicionar outra cor mantém a anterior; remover fornecedor invalida o preço automático vinculado', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(vinculado());
    render(<CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={vi.fn()} />);
    await pesquisar();
    alternarCor('C01');
    escolherFornecedor('Fornecedor A — S01');
    expect(input('Preço do insumo').value).toBe('10.12345');
    alternarCor('C02');
    expect(input('Preço do insumo').value).toBe('12');
    expect(screen.getByRole('button', { name: 'Remover cor Azul' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Remover cor Verde' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Remover fornecedor Fornecedor A' }));
    expect(input('Preço do insumo').value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Remover cor Verde' }));
    expect(input('Preço do insumo').value).toBe('');
    expect(screen.getByRole('button', { name: 'Remover cor Azul' })).toBeDefined();
  });

  it('não busca fornecedores globais quando o material não tem vínculos ativos', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue({ ...vinculado(), fornecedores: [] });
    render(<CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={vi.fn()} />);
    await pesquisar();
    expect(screen.getByText('Não há fornecedores ativos vinculados a esta seleção.')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar fornecedor' }));
    fireEvent.focus(screen.getByRole('combobox', { name: 'Fornecedor' }));
    expect(screen.queryByRole('option', { name: /Fornecedor A/ })).toBeNull();
    expect(getLinxFornecedores).not.toHaveBeenCalled();
  });

  it('trocar o preço diretamente no bloco da ficha remove a indicação de origem Linx', () => {
    const change = vi.fn();
    const item = {
      ...tecido(),
      precoLinx: {
        materialCodigo: 'MAT-TESTE',
        fonte: 'MATERIAIS.CUSTO_REPOSICAO' as const,
        valor: '14.9799',
        unidade: 'KG',
      },
    };
    render(
      <FichaInsumoCard
        item={item}
        tipo="tecido"
        usoKey="teste-usos"
        produto="PRODUTO-TESTE"
        onUpdate={change}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText(/Valor escolhido do Linx: MATERIAIS.CUSTO_REPOSICAO/)).toBeDefined();
    fireEvent.change(screen.getByLabelText('Preço por Kg (R$)'), { target: { value: '15,2345' } });
    expect(change).toHaveBeenCalledWith({
      custo: '15,2345',
      precoOrigem: 'manual',
      precoLinx: undefined,
    });
  });

  it('uma reconsulta atrasada não apaga o preço manual digitado enquanto a busca estava em andamento', async () => {
    let resolver!: (value: LinxMaterialCadastro) => void;
    vi.mocked(getLinxMaterialCadastro).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        })
    );
    const anterior = {
      ...tecido(),
      corLinx: { materialCodigo: 'MAT-TESTE', corCodigo: 'C01', corNome: 'Azul' },
      precoLinx: {
        materialCodigo: 'MAT-TESTE',
        corCodigo: 'C01',
        valor: '14.9799',
        fonte: 'MATERIAIS_CORES.CUSTO_REPOSICAO' as const,
        unidade: 'MT',
      },
    };
    render(<CriarTecidoModal isOpen editingTecido={anterior} onClose={vi.fn()} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
    fireEvent.change(input('Preço do insumo'), { target: { value: '18,1251' } });
    await act(async () => resolver(vinculado()));
    expect(input('Preço do insumo').value).toBe('18,1251');
    expect(screen.queryByText(/Valor do Linx. Fonte:/)).toBeNull();
  });

  it('não conserva o preço anterior quando a nova cor não tem preço do fornecedor, nem usa outra fonte', async () => {
    const cadastro = vinculado();
    cadastro.cores[1]!.CUSTO_A_VISTA = null;
    cadastro.fornecedores![1]!.CUSTO_REPOSICAO = null;
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(cadastro);
    render(<CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={vi.fn()} />);
    await pesquisar();
    escolherFornecedor('Fornecedor A — S01');
    alternarCor('C01');
    expect(input('Preço do insumo').value).toBe('10.12345');
    alternarCor('C02');
    expect(input('Preço do insumo').value).toBe('');
    expect(
      screen.getByText(/Selecione o fornecedor desta cor. Se o preço estiver ausente/)
    ).toBeDefined();
  });

  it('adiciona uma cor personalizada junto das cores Linx, com foco preservado ao reabrir', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue(vinculado());
    const save = vi.fn();
    const view = render(
      <CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={save} />
    );
    await pesquisar();
    escolherFornecedor('Fornecedor A — S01');
    alternarCor('C01');
    adicionarCorPersonalizada();
    expect(input('Preço do insumo').value).toBe('');
    expect(screen.getByRole('button', { name: 'Remover cor Azul' })).toBeDefined();
    fireEvent.change(input('Preço do insumo'), { target: { value: '17,12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    const salvo = save.mock.calls[0]![0] as TecidoInsumoItem;
    expect(salvo.coresList).toHaveLength(2);
    expect(salvo.coresList?.[1]).toMatchObject({ nome: 'Cor exclusiva', hex: '#123456' });
    expect(salvo).toMatchObject({ custo: '17,12345', corLinx: undefined, precoLinx: undefined });
    expect(salvo.propriedades?.origemLinx).toBeUndefined();
    view.rerender(
      <CriarTecidoModal isOpen editingTecido={salvo} onClose={vi.fn()} onSave={save} />
    );
    expect(
      screen.getByRole('button', { name: 'Editar cor Cor exclusiva' }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(input('Preço do insumo').value).toBe('17,12345');
    await pesquisar();
    expect(
      screen.getByRole('button', { name: 'Editar cor Cor exclusiva' }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(input('Preço do insumo').value).toBe('17,12345');
    alternarCor('C02');
    expect(input('Preço do insumo').value).toBe('12');
    expect(screen.getByRole('button', { name: 'Remover cor Cor exclusiva' })).toBeDefined();
  });

  it('a cor personalizada permanece disponível mesmo sem cores do Linx', async () => {
    vi.mocked(getLinxMaterialCadastro).mockResolvedValue({ ...vinculado(), cores: [] });
    render(<CriarTecidoModal isOpen editingTecido={tecido()} onClose={vi.fn()} onSave={vi.fn()} />);
    await pesquisar();
    adicionarCorPersonalizada();
    fireEvent.change(input('Preço do insumo'), { target: { value: '25,001' } });
    expect(input('Preço do insumo').value).toBe('25,001');
    expect(screen.getByText(/Cor personalizada: informe o preço manualmente/)).toBeDefined();
  });

  it('uma consulta atrasada não restaura a cor Linx depois da escolha de cor personalizada', async () => {
    let resolver!: (value: LinxMaterialCadastro) => void;
    vi.mocked(getLinxMaterialCadastro).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolver = resolve;
        })
    );
    const anterior = {
      ...tecido(),
      corLinx: { materialCodigo: 'MAT-TESTE', corCodigo: 'C01', corNome: 'Azul' },
    };
    render(<CriarTecidoModal isOpen editingTecido={anterior} onClose={vi.fn()} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar código no Linx' }));
    adicionarCorPersonalizada();
    fireEvent.change(input('Preço do insumo'), { target: { value: '23,991' } });
    await act(async () => resolver(vinculado()));
    expect(
      screen.getByRole('button', { name: 'Editar cor Cor exclusiva' }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(input('Preço do insumo').value).toBe('23,991');
    expect(input('Gramatura (g/m²)').value).toBe('');
  });
});
