import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinxFichaPanel } from '../pages/Home/components/LinxFichaPanel';
import { getLinxFichaDetalhe, getLinxFichaVersoes } from '../services/linxService';
import {
  getLinxFichaInsumos,
  getPecaInsumoLabels,
  hasPecaInsumosConfirmados,
} from '../services/linxFichaMappers';
import type { LinxFichaDetalhe } from '../types/linx';
import type { PecaItem } from '../types/plm';

vi.mock('../services/linxService', () => ({
  getLinxFichaDetalhe: vi.fn(),
  getLinxFichaVersoes: vi.fn(),
}));
const origem = { codigoProduto: 'TESTE', colecaoCodigo: '025', griffe: 'KING&JOE' as const };
const ficha: LinxFichaDetalhe = {
  versao: {
    produto: 'TESTE',
    versao: '00002',
    descricao: 'Ficha de teste',
    dataCriacao: '2024-01-01',
    responsavel: null,
    status: 'A',
    colecaoCodigo: '025',
    colecaoNome: 'Coleção de teste',
  },
  materiais: [
    {
      codigo: '01001',
      nome: 'Tecido de teste',
      grupo: 'TECIDO',
      item: '0001',
      dados: {
        C1: 0,
        C2: 3,
        DESC_COMPOSICAO: 'Composição original',
        FABRICANTE: 'Fabricante de teste',
        CUSTO_REPOSICAO: 0,
        UNID_FICHA_TEC: 'KG',
        DESC_USO_MATERIAL: 'Uso original',
      },
      cores: [],
    },
    {
      codigo: '02001',
      nome: 'Aviamento de teste',
      grupo: 'AVIAMENTOS',
      item: '0002',
      dados: { UNID_FICHA_TEC: 'UN' },
      cores: [],
    },
  ],
};
const peca = {
  codigo: 'TESTE',
  tecidos: ['Material principal não classificado'],
  linxOrigem: origem,
} as PecaItem;

describe('Fichas Linx sem suposições', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLinxFichaVersoes).mockResolvedValue([ficha.versao]);
    vi.mocked(getLinxFichaDetalhe).mockResolvedValue(structuredClone(ficha));
  });
  it('preserva composição, zeros e unidade original sem fabricar fornecedor, consumo ou preço', () => {
    const result = getLinxFichaInsumos(ficha);
    expect(result.tecidos).toHaveLength(1);
    expect(result.aviamentos).toHaveLength(1);
    expect(result.tecidos[0]).toMatchObject({
      uso: 'Uso original',
      unidade: 'KG',
      fornecedores: '',
      custo: '',
      linxDados: { dados: { C1: 0, C2: 3 } },
    });
    expect(result.tecidos[0]?.consumo).toBeUndefined();
    result.tecidos[0]!.linxDados!.dados.C1 = 99;
    expect(ficha.materiais[0]?.dados.C1).toBe(0);
  });
  it('não transforma ficha desconhecida em peça sem tecidos e deriva filtros das variantes editadas', () => {
    expect(getPecaInsumoLabels(peca, 'tecidos')).toEqual([]);
    expect(hasPecaInsumosConfirmados(peca)).toBe(false);
    const imported = {
      ...peca,
      fichaTecnica: {
        variantes: [{ id: 'principal', nome: 'Principal', ...getLinxFichaInsumos(ficha) }],
      },
    };
    expect(getPecaInsumoLabels(imported, 'tecidos')).toEqual(['Tecido de teste (01001)']);
    expect(getPecaInsumoLabels(imported, 'aviamentos')).toEqual(['Aviamento de teste (02001)']);
    expect(hasPecaInsumosConfirmados(imported)).toBe(true);
  });
  it('base antiga mostra apenas ficha atual, sem seletor de histórico ou cópia manual', () => {
    render(
      <LinxFichaPanel
        produto="TESTE"
        loading={false}
        error=""
        versao={ficha.versao}
        temRascunho={false}
      />
    );
    expect(screen.getByRole('region', { name: 'Ficha atual do Linx' })).toBeDefined();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(getLinxFichaVersoes).not.toHaveBeenCalled();
    expect(getLinxFichaDetalhe).not.toHaveBeenCalled();
  });
  it('informa que rascunhos já salvos são preservados', () => {
    render(<LinxFichaPanel produto="TESTE" loading={false} error="" versao={null} temRascunho />);
    expect(screen.getByText(/insumos do rascunho salvo foram preservados/)).toBeDefined();
  });
  it('apresenta falha ou carregamento sem inventar materiais', () => {
    render(
      <LinxFichaPanel
        produto="TESTE"
        loading={false}
        error="Consulta indisponível"
        versao={null}
        temRascunho={false}
      />
    );
    expect(screen.getByRole('alert').textContent).toBe('Consulta indisponível');
    expect(screen.queryByRole('status')).toBeNull();
  });
});
