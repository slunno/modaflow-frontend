/**
 * ============================================================================
 * HOOK: useMarcasGestao
 * ARQUIVO: src/pages/Gestao/hooks/useMarcasGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Marcas.
 * ============================================================================
 */

import { useState } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { MOCK_MARCAS } from '../../../contexts/AuthContext';
import type { MarcaSummary } from '../../../types/auth';

export function useMarcasGestao() {
  const [marcasList, setMarcasList] = usePersistedState<MarcaSummary[]>(
    'modaflow_marcas_data',
    MOCK_MARCAS
  );
  const [searchMarca, setSearchMarca] = useState('');
  const [openMenuMarcaId, setOpenMenuMarcaId] = useState<string | null>(null);

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
