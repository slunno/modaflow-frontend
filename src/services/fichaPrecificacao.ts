import type { FichaPrecificacao, FichaVariante, FichaTerceiro } from '../types/ficha';
import { custoConsumo, decimalManual } from './fichaProcesso';
import type { LinxFichaCustos } from '../types/linx';
import { calcularCustosFicha } from './fichaCustos';

export const PRECIFICACAO_INICIAL: FichaPrecificacao = {
  modo: 'markup',
  markup: '2.85',
  margemLucro: '',
  precoAprovado: '',
};

export interface ResultadoPrecificacao {
  precoFinal: number | null;
  custoPercentual: number | null;
  diferenca: number | null;
  diferencaPercentual: number | null;
  erroCalculo: string;
  erroPrecoAprovado: string;
}

/** Soma somente insumos com preço e consumo/quantidade válidos na mesma unidade. */
export function custoInsumosVariante(variante: FichaVariante) {
  const custos = [
    ...variante.tecidos.map((item) => custoConsumo(item, 'tecidos')),
    ...variante.aviamentos.map((item) => custoConsumo(item, 'aviamentos')),
  ];
  const pendentes = custos.filter((valor) => valor === null).length;
  const soma = custos.reduce<number>((total, valor) => total + (valor ?? 0), 0);
  return {
    total: custos.length && !pendentes && Number.isFinite(soma) ? soma : null,
    pendentes,
    itens: custos.length,
  };
}

/** A aba e o cabeçalho usam a mesma base, cor, tamanho e configuração de cálculo. */
export function precificacaoVariante(
  variante: FichaVariante,
  custosLinx?: LinxFichaCustos | null,
  processos: FichaTerceiro[] = []
) {
  const value = variante.precificacao ?? PRECIFICACAO_INICIAL;
  const integrado = calcularCustosFicha(variante, custosLinx, processos);
  const custo =
    value.baseCusto === 'producao'
      ? {
          total: integrado.total,
          pendentes: integrado.pendentes,
          itens: integrado.linhas.length + integrado.outros.length,
        }
      : integrado.fonte === 'linx'
        ? {
            total: integrado.totalInsumos,
            pendentes: integrado.linhas.filter((row) => row.total === null).length,
            itens: integrado.linhas.length,
          }
        : custoInsumosVariante(variante);
  const resultado = calcularPrecificacao(custo.total, value);
  return {
    value,
    integrado,
    custo,
    resultado,
    precoCabecalho: decimalManual(value.precoAprovado) ?? resultado.precoFinal,
  };
}

/** Markup é um multiplicador; margem é a parcela de lucro no preço de venda. */
export function calcularPrecificacao(
  custo: number | null,
  value: FichaPrecificacao
): ResultadoPrecificacao {
  const fator = decimalManual(value.modo === 'markup' ? value.markup : value.margemLucro);
  const aprovado = decimalManual(value.precoAprovado);
  const valido = fator !== null && (value.modo === 'markup' ? fator > 0 : fator < 100);
  const erroCalculo = valido
    ? ''
    : value.modo === 'markup'
      ? 'Informe um markup maior que zero, como 2,85.'
      : 'Informe uma margem de lucro entre 0% e menos de 100%.';
  const baseValida = custo !== null && Number.isFinite(custo) && custo >= 0;
  const calculado =
    baseValida && valido
      ? value.modo === 'markup'
        ? custo * fator
        : custo / (1 - fator / 100)
      : null;
  const precoFinal = calculado !== null && Number.isFinite(calculado) ? calculado : null;
  const diferenca = precoFinal !== null && aprovado !== null ? aprovado - precoFinal : null;
  return {
    precoFinal,
    custoPercentual:
      precoFinal !== null && precoFinal > 0 && baseValida ? (custo / precoFinal) * 100 : null,
    diferenca,
    diferencaPercentual:
      diferenca !== null && precoFinal !== null && precoFinal > 0
        ? (diferenca / precoFinal) * 100
        : null,
    erroCalculo,
    erroPrecoAprovado:
      value.precoAprovado.trim() && aprovado === null
        ? 'Informe um preço aprovado válido, maior ou igual a zero, sem separador de milhar.'
        : '',
  };
}

export const formatarPercentualPrecificacao = (valor: number | null) =>
  valor === null
    ? '—'
    : new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(valor / 100);
