import type { FichaInsumo } from '../types/ficha';

export type ConsumosPorTamanho = NonNullable<FichaInsumo['consumoPorTamanho']>;
type ConsumoPorTamanho = ConsumosPorTamanho[string];

/** Copia valores, nunca a declaração de outro insumo/variante. */
export function clonarInsumoSemConfirmacoes(item: FichaInsumo): FichaInsumo {
  const clone = structuredClone(removerConfirmacoesInsumo(item));
  clone.id = crypto.randomUUID();
  return clone;
}

export function removerConfirmacoesInsumo(item: FichaInsumo): FichaInsumo {
  return {
    ...item,
    consumoPorTamanho:
      item.consumoPorTamanho &&
      Object.fromEntries(
        Object.entries(item.consumoPorTamanho).map(([tamanho, consumo]) => {
          const proximo = { ...consumo };
          delete proximo.confirmacaoZero;
          return [tamanho, proximo];
        })
      ),
  };
}

export interface LinhaConsumoTamanho {
  tamanho: string;
  foraGrade: boolean;
  consumo?: ConsumoPorTamanho;
}

/** Grade de exibição local: não atribui posições C1…C48 nem altera dados do ERP. */
export function listarConsumosPorTamanho(
  tamanhos: readonly string[],
  consumos?: ConsumosPorTamanho
): LinhaConsumoTamanho[] {
  const grade = new Set(tamanhos.filter((tamanho) => tamanho.trim().length > 0));
  const entradas = Object.entries(consumos ?? {});
  const porTamanho = new Map(entradas);
  return [
    ...Array.from(grade, (tamanho) => ({
      tamanho,
      foraGrade: false,
      consumo: porTamanho.get(tamanho),
    })),
    ...entradas
      .filter(([tamanho]) => !grade.has(tamanho))
      .map(([tamanho, consumo]) => ({ tamanho, foraGrade: true, consumo })),
  ];
}

/** Atualiza somente a entrada indicada e preserva valores ao marcar/desmarcar a dispensa. */
export function atualizarConsumoPorTamanho(
  consumos: ConsumosPorTamanho | undefined,
  tamanho: string,
  changes: Partial<ConsumoPorTamanho>
): ConsumosPorTamanho {
  const anterior = Object.entries(consumos ?? {}).find(([key]) => key === tamanho)?.[1];
  const entrada = { valor: '', ...anterior, ...changes };
  if (
    ('valor' in changes && changes.valor !== anterior?.valor) ||
    ('naoSeAplica' in changes && changes.naoSeAplica !== anterior?.naoSeAplica)
  )
    delete entrada.confirmacaoZero;
  return {
    ...consumos,
    [tamanho]: entrada,
  };
}
