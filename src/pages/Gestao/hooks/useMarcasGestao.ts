/**
 * ============================================================================
 * HOOK: useMarcasGestao
 * ARQUIVO: src/pages/Gestao/hooks/useMarcasGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Marcas, sincronizando
 *            diretamente com a API REST do backend Spring Boot (/marcas).
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import type { MarcaSummary } from '../../../types/auth';
import { getBrands, createBrand, updateBrand } from '../../../services/plmService';
import { normalizeId } from '../../../services/contractMappers';

export function useMarcasGestao() {
  const [marcasList, setMarcasList] = useState<MarcaSummary[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [searchMarca, setSearchMarca] = useState('');
  const [openMenuMarcaId, setOpenMenuMarcaId] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setIsLoadingBrands(true);
    setBrandsError(null);
    try {
      const data = await getBrands();
      setMarcasList(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar marcas na API.';
      setBrandsError(msg);
    } finally {
      setIsLoadingBrands(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  /**
   * Cria nova marca no backend (POST /marcas) e atualiza a lista
   */
  const addMarca = async (marcaData: {
    nome: string;
    code: string;
    initials?: string;
    heroImageUrl?: string;
    logoUrl?: string;
    description?: string;
    badgeTag?: string;
  }): Promise<MarcaSummary> => {
    const created = await createBrand(marcaData);
    setMarcasList((prev) => [...prev, created]);
    return created;
  };

  /**
   * Atualiza marca existente no backend (PUT /marcas/{id})
   */
  const saveMarca = async (
    id: string | number,
    marcaData: {
      nome?: string;
      code?: string;
      initials?: string;
      heroImageUrl?: string;
      logoUrl?: string;
      description?: string;
      badgeTag?: string;
    }
  ): Promise<MarcaSummary> => {
    const updated = await updateBrand(id, marcaData);
    setMarcasList((prev) => prev.map((m) => (normalizeId(m.id) === normalizeId(id) ? updated : m)));
    return updated;
  };

  return {
    marcasList,
    setMarcasList,
    isLoadingBrands,
    brandsError,
    reloadBrands: loadBrands,
    searchMarca,
    setSearchMarca,
    openMenuMarcaId,
    setOpenMenuMarcaId,
    addMarca,
    updateMarca: saveMarca,
  };
}
