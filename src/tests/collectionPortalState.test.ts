import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyCollectionPortalState,
  changeCollectionPortalState,
  COLLECTION_PORTAL_STATE_KEY,
} from '../services/collectionPortalState';
import type { ColecaoItem } from '../types/plm';

const collection: ColecaoItem = {
  id: 'mesmo-id',
  marcaId: 'marca-a',
  nome: 'Coleção A',
  marcaNome: 'A',
  status: 'Completas',
  dataEntrega: '',
  diasAtraso: 0,
};
describe('Estado de coleção exclusivo do portal', () => {
  beforeEach(() => localStorage.clear());
  it('isola a marca, preserva a origem e prioriza exclusão sobre arquivamento', () => {
    const another = { ...collection, marcaId: 'marca-b' };
    const states = [{ marcaId: 'marca-a', collectionId: collection.id, archived: true }];
    expect(applyCollectionPortalState([collection, another], states)).toEqual([
      { ...collection, status: 'Arquivadas' },
      another,
    ]);
    expect(collection.status).toBe('Completas');
    expect(
      applyCollectionPortalState([collection, another], [{ ...states[0]!, hidden: true }])
    ).toEqual([another]);
  });
  it('grava sobre o estado atual e mantém ações de outras coleções', () => {
    changeCollectionPortalState('marca-b', 'outra', () => ({
      marcaId: 'marca-b',
      collectionId: 'outra',
      hidden: true,
    }));
    const change = changeCollectionPortalState('marca-a', collection.id, () => ({
      marcaId: 'marca-a',
      collectionId: collection.id,
      archived: true,
    }));
    expect(change.previous).toBeUndefined();
    changeCollectionPortalState('marca-a', collection.id, () => change.previous);
    expect(JSON.parse(localStorage.getItem(COLLECTION_PORTAL_STATE_KEY)!)).toEqual([
      { marcaId: 'marca-b', collectionId: 'outra', hidden: true },
    ]);
  });
});
