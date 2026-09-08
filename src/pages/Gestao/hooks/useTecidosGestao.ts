/**
 * ============================================================================
 * HOOK: useTecidosGestao
 * ARQUIVO: src/pages/Gestao/hooks/useTecidosGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Tecidos.
 * ============================================================================
 */

import { useState } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState';
import type { TecidoInsumoItem } from '../../../types/gestao';

export function useTecidosGestao() {
  const [tecidosList, setTecidosList] = usePersistedState<TecidoInsumoItem[]>(
    'modaflow_tecidos_data',
    []
  );
  const [searchTecidoInsumo, setSearchTecidoInsumo] = useState('');
  const [searchTecidoCor, setSearchTecidoCor] = useState('');
  const [searchTecidoFornecedor, setSearchTecidoFornecedor] = useState('');
  const [showOpcoesTecidoMenu, setShowOpcoesTecidoMenu] = useState(false);
  const [opcoesTecidoSubMenu, setOpcoesTecidoSubMenu] = useState<'main' | 'exportar'>('main');
  const [openMenuTecidoId, setOpenMenuTecidoId] = useState<string | null>(null);

  const addTecido = (tecido: TecidoInsumoItem) => {
    setTecidosList((prev) => [tecido, ...prev]);
  };

  const updateTecido = (tecido: TecidoInsumoItem) => {
    setTecidosList((prev) => prev.map((t) => (t.id === tecido.id ? tecido : t)));
  };

  const deleteTecido = (id: string) => {
    setOpenMenuTecidoId(null);
    setTecidosList((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tecidosList,
    setTecidosList,
    searchTecidoInsumo,
    setSearchTecidoInsumo,
    searchTecidoCor,
    setSearchTecidoCor,
    searchTecidoFornecedor,
    setSearchTecidoFornecedor,
    showOpcoesTecidoMenu,
    setShowOpcoesTecidoMenu,
    opcoesTecidoSubMenu,
    setOpcoesTecidoSubMenu,
    openMenuTecidoId,
    setOpenMenuTecidoId,
    addTecido,
    updateTecido,
    deleteTecido,
  };
}
