import type { TecidoCorItem } from '../types/gestao';

/** Compatibilidade de leitura não promove uma descrição antiga a código de integração. */
export function normalizarCatalogoMostruario(value: unknown): TecidoCorItem[] {
  if (!Array.isArray(value)) throw new Error('Resposta inválida do catálogo de mostruário.');
  return value.flatMap((row): TecidoCorItem[] => {
    if (typeof row === 'string') {
      const nome = row.trim();
      return nome ? [{ id: 'linx-cor-' + nome, nome, hex: '', origemMostruario: 'linx' }] : [];
    }
    if (
      !row ||
      typeof row !== 'object' ||
      typeof row.codigo !== 'string' ||
      typeof row.descricao !== 'string'
    )
      return [];
    const codigo = row.codigo.trim();
    const nome = row.descricao.trim();
    if (!codigo || codigo.length > 10 || !nome) return [];
    return [{ id: 'linx-cor-codigo-' + codigo, codigo, nome, hex: '', origemMostruario: 'linx' }];
  });
}
