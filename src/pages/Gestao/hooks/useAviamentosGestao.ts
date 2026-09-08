/**
 * ============================================================================
 * HOOK: useAviamentosGestao
 * ARQUIVO: src/pages/Gestao/hooks/useAviamentosGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Aviamentos.
 * ============================================================================
 */

import { useState } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState';
import type { TecidoInsumoItem } from '../../../types/gestao';

export function useAviamentosGestao() {
  const [aviamentosList, setAviamentosList] = usePersistedState<TecidoInsumoItem[]>(
    'modaflow_aviamentos_data',
    []
  );
  const [searchAviamentoInsumo, setSearchAviamentoInsumo] = useState('');
  const [searchAviamentoCor, setSearchAviamentoCor] = useState('');
  const [searchAviamentoFornecedor, setSearchAviamentoFornecedor] = useState('');
  const [showOpcoesAviamentoMenu, setShowOpcoesAviamentoMenu] = useState(false);
  const [opcoesAviamentoSubMenu, setOpcoesAviamentoSubMenu] = useState<'main' | 'exportar'>('main');
  const [openMenuAviamentoId, setOpenMenuAviamentoId] = useState<string | null>(null);

  const addAviamento = (aviamento: TecidoInsumoItem) => {
    setAviamentosList((prev) => [aviamento, ...prev]);
  };

  const updateAviamento = (aviamento: TecidoInsumoItem) => {
    setAviamentosList((prev) => prev.map((a) => (a.id === aviamento.id ? aviamento : a)));
  };

  const deleteAviamento = (id: string) => {
    setOpenMenuAviamentoId(null);
    setAviamentosList((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    aviamentosList,
    setAviamentosList,
    searchAviamentoInsumo,
    setSearchAviamentoInsumo,
    searchAviamentoCor,
    setSearchAviamentoCor,
    searchAviamentoFornecedor,
    setSearchAviamentoFornecedor,
    showOpcoesAviamentoMenu,
    setShowOpcoesAviamentoMenu,
    opcoesAviamentoSubMenu,
    setOpcoesAviamentoSubMenu,
    openMenuAviamentoId,
    setOpenMenuAviamentoId,
    addAviamento,
    updateAviamento,
    deleteAviamento,
  };
}
