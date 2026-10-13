/**
 * ============================================================================
 * HOOK: useTecidosGestao
 * ARQUIVO: src/pages/Gestao/hooks/useTecidosGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Tecidos via /insumos?tipo=TECIDO.
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TecidoInsumoItem } from '../../../types/gestao';
import { getInsumos, createInsumo, deleteInsumo } from '../../../services/plmService';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { decimalManual } from '../../../services/fichaProcesso';

type TecidoDetalhesLocais = Pick<
  TecidoInsumoItem,
  | 'custo'
  | 'unidade'
  | 'consumo'
  | 'peso'
  | 'quantidade'
  | 'fornecedoresList'
  | 'imagensList'
  | 'composicoesList'
  | 'coresList'
  | 'corEmEdicaoId'
  | 'corLinx'
  | 'precoLinx'
  | 'propriedades'
>;

function detalhesDoTecido(tecido: TecidoInsumoItem): TecidoDetalhesLocais {
  return {
    custo: tecido.custo,
    unidade: tecido.unidade,
    consumo: tecido.consumo,
    peso: tecido.peso,
    quantidade: tecido.quantidade,
    fornecedoresList: tecido.fornecedoresList,
    imagensList: tecido.imagensList,
    composicoesList: tecido.composicoesList,
    coresList: tecido.coresList,
    corEmEdicaoId: tecido.corEmEdicaoId,
    corLinx: tecido.corLinx,
    precoLinx: tecido.precoLinx,
    propriedades: tecido.propriedades,
  };
}

export function useTecidosGestao() {
  const [tecidosBase, setTecidosList] = useState<TecidoInsumoItem[]>([]);
  const [detalhesLocais, setDetalhesLocais] = usePersistedState<
    Record<string, TecidoDetalhesLocais>
  >('modaflow_tecidos_detalhes', {});
  const tecidosList = useMemo(
    () =>
      tecidosBase.map((tecido) => ({
        ...tecido,
        ...detalhesLocais[tecido.id],
      })),
    [tecidosBase, detalhesLocais]
  );
  const [isLoadingTecidos, setIsLoadingTecidos] = useState(false);
  const [tecidosError, setTecidosError] = useState<string | null>(null);

  const [searchTecidoInsumo, setSearchTecidoInsumo] = useState('');
  const [searchTecidoCor, setSearchTecidoCor] = useState('');
  const [searchTecidoFornecedor, setSearchTecidoFornecedor] = useState('');
  const [showOpcoesTecidoMenu, setShowOpcoesTecidoMenu] = useState(false);
  const [opcoesTecidoSubMenu, setOpcoesTecidoSubMenu] = useState<'main' | 'exportar'>('main');
  const [openMenuTecidoId, setOpenMenuTecidoId] = useState<string | null>(null);

  const loadTecidos = useCallback(async () => {
    setIsLoadingTecidos(true);
    setTecidosError(null);
    try {
      const data = await getInsumos('TECIDO');
      setTecidosList(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar tecidos na API.';
      setTecidosError(msg);
    } finally {
      setIsLoadingTecidos(false);
    }
  }, []);

  useEffect(() => {
    loadTecidos();
  }, [loadTecidos]);

  const addTecido = async (tecido: TecidoInsumoItem) => {
    try {
      const numericCusto = decimalManual(tecido.custo);
      const created = await createInsumo({
        nome: tecido.nome,
        codigo: tecido.codigo,
        tipo: 'TECIDO',
        custo: numericCusto ?? undefined,
        fornecedorNome: tecido.fornecedores,
        temErp: tecido.temErp,
        imagemUrl: tecido.imagemUrl,
        unidadeMedida: tecido.unidade,
        observacoes: tecido.observacoes,
      });
      setDetalhesLocais((previous) => ({ ...previous, [created.id]: detalhesDoTecido(tecido) }));
      setTecidosList((prev) => [created, ...prev]);
    } catch {
      // Fallback local se a API estiver em manutenção
      setTecidosList((prev) => [tecido, ...prev]);
    }
  };

  const updateTecido = (tecido: TecidoInsumoItem) => {
    setDetalhesLocais((previous) => ({ ...previous, [tecido.id]: detalhesDoTecido(tecido) }));
    setTecidosList((prev) => prev.map((t) => (t.id === tecido.id ? tecido : t)));
  };

  const removeTecido = async (id: string) => {
    setOpenMenuTecidoId(null);
    try {
      await deleteInsumo(id);
    } catch {
      // Silencia
    }
    setTecidosList((prev) => prev.filter((t) => t.id !== id));
    setDetalhesLocais((previous) =>
      Object.fromEntries(Object.entries(previous).filter(([key]) => key !== id))
    );
  };

  return {
    tecidosList,
    setTecidosList,
    isLoadingTecidos,
    tecidosError,
    reloadTecidos: loadTecidos,
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
    deleteTecido: removeTecido,
  };
}
