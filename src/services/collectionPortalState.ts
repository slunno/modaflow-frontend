import type { ColecaoItem } from '../types/plm';
import { getLocalStateSnapshot, parseLocalState, saveLocalState } from './localStateStorage';

export const COLLECTION_PORTAL_STATE_KEY = 'modaflow_collection_portal_state';

/** Organização local do portal. Não modifica nem exclui os cadastros do Linx. */
export interface CollectionPortalState {
  collectionId: string;
  marcaId: string;
  archived?: boolean;
  hidden?: boolean;
}

function identity(marcaId: string, collectionId: string) {
  return JSON.stringify([marcaId, collectionId]);
}

export function applyCollectionPortalState(
  collections: ColecaoItem[],
  states: CollectionPortalState[],
  marcaId?: string
): ColecaoItem[] {
  const byCollection = new Map(
    states.map((state) => [identity(state.marcaId, state.collectionId), state])
  );
  return collections.flatMap((collection) => {
    const state = byCollection.get(identity(marcaId ?? collection.marcaId ?? '', collection.id));
    if (state?.hidden) return [];
    return [state?.archived ? { ...collection, status: 'Arquivadas' } : collection];
  });
}

export function changeCollectionPortalState(
  marcaId: string,
  collectionId: string,
  update: (previous: CollectionPortalState | undefined) => CollectionPortalState | undefined
) {
  const saved = parseLocalState<CollectionPortalState[]>(
    getLocalStateSnapshot(COLLECTION_PORTAL_STATE_KEY),
    []
  );
  const states = Array.isArray(saved) ? saved : [];
  const same = (state: CollectionPortalState) =>
    state.marcaId === marcaId && state.collectionId === collectionId;
  const previous = states.find(same);
  const next = update(previous);
  // Falhas de armazenamento são propagadas para a tela, sem anunciar sucesso falso.
  saveLocalState(COLLECTION_PORTAL_STATE_KEY, [
    ...states.filter((state) => !same(state)),
    ...(next ? [{ ...next, marcaId, collectionId }] : []),
  ]);
  return { previous, next };
}
