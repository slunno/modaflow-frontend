import { describe, expect, it } from 'vitest';
import {
  coresDosFornecedores,
  fornecedoresDoMaterial,
  precoAutomaticoDaCor,
  precosDoMaterial,
} from '../services/insumoLinxVinculos';
import type { LinxMaterialCadastro } from '../types/linx';

export const materialComVinculos = (): LinxMaterialCadastro => ({
  codigo: 'MAT-VINCULO',
  nome: 'Material de teste',
  grupo: 'TECIDO',
  unidadeEstoque: 'MT',
  unidadeFichaTecnica: 'MT',
  largura: '1.5',
  comprimento: '',
  altura: null,
  rendimento: null,
  custoAVista: 0,
  custoReposicao: null,
  cores: ['Azul', 'Verde', 'Branco'].map((nome, index) => ({
    MATERIAL: 'MAT-VINCULO',
    CODIGO_COR: `C0${index + 1}`,
    NOME_COR: nome,
    GRAMATURA: 200 + index,
    CUSTO_A_VISTA: 8 + index,
    CUSTO_REPOSICAO: 9 + index,
    TEC_ENCOLHIMENTO_CORTE_X: 0,
    TEC_ENCOLHIMENTO_CORTE_Y: 1,
    TEC_ENCOLHIMENTO_ACABAMENTO_X: null,
    TEC_ENCOLHIMENTO_ACABAMENTO_Y: null,
    TEC_ENCOLHIMENTO_LAVAGEM_X: null,
    TEC_ENCOLHIMENTO_LAVAGEM_Y: null,
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
    {
      CODIGO_COR: 'C03',
      NOME_COR: 'Branco',
      FORNECEDOR: 'Fornecedor C',
      CODIGO_FORNECEDOR: 'S03',
      UNIDADE: 'MT',
      FATOR_CONVERSAO_FORNECEDOR: null,
      CUSTO_REPOSICAO: null,
      FONTE: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
    },
  ],
});

describe('vínculos Linx do insumo', () => {
  it('automatiza somente o custo à vista da cor exata, preservando unidade, precisão e zero real', () => {
    const material = materialComVinculos();
    material.cores[0]!.CUSTO_A_VISTA = '21.13785';
    expect(precoAutomaticoDaCor(material, 'C01', 'Metros')).toMatchObject({
      fonte: 'MATERIAIS_CORES.CUSTO_A_VISTA',
      valor: '21.13785',
      unidade: 'MT',
      corCodigo: 'C01',
    });
    material.cores[0]!.CUSTO_A_VISTA = 0;
    expect(precoAutomaticoDaCor(material, 'C01', 'Metros')?.valor).toBe('0');
    material.cores[0]!.CUSTO_A_VISTA = null;
    expect(precoAutomaticoDaCor(material, 'C01', 'Metros')).toBeNull();
    expect(precoAutomaticoDaCor(material, 'INEXISTENTE', 'Metros')).toBeNull();
    expect(precoAutomaticoDaCor(material, 'C02', 'Kg')).toBeNull();
    expect(precoAutomaticoDaCor({ ...material, unidadeEstoque: '' }, 'C02', 'Metros')).toBeNull();
  });
  it('filtra cor para fornecedor, elimina fornecedores repetidos e preserva códigos', () => {
    const material = materialComVinculos();
    expect(fornecedoresDoMaterial(material).map((item) => item.codigo)).toEqual([
      'S01',
      'S02',
      'S03',
    ]);
    expect(fornecedoresDoMaterial(material, 'C01').map((item) => item.codigo)).toEqual(['S01']);
    expect(fornecedoresDoMaterial(material, 'C02').map((item) => item.codigo)).toEqual([
      'S01',
      'S02',
    ]);
    expect(fornecedoresDoMaterial(material, ['C01', 'C03']).map((item) => item.codigo)).toEqual([
      'S01',
      'S03',
    ]);
  });
  it('filtra fornecedor para cores e não transforma uma lista sem vínculos em fornecedores globais', () => {
    const material = materialComVinculos();
    expect(coresDosFornecedores(material, []).map((item) => item.CODIGO_COR)).toEqual([
      'C01',
      'C02',
      'C03',
    ]);
    expect(
      coresDosFornecedores(material, [{ id: '1', codigo: 'S02', fornecedor: 'Fornecedor B' }]).map(
        (item) => item.CODIGO_COR
      )
    ).toEqual(['C02']);
    expect(fornecedoresDoMaterial({ ...material, fornecedores: [] })).toEqual([]);
  });
  it('preserva fontes distintas, zero real, unidade, precisão e fator sem fazer cálculos', () => {
    const material = materialComVinculos();
    const precos = precosDoMaterial(material, 'C02', [
      { id: '1', codigo: 'S02', fornecedor: 'Fornecedor B' },
    ]);
    expect(precos).toHaveLength(4);
    expect(precos[0]).toMatchObject({ fonte: 'MATERIAIS.CUSTO_A_VISTA', valor: '0' });
    expect(precos.at(-1)).toMatchObject({
      fonte: 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO',
      valor: '13',
      unidade: 'KG',
      corCodigo: 'C02',
      fornecedorCodigo: 'S02',
      fatorConversaoFornecedor: 2,
    });
    expect(precosDoMaterial(material, 'C01', []).at(-1)?.valor).toBe('10.12345');
    expect(
      precosDoMaterial(material, 'C03', []).some((item) => item.fornecedorCodigo === 'S03')
    ).toBe(false);
  });
});
