import { describe, expect, it } from 'vitest';
import { calcularCustosFicha } from '../services/fichaCustos';
import type { FichaVariante } from '../types/ficha';
import { custosV2Fixture } from './fixtures/custosV2';
const variante: FichaVariante = { id: 'teste', nome: 'Principal', tecidos: [], aviamentos: [] };
describe('Composição completa de custos v2', () => {
  it('soma embalagem e operações uma vez e mantém o total de extra cadastrado', () => {
    const dados = custosV2Fixture(),
      original = structuredClone(dados);
    const custo = calcularCustosFicha(variante, dados);
    expect(custo.linhas).toHaveLength(3);
    expect(custo.subtotalTecidos).toBe(100);
    expect(custo.subtotalAviamentos).toBe(3);
    expect(custo.totalOutros).toBe(12);
    expect(custo.total).toBe(115);
    expect(custo.linhas[1]).toMatchObject({ consumo: 10, preco: 0.1, total: 1 });
    expect(dados).toEqual(original);
  });
  it('seleção e quantidade por variante não somam tamanhos e alcançam a posição 48', () => {
    const dados = custosV2Fixture();
    expect(
      calcularCustosFicha({ ...variante, custos: { posicao: 48, quantidadeProducao: '4' } }, dados)
    ).toMatchObject({ total: 165, totalProducao: 660 });
    expect(calcularCustosFicha(variante, dados).total).toBe(115);
    expect(calcularCustosFicha({ ...variante, custos: { posicao: 49 } }, dados).total).toBeNull();
    expect(
      calcularCustosFicha({ ...variante, custos: { quantidadeProducao: '0' } }, dados).totalProducao
    ).toBeNull();
  });
  it('não escolhe cor ou rota alternativa por nome nem omite materiais sem vínculo de cor', () => {
    const dados = custosV2Fixture();
    dados.materiais.push({ ...dados.materiais[0]!, COR_PRODUTO: '02' });
    expect(calcularCustosFicha(variante, dados).total).toBeNull();
    dados.operacoes.push({ ...dados.operacoes[0]!, ROTA_PRODUCAO: '01' });
    const semRota = calcularCustosFicha({ ...variante, custos: { corProduto: '01' } }, dados);
    expect(semRota.total).toBeNull();
    expect(semRota.totalInsumos).toBe(103);
    dados.materiais.push({
      ...dados.materiais[0]!,
      ITEM: 'PENDENTE',
      COR_PRODUTO: null,
      CUSTO_CONSUMO_LINX: null,
      STATUS_CALCULO: 'PENDENTE_DADOS',
    });
    const result = calcularCustosFicha(
      { ...variante, custos: { corProduto: '01', rota: '00' } },
      dados
    );
    expect(result.pendentes).toBe(1);
    expect(result.total).toBeNull();
  });
  it('zero é custo válido; dados faltantes e semiacabados mantêm o total pendente', () => {
    const dados = custosV2Fixture();
    dados.materiais[1]!.CUSTO_CONSUMO_LINX = 0;
    expect(calcularCustosFicha(variante, dados).total).toBe(114);
    dados.materiais[1]!.STATUS_CALCULO = 'PENDENTE_SEMIACABADO';
    expect(calcularCustosFicha(variante, dados).total).toBeNull();
  });
  it('preserva valores manuais e ajustes locais sem alterar os registros Linx', () => {
    const dados = custosV2Fixture();
    const manual = {
      ...variante,
      tecidos: [
        {
          id: 't',
          nome: 'Tecido manual',
          codigo: 'T',
          temErp: false,
          fornecedores: '',
          unidade: 'M',
          custo: '10',
          consumo: '2',
        },
      ],
    };
    expect(calcularCustosFicha(manual, dados)).toMatchObject({ fonte: 'portal', total: 20 });
    expect(calcularCustosFicha({ ...manual, custos: { fonte: 'linx' } }, dados).total).toBe(115);
    const ajustado = {
      ...variante,
      custos: {
        outros: [
          {
            id: 'local',
            nome: 'Custo local',
            custo: '2,5',
            quantidade: '2',
            origem: 'local' as const,
          },
        ],
      },
    };
    expect(calcularCustosFicha(ajustado, dados).total).toBe(108);
    expect(dados.outrosCustos[0]!.CUSTO_TOTAL).toBe(7);
  });
});
