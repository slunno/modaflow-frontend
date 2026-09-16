/**
 * ============================================================================
 * HOOK: useMarcasGestao
 * ARQUIVO: src/pages/Gestao/hooks/useMarcasGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Marcas.
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState';
import type { MarcaSummary } from '../../../types/auth';
import { getBrands } from '../../../services/plmService';

export function useMarcasGestao() {
  const [marcasList, setMarcasList] = usePersistedState<MarcaSummary[]>('modaflow_marcas_data', []);
  const [searchMarca, setSearchMarca] = useState('');
  const [openMenuMarcaId, setOpenMenuMarcaId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getBrands()
      .then((data) => {
        if (isMounted && data.length > 0) setMarcasList(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [setMarcasList]);

  const addMarca = (marca: MarcaSummary) => {
    setMarcasList((prev) => [...prev, marca]);
  };

  const updateMarca = (marca: MarcaSummary) => {
    setMarcasList((prev) => prev.map((m) => (m.id === marca.id ? marca : m)));
  };

  return {
    marcasList,
    setMarcasList,
    searchMarca,
    setSearchMarca,
    openMenuMarcaId,
    setOpenMenuMarcaId,
    addMarca,
    updateMarca,
  };
}
