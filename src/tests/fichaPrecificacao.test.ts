import { describe, expect, it } from 'vitest';
import { calcularPrecificacao, PRECIFICACAO_INICIAL } from '../services/fichaPrecificacao';

describe('Cálculos de precificação', () => {
  it('reproduz custo, markup e comparação do print sem arredondar o cálculo intermediário', () => {
    const result = calcularPrecificacao(110, { ...PRECIFICACAO_INICIAL, precoAprovado: '300' });
    expect(result.precoFinal).toBeCloseTo(313.5, 8);
    expect(result.custoPercentual).toBeCloseTo(35.0877193, 6);
    expect(result.diferenca).toBeCloseTo(-13.5, 8);
    expect(result.diferencaPercentual).toBeCloseTo(-4.3062201, 6);
  });

  it('usa a margem sobre o preço de venda e aceita vírgula decimal', () => {
    const result = calcularPrecificacao(110, {
      ...PRECIFICACAO_INICIAL,
      modo: 'margem',
      margemLucro: '60,5',
      precoAprovado: '300,25',
    });
    expect(result.precoFinal).toBeCloseTo(110 / 0.395, 8);
    expect(result.custoPercentual).toBeCloseTo(39.5, 8);
    expect(result.diferenca).toBeCloseTo(300.25 - 110 / 0.395, 8);
  });

  it.each(['100', '120', '-5', '', 'abc'])('não calcula margem inválida de %s', (margemLucro) => {
    const result = calcularPrecificacao(110, {
      ...PRECIFICACAO_INICIAL,
      modo: 'margem',
      margemLucro,
    });
    expect(result.erroCalculo).not.toBe('');
    expect(result.precoFinal).toBeNull();
    expect(result.diferencaPercentual).toBeNull();
  });

  it.each(['0', '-2', '', 'abc'])('não calcula markup inválido de %s', (markup) => {
    expect(calcularPrecificacao(110, { ...PRECIFICACAO_INICIAL, markup }).precoFinal).toBeNull();
  });

  it('distingue custo ausente de zero e deixa comparações sem base indefinidas', () => {
    expect(calcularPrecificacao(null, PRECIFICACAO_INICIAL).precoFinal).toBeNull();
    const zero = calcularPrecificacao(0, { ...PRECIFICACAO_INICIAL, precoAprovado: '10' });
    expect(zero.precoFinal).toBe(0);
    expect(zero.diferenca).toBe(10);
    expect(zero.custoPercentual).toBeNull();
    expect(zero.diferencaPercentual).toBeNull();
    expect(calcularPrecificacao(110, PRECIFICACAO_INICIAL).diferenca).toBeNull();
  });

  it('não confunde preço aprovado inválido com zero e rejeita custos não finitos', () => {
    const result = calcularPrecificacao(110, { ...PRECIFICACAO_INICIAL, precoAprovado: '-1' });
    expect(result.precoFinal).toBeCloseTo(313.5, 8);
    expect(result.erroPrecoAprovado).not.toBe('');
    expect(result.diferenca).toBeNull();
    expect(calcularPrecificacao(Infinity, PRECIFICACAO_INICIAL).precoFinal).toBeNull();
    expect(calcularPrecificacao(-1, PRECIFICACAO_INICIAL).precoFinal).toBeNull();
  });
});
