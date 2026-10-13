import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PecasTab } from '../pages/Home/components/PecasTab';
import {
  getLinxColecoesValidas,
  getLinxConnectionInfo,
  getLinxProdutosValidos,
  getLinxSubgrupos,
} from '../services/linxService';
import type { LinxProdutoValido, LinxProdutosValidosParams } from '../types/linx';

vi.mock('../services/linxService', () => ({
  getLinxColecoesValidas: vi.fn(),
  getLinxConnectionInfo: vi.fn(),
  getLinxProdutosValidos: vi.fn(),
  getLinxSubgrupos: vi.fn(),
}));

const product: LinxProdutoValido = {
  linxId: 1,
  codigo: 'TESTE-01',
  codigoNormalizado: 'TESTE-01',
  descricao: 'Produto de teste',
  griffe: 'KING&JOE',
  colecaoCodigo: 'TESTE',
  colecaoNome: 'Coleção de teste',
  griffeColecao: 'KING&JOE',
  dataInicioColecao: null,
  dataFinalColecao: null,
  temporada: null,
  grupo: 'ROUPAS',
  subgrupo: 'CAMISA',
  tipo: null,
  periodoPcp: null,
  grade: null,
  linha: null,
  cartela: null,
  materialPrincipal: 'M-TESTE',
  descricaoMaterialPrincipal: 'Material de teste',
  modelagem: null,
  estilista: null,
  modelista: null,
  statusProduto: null,
  tipoStatusProduto: null,
  dataCadastramento: null,
  dataInicioDesenvolvimento: null,
  custoReposicao: null,
  precoReposicao: null,
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getLinxConnectionInfo).mockResolvedValue({
    servidor: null,
    banco: 'teste-offline',
    bancoEsperado: 'teste-offline',
    bancoEsperadoConfirmado: true,
    credencialSomenteLeitura: true,
    integracaoSomenteLeitura: true,
    permissoesEscritaDetectadas: [],
  });
  vi.mocked(getLinxColecoesValidas).mockResolvedValue([
    {
      codigo: 'TESTE',
      nome: 'Coleção de teste',
      griffeProduto: 'KING&JOE',
      griffeColecao: 'KING&JOE',
      dataInicio: null,
      dataFinal: null,
      temporada: null,
      quantidadeProdutos: 1,
    },
  ]);
  vi.mocked(getLinxSubgrupos).mockResolvedValue(['CAMISA']);
  vi.mocked(getLinxProdutosValidos).mockImplementation(async (params = {}) => ({
    items: [product],
    page: params.page ?? 0,
    size: params.size ?? 50,
    totalElements: 51,
    totalPages: 2,
    hasNext: (params.page ?? 0) === 0,
    sourceDatabase: 'teste-offline',
    readOnly: true,
  }));
});

afterEach(cleanup);

async function renderCatalog() {
  render(<PecasTab />);
  await screen.findByRole('button', { name: 'Abrir detalhes somente leitura de Produto de teste' });
}

function selectFilter(label: string, option: string) {
  const combobox = screen.getByRole('combobox', { name: label });
  fireEvent.click(combobox);
  fireEvent.click(
    within(screen.getByRole('listbox', { name: label })).getByRole('option', { name: option })
  );
  fireEvent.keyDown(combobox, { key: 'Escape' });
}

function lastParams(): LinxProdutosValidosParams {
  return vi.mocked(getLinxProdutosValidos).mock.calls.at(-1)?.[0] ?? {};
}

describe('Filtros do catálogo de peças do Linx', () => {
  it('remove Status da Coleção e Material principal, preservando os demais filtros e a informação do material', async () => {
    await renderCatalog();

    expect(screen.queryByText('Status da Coleção')).toBeNull();
    expect(screen.queryByLabelText('Material principal')).toBeNull();
    expect(screen.queryByText('Material principal')).toBeNull();
    expect(
      screen.getAllByRole('combobox').map((field) => field.getAttribute('aria-labelledby'))
    ).toHaveLength(5);
    for (const name of ['Griffes', 'Coleções', 'Tipos de Peças', 'Etapas', 'Status da Peça']) {
      expect(screen.getByRole('combobox', { name })).toBeDefined();
    }
    expect(screen.getByRole('searchbox', { name: 'Produto' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeDefined();
    expect(screen.getByText('Material de teste (M-TESTE)')).toBeDefined();
  });

  it('não envia os dois filtros retirados na consulta inicial nem ao paginar', async () => {
    await renderCatalog();
    expect(lastParams()).toMatchObject({ page: 0, size: 50 });
    expect(lastParams()).not.toHaveProperty('material');
    expect(lastParams()).not.toHaveProperty('statusColecao');

    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await waitFor(() => expect(lastParams().page).toBe(1));
    expect(lastParams()).not.toHaveProperty('material');
    expect(lastParams()).not.toHaveProperty('statusColecao');
  });

  it('continua enviando griffe, coleção, produto, tipo, etapa e status da peça', async () => {
    await renderCatalog();
    selectFilter('Griffes', 'King & Joe');
    await waitFor(() => expect(lastParams().griffe).toEqual(['KING&JOE']));
    selectFilter('Coleções', 'Coleção de teste (1)');
    selectFilter('Tipos de Peças', 'CAMISA');
    selectFilter('Etapas', '01 geração de ficha');
    selectFilter('Status da Peça', 'Completas');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Produto' }), {
      target: { value: 'TESTE-01' },
    });

    await waitFor(() =>
      expect(lastParams()).toMatchObject({
        page: 0,
        size: 50,
        griffe: ['KING&JOE'],
        colecao: ['TESTE'],
        tipo: ['CAMISA'],
        etapa: ['GERACAO_FICHA'],
        statusPeca: ['COMPLETA'],
        search: 'TESTE-01',
      })
    );
    expect(lastParams()).not.toHaveProperty('material');
    expect(lastParams()).not.toHaveProperty('statusColecao');
  });

  it('Limpar filtros remove as seleções restantes e retorna à primeira página', async () => {
    await renderCatalog();
    selectFilter('Tipos de Peças', 'CAMISA');
    selectFilter('Status da Peça', 'Completas');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Produto' }), {
      target: { value: 'TESTE-01' },
    });
    await waitFor(() => expect(lastParams().search).toBe('TESTE-01'));
    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'Próxima' }) as HTMLButtonElement).disabled).toBe(
        false
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await waitFor(() => expect(lastParams().page).toBe(1));
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect((screen.getByRole('searchbox', { name: 'Produto' }) as HTMLInputElement).value).toBe('');
    await waitFor(() => {
      expect(lastParams()).toEqual({
        page: 0,
        size: 50,
        search: undefined,
        griffe: undefined,
        colecao: undefined,
        tipo: undefined,
        etapa: undefined,
        statusPeca: undefined,
      });
    });
    expect(screen.getByRole('combobox', { name: 'Tipos de Peças' }).textContent).toBe(
      'Todos os tipos de peças'
    );
    expect(screen.getByRole('combobox', { name: 'Status da Peça' }).textContent).toBe(
      'Todos os status'
    );
  });
});
