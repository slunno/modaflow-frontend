import type { PecaItem } from '../types/plm';
import { getLocalStateSnapshot, parseLocalState, saveLocalState } from './localStateStorage';

export const LOCAL_PECAS_KEY = 'modaflow_collection_pecas';

/** A identidade inclui a coleção e a marca; o código do produto pode se repetir. */
export function savePecaLocal(updated: PecaItem): void {
  const pieces = parseLocalState<PecaItem[]>(getLocalStateSnapshot(LOCAL_PECAS_KEY), []);
  const index = pieces.findIndex(
    (piece) =>
      piece.id === updated.id &&
      piece.colecaoId === updated.colecaoId &&
      (!piece.marcaId || piece.marcaId === updated.marcaId)
  );
  const next =
    index === -1 ? [updated, ...pieces] : pieces.map((piece, i) => (i === index ? updated : piece));
  saveLocalState(LOCAL_PECAS_KEY, next);
}
