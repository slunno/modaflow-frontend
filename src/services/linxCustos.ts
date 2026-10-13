import type { LinxFichaValor } from '../types/linx';

export type LinxCustoRegistro = Record<string, LinxFichaValor>;

const numeroDecimal = /^-?\d+(?:\.\d+)?$/;
const formatoNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 });
const formatoDinheiro = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 4,
  maximumFractionDigits: 8,
});

/** Não interpreta textos localizados, não arredonda para centavos nem transforma NULL em zero. */
export function numeroCustoLinx(valor: LinxFichaValor | undefined): number | null {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== 'string' || !numeroDecimal.test(valor.trim())) return null;
  const numero = Number(valor.trim());
  return Number.isFinite(numero) ? numero : null;
}

export function textoCustoLinx(valor: LinxFichaValor | undefined): string {
  if (valor === null || valor === undefined || valor === '') return 'Não informado';
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
  const texto = String(valor).trim();
  return texto || 'Não informado';
}

export function valorCustoLinx(valor: LinxFichaValor | undefined, moeda = false): string {
  const numero = numeroCustoLinx(valor);
  if (numero === null) return textoCustoLinx(valor);
  return (moeda ? formatoDinheiro : formatoNumero).format(numero);
}

export function chaveCustoLinx(valor: LinxFichaValor | undefined): string {
  return valor === null || valor === undefined ? '' : String(valor).trim();
}

const descricoesSituacao: Record<string, string> = {
  CALCULADO: 'Expressão verificada retornada pelo SQL',
  FORA_FORMACAO_PRECO: 'Subgrupo configurado para não participar da formação do preço',
  PENDENTE_SEMIACABADO: 'Regra de semiacabados não aplicada ao cálculo do portal',
  PENDENTE_VINCULO_ITEM:
    'Item reutilizado entre materiais; vínculo do cálculo precisa de confirmação',
  SEM_TAMANHO: 'Grade atual sem rótulo de tamanho; custo não calculado',
  PENDENTE_DADOS: 'Dados necessários ausentes ou fator de conversão inválido; sem estimativa',
};

export function situacaoCustoLinx(valor: LinxFichaValor | undefined): string {
  const codigo = chaveCustoLinx(valor);
  return descricoesSituacao[codigo] ?? textoCustoLinx(valor);
}

export function posicaoCustoLinx(registro: LinxCustoRegistro): number | null {
  const posicao = numeroCustoLinx(registro.POSICAO);
  return posicao !== null && Number.isInteger(posicao) && posicao >= 1 && posicao <= 48
    ? posicao
    : null;
}

export function filtrarMateriaisCustoLinx(
  materiais: LinxCustoRegistro[],
  corProduto: string,
  posicao: number | null
): LinxCustoRegistro[] {
  if (posicao === null) return [];
  return materiais.filter(
    (material) =>
      chaveCustoLinx(material.COR_PRODUTO) === corProduto && posicaoCustoLinx(material) === posicao
  );
}
