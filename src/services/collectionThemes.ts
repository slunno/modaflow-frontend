import type { PecaItem } from '../types/plm';

export interface CollectionTheme {
  id: string;
  collectionId: string;
  name: string;
  colors: string[];
  delivery: string;
  deliveryDate: string;
}

export const effectiveTheme = (value?: string) =>
  !value?.trim() || value.trim() === '—' ? 'Base' : value.trim();

export function getCollectionThemes(
  collectionId: string,
  savedThemes: CollectionTheme[],
  pieces: PecaItem[]
): CollectionTheme[] {
  const themes: CollectionTheme[] = [
    { id: 'base', collectionId, name: 'Base', colors: [], delivery: '', deliveryDate: '' },
    ...savedThemes.filter((theme) => theme.collectionId === collectionId),
  ];
  for (const piece of pieces) {
    const name = effectiveTheme(piece.tema);
    if (!themes.some((theme) => theme.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      themes.push({
        id: `imported-${name}`,
        collectionId,
        name,
        colors: [],
        delivery: '',
        deliveryDate: '',
      });
    }
  }
  return themes;
}
