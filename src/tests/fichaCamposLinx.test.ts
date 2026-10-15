import inventory from '../../docs/linx-ficha-colunas-20261015.json?raw';
import { describe, expect, it } from 'vitest';
import { CAMPOS_FICHA_LINX, vinculosCamposParaPlanejamento } from '../services/fichaCamposLinx';

const snapshot = JSON.parse(inventory) as {
  colunas: { tabela: string; coluna: string; bytes: number; precisao: number; escala: number }[];
};
describe('Campos da ficha vinculados às colunas auditadas', () => {
  it('referencia somente colunas realmente presentes nas cinco tabelas da cópia', () => {
    expect(snapshot.colunas).toHaveLength(313);
    const columns = new Set(snapshot.colunas.map((column) => `${column.tabela}.${column.coluna}`));
    for (const field of CAMPOS_FICHA_LINX)
      for (const column of field.colunas) expect(columns.has(column), column).toBe(true);
    expect(new Set(CAMPOS_FICHA_LINX.map((field) => field.id)).size).toBe(CAMPOS_FICHA_LINX.length);
  });
  it('não confunde nome, descrição, cor básica e chave da cor do produto', () => {
    const field = (id: string) => CAMPOS_FICHA_LINX.find((item) => item.id === id)!;
    expect(field('nome').situacao).toBe('IDENTIFICADO');
    expect(field('nome').colunas).toEqual(['PRODUTOS.DESC_PRODUTO']);
    expect(field('categoria').situacao).toBe('PENDENTE_REGRA');
    expect(field('categoria').colunas).not.toContain('PRODUTOS.DESC_PRODUTO');
    expect(field('mostruario').colunas).toEqual(['PRODUTO_CORES.COR']);
    expect(field('corProduto').situacao).toBe('PENDENTE_REGRA');
    expect(field('corMaterial').colunas).toContain('PRODUTO_VERSAO_MATERIAL_COR.COR_MATERIAL');
    expect(field('referencia').colunas).toEqual([]);
    expect(field('preco').colunas).toEqual([]);
  });
  it('preserva limites reais e as 48 posições, sem prometer arredondamento ou defaults', () => {
    expect(
      snapshot.colunas.find((c) => c.tabela === 'PRODUTOS' && c.coluna === 'DESC_PRODUTO')?.bytes
    ).toBe(100);
    expect(
      snapshot.colunas.find((c) => c.tabela === 'PRODUTOS' && c.coluna === 'U_NOME_PRODUTO')?.bytes
    ).toBe(200);
    expect(
      snapshot.colunas.find((c) => c.tabela === 'PRODUTO_VERSAO_MATERIAL' && c.coluna === 'C1')
    ).toMatchObject({ precisao: 9, escala: 3 });
    expect(CAMPOS_FICHA_LINX.find((field) => field.id === 'consumos')?.colunas).toHaveLength(48);
  });
  it('inclui metadados no planejamento sem habilitar escrita nem transportar dados exclusivos do portal', () => {
    const plan = vinculosCamposParaPlanejamento();
    expect(plan.gravacaoHabilitada).toBe(false);
    expect(plan.campos.some((field) => field.situacao === 'SOMENTE_PORTAL')).toBe(false);
    expect(JSON.stringify(plan)).not.toMatch(/provaRoupa|historicoAlteracoes|variantes adicionais/);
    const first = plan.campos[0]!;
    first.colunas.push('INVALIDA');
    expect(CAMPOS_FICHA_LINX[0]!.colunas).not.toContain('INVALIDA');
  });
});
