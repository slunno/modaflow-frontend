import type { PecaItem } from '../../../types/plm';
export function collectionDate(value: string): Date | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value.trim());
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!iso && !br) return null;
  const year = Number(iso?.[1] ?? br?.[3]);
  const month = Number(iso?.[2] ?? br?.[2]);
  const day = Number(iso?.[3] ?? br?.[1]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}
export const completedPiece = (piece: PecaItem) =>
  ['completa', 'concluída', 'concluida'].includes(piece.status.toLocaleLowerCase());

export const collectionFooter =
  'sticky -bottom-5 z-10 -mx-5 -mb-5 mt-5 flex flex-wrap justify-end gap-2 border-t border-border bg-surface p-4';
