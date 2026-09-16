/**
 * ============================================================================
 * HOOK: useCaracteristicasGestao
 * ARQUIVO: src/pages/Gestao/hooks/useCaracteristicasGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Características.
 * ============================================================================
 */

import { useState } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState';
import type { CaracteristicaRecord } from '../tabs/CaracteristicasTab';

export function useCaracteristicasGestao() {
  const [caracteristicasList, setCaracteristicasList] = usePersistedState<CaracteristicaRecord[]>(
    'modaflow_caracteristicas_data',
    []
  );
  const [caracteristicaFilterMarca, setCaracteristicaFilterMarca] = useState<string>('');
  const [caracteristicaSearchQuery, setCaracteristicaSearchQuery] = useState('');
  const [openMenuCaracteristicaId, setOpenMenuCaracteristicaId] = useState<string | null>(null);

  const addCaracteristica = (item: CaracteristicaRecord) => {
    setCaracteristicasList((prev) => [item, ...prev]);
  };

  const deleteCaracteristica = (id: string) => {
    setOpenMenuCaracteristicaId(null);
    setCaracteristicasList((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    caracteristicasList,
    setCaracteristicasList,
    caracteristicaFilterMarca,
    setCaracteristicaFilterMarca,
    caracteristicaSearchQuery,
    setCaracteristicaSearchQuery,
    openMenuCaracteristicaId,
    setOpenMenuCaracteristicaId,
    addCaracteristica,
    deleteCaracteristica,
  };
}
