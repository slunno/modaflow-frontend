import { saveLocalState } from './localStateStorage';
import { normalizeProductUso, PRODUCT_USO_EVENT, readProductUsos } from './productUsoStorage';

/** Catálogos próprios de Terceiros, separados dos usos de tecidos e aviamentos. */
export function getProductTerceiroKey(produto: string, campo: 'tela' | 'tecnica') {
  return `modaflow_product_terceiros_v1:${encodeURIComponent(normalizeProductUso(produto))}:${campo}`;
}

export function removeProductTerceiroOption(key: string, value: string) {
  saveLocalState(
    key,
    readProductUsos(key).filter(
      (entry) => normalizeProductUso(entry) !== normalizeProductUso(value)
    )
  );
  window.dispatchEvent(new CustomEvent(PRODUCT_USO_EVENT, { detail: key }));
}
