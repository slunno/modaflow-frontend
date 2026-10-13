import type { FichaCorte } from '../types/ficha';
import type { TecidoCorItem } from '../types/gestao';

export const getCorteCorKey = (cor: Pick<TecidoCorItem, 'nome' | 'codigo'>) =>
  JSON.stringify([cor.nome.trim().toLocaleLowerCase(), cor.codigo?.trim() ?? '']);

/** Mantém as quantidades das cores e tamanhos que continuam selecionados em Geral. */
export function sincronizarTabelaCorte(
  anterior: FichaCorte | undefined,
  tamanhos: string[],
  cores: TecidoCorItem[]
): FichaCorte {
  const grade = [...new Set(tamanhos.map((tamanho) => tamanho.trim()).filter(Boolean))];
  const linhasAnteriores = new Map(
    anterior?.linhas.map((linha) => [getCorteCorKey(linha.cor), linha])
  );
  const coresSelecionadas = new Map(cores.map((cor) => [getCorteCorKey(cor), cor]));
  return {
    tamanhos: grade,
    linhas: [...coresSelecionadas.entries()].map(([key, cor]) => ({
      cor: { id: cor.id, nome: cor.nome, codigo: cor.codigo },
      quantidades: Object.fromEntries(
        grade.map((tamanho) => [tamanho, linhasAnteriores.get(key)?.quantidades[tamanho] ?? ''])
      ),
    })),
  };
}
