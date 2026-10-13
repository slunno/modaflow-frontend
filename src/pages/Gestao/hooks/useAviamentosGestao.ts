/**
 * ============================================================================
 * HOOK: useAviamentosGestao
 * ARQUIVO: src/pages/Gestao/hooks/useAviamentosGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Aviamentos via /insumos?tipo=AVIAMENTO.
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TecidoInsumoItem } from '../../../types/gestao';
import { getInsumos, createInsumo, deleteInsumo } from '../../../services/plmService';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { decimalManual } from '../../../services/fichaProcesso';

type AviamentoDetalhesLocais = Pick<
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
>;

function detalhesDoAviamento(aviamento: TecidoInsumoItem): AviamentoDetalhesLocais {
  return {
    custo: aviamento.custo,
    unidade: aviamento.unidade,
    consumo: aviamento.consumo,
    peso: aviamento.peso,
    quantidade: aviamento.quantidade,
    fornecedoresList: aviamento.fornecedoresList,
    imagensList: aviamento.imagensList,
    composicoesList: aviamento.composicoesList,
    coresList: aviamento.coresList,
    corEmEdicaoId: aviamento.corEmEdicaoId,
    corLinx: aviamento.corLinx,
    precoLinx: aviamento.precoLinx,
  };
}

export function useAviamentosGestao() {
  const [aviamentosBase, setAviamentosList] = useState<TecidoInsumoItem[]>([]);
  const [detalhesLocais, setDetalhesLocais] = usePersistedState<
    Record<string, AviamentoDetalhesLocais>
  >('modaflow_aviamentos_detalhes', {});
  const aviamentosList = useMemo(
    () =>
      aviamentosBase.map((aviamento) => ({
        ...aviamento,
        ...detalhesLocais[aviamento.id],
      })),
    [aviamentosBase, detalhesLocais]
  );
  const [isLoadingAviamentos, setIsLoadingAviamentos] = useState(false);
  const [aviamentosError, setAviamentosError] = useState<string | null>(null);

  const [searchAviamentoInsumo, setSearchAviamentoInsumo] = useState('');
  const [searchAviamentoCor, setSearchAviamentoCor] = useState('');
  const [searchAviamentoFornecedor, setSearchAviamentoFornecedor] = useState('');
  const [showOpcoesAviamentoMenu, setShowOpcoesAviamentoMenu] = useState(false);
  const [opcoesAviamentoSubMenu, setOpcoesAviamentoSubMenu] = useState<'main' | 'exportar'>('main');
  const [openMenuAviamentoId, setOpenMenuAviamentoId] = useState<string | null>(null);

  const loadAviamentos = useCallback(async () => {
    setIsLoadingAviamentos(true);
    setAviamentosError(null);
    try {
      const data = await getInsumos('AVIAMENTO');
      setAviamentosList(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar aviamentos na API.';
      setAviamentosError(msg);
    } finally {
      setIsLoadingAviamentos(false);
    }
  }, []);

  useEffect(() => {
    loadAviamentos();
  }, [loadAviamentos]);

  const addAviamento = async (aviamento: TecidoInsumoItem) => {
    try {
      const numericCusto = decimalManual(aviamento.custo);
      const created = await createInsumo({
        nome: aviamento.nome,
        codigo: aviamento.codigo,
        tipo: 'AVIAMENTO',
        custo: numericCusto ?? undefined,
        fornecedorNome: aviamento.fornecedores,
        temErp: aviamento.temErp,
        imagemUrl: aviamento.imagemUrl,
        unidadeMedida: aviamento.unidade,
        observacoes: aviamento.observacoes,
      });
      setDetalhesLocais((previous) => ({
        ...previous,
        [created.id]: detalhesDoAviamento(aviamento),
      }));
      setAviamentosList((prev) => [created, ...prev]);
    } catch {
      setAviamentosList((prev) => [aviamento, ...prev]);
    }
  };

  const updateAviamento = (aviamento: TecidoInsumoItem) => {
    setDetalhesLocais((previous) => ({
      ...previous,
      [aviamento.id]: detalhesDoAviamento(aviamento),
    }));
    setAviamentosList((prev) => prev.map((a) => (a.id === aviamento.id ? aviamento : a)));
  };

  const removeAviamento = async (id: string) => {
    setOpenMenuAviamentoId(null);
    try {
      await deleteInsumo(id);
    } catch {
      // Silencia
    }
    setAviamentosList((prev) => prev.filter((a) => a.id !== id));
    setDetalhesLocais((previous) =>
      Object.fromEntries(Object.entries(previous).filter(([key]) => key !== id))
    );
  };

  return {
    aviamentosList,
    setAviamentosList,
    isLoadingAviamentos,
    aviamentosError,
    reloadAviamentos: loadAviamentos,
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
    deleteAviamento: removeAviamento,
  };
}
