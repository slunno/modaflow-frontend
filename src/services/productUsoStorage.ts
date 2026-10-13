import type { PecaItem } from '../types/plm';
import { saveLocalState } from './localStateStorage';

export const PRODUCT_USO_EVENT = 'modaflow:product-uso-saved';

export const normalizeProductUso = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR');

/** Usa o subgrupo original do Linx ou o tipo escolhido na criação, nunca o nome editável. */
export function getPecaUsoProduct(peca: PecaItem): string {
  return peca.linxCadastro?.subgrupo?.trim() || peca.tipo.trim();
}

/** Compartilha pelo tipo de peça em todas as marcas e coleções. */
export function getProductUsoKey(produto: string, tipo: 'tecido' | 'aviamento') {
  return `modaflow_product_usos_v2:${encodeURIComponent(normalizeProductUso(produto))}:${tipo}`;
}

function readList(key: string): string[] {
  const stored: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
  if (!Array.isArray(stored) || !stored.every((value) => typeof value === 'string')) {
    throw new Error('As opções salvas de Uso não puderam ser lidas.');
  }
  return stored;
}

export function isProductUsoStorageKey(key: string, target: string): boolean {
  if (key === target) return true;
  const legacy = key.match(/^modaflow_product_usos_v1:([^:]*):([^:]*):(tecido|aviamento)$/);
  if (!legacy) return false;
  try {
    return (
      getProductUsoKey(decodeURIComponent(legacy[2]!), legacy[3] as 'tecido' | 'aviamento') ===
      target
    );
  } catch {
    return false;
  }
}

export function readProductUsos(key: string): string[] {
  const values = readList(key);
  // Recupera os usos antigos de todas as marcas, sem alterar os registros originais.
  for (let index = 0; index < localStorage.length; index++) {
    const legacyKey = localStorage.key(index);
    if (!legacyKey || legacyKey === key || !isProductUsoStorageKey(legacyKey, key)) continue;
    try {
      values.push(...readList(legacyKey));
    } catch {
      // Um registro antigo inválido não impede a leitura dos usos válidos.
    }
  }
  const unique = new Map<string, string>();
  for (const value of values) {
    const normalized = normalizeProductUso(value);
    if (normalized && !unique.has(normalized)) unique.set(normalized, value.trim());
  }
  return [...unique.values()];
}

export function saveProductUso(key: string, value: string): void {
  const uso = value.trim();
  if (!uso) throw new Error('Digite um uso antes de salvar.');
  const values = readProductUsos(key);
  if (!values.some((entry) => normalizeProductUso(entry) === normalizeProductUso(uso)))
    values.push(uso);
  saveLocalState(key, values);
  window.dispatchEvent(new CustomEvent(PRODUCT_USO_EVENT, { detail: key }));
}
