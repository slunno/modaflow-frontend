/**
 * ============================================================================
 * PÁGINA: Planejamento Visual Kanban (KanbanPage)
 * ARQUIVO: src/pages/Kanban/KanbanPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Quadro Kanban conectado aos endpoints reais GET /kanban e
 *            PATCH /kanban/pecas/{id}/etapa, suportando as 23 etapas,
 *            movimentação por teclado e resolução de conflitos com rollback.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Kanban,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  User,
} from 'lucide-react';
import { getKanbanPecas, moveKanbanPeca } from '../../services/plmService';
import { useAuth } from '../../hooks/useAuth';
import type { PecaKanbanResponseDTO, EtapaPecaEnum } from '../../types/dtos';
import { ApiError } from '../../services/api';

const ETAPAS_KANBAN: Array<{ key: EtapaPecaEnum; label: string; number: number }> = [
  { key: 'GERACAO_FICHA', label: '01 Geração de Ficha', number: 1 },
  { key: 'ENGENHARIA_RECEBIMENTO', label: '02 Engenharia Recebimento', number: 2 },
  { key: 'MODELAGEM', label: '03 Modelagem', number: 3 },
  { key: 'MINI_RISCO_CONSUMO', label: '04 Mini Risco / Consumo', number: 4 },
  { key: 'CHECAGEM_MP_LINX', label: '05 Checagem MP Linx', number: 5 },
  { key: 'AGUARDANDO_TECIDO_FORNECEDOR', label: '06 Aguardando Tecido', number: 6 },
  { key: 'ESTOQUE_TECIDOS_MATRIZ', label: '07 Estoque Tecidos', number: 7 },
  { key: 'REVISAO_INTEGRACAO_GERACAO_OP', label: '08 Revisão / OP', number: 8 },
  { key: 'ENCAIXE_RISCO', label: '09 Encaixe / Risco', number: 9 },
  { key: 'CORTE', label: '10 Corte', number: 10 },
  { key: 'ESTAMPARIA', label: '11 Estamparia', number: 11 },
  { key: 'BORDADO', label: '12 Bordado', number: 12 },
  { key: 'ESTOQUE_AVIAMENTOS', label: '13 Estoque Aviamentos', number: 13 },
  { key: 'CD_LAVANDERIA', label: '14 CD Lavanderia', number: 14 },
  { key: 'LAVANDERIA', label: '15 Lavanderia', number: 15 },
  { key: 'ACABAMENTO', label: '16 Acabamento', number: 16 },
  { key: 'PRE_CUSTO_SEQUENCIA_OPERACIONAL', label: '17 Pré-custo Operacional', number: 17 },
  { key: 'APROVACAO_PILOTO_CM', label: '18 Aprovação Piloto', number: 18 },
  { key: 'FINAL', label: '19 Final', number: 19 },
  { key: 'INICIAL', label: '20 Inicial', number: 20 },
  { key: 'INTEGRACAO_LINX', label: '21 Integração Linx', number: 21 },
  {
    key: 'REVISAR_FICHA_TECNICA_LIBERAR_MOSTRUARIO',
    label: '22 Revisar Ficha / Mostruário',
    number: 22,
  },
  { key: 'DISPONIVEL_VENDA', label: '23 Disponível para Venda', number: 23 },
];

export const KanbanPage: React.FC = () => {
  const { activeMarca } = useAuth();
  const activeMarcaId = activeMarca?.id;
  const [pecas, setPecas] = useState<PecaKanbanResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [conflictError, setConflictError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEtapaFilter, setSelectedEtapaFilter] = useState<string>('TODAS');

  const fetchKanban = useCallback(async () => {
    setIsLoading(true);
    setConflictError('');
    try {
      const data = await getKanbanPecas(activeMarcaId);
      setPecas(data);
    } catch (err) {
      setConflictError(
        err instanceof Error ? err.message : 'Falha ao sincronizar o quadro Kanban com o backend.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeMarcaId]);

  useEffect(() => {
    void fetchKanban();
  }, [fetchKanban]);

  // Movimentação de peça com tratamento de conflitos e rollback
  const handleMovePeca = async (pecaId: number, targetEtapa: EtapaPecaEnum) => {
    const previousPecas = [...pecas];
    const targetPeca = pecas.find((p) => p.id === pecaId);
    if (!targetPeca || targetPeca.etapaAtual === targetEtapa) return;

    // Atualização otimista
    setPecas((prev) => prev.map((p) => (p.id === pecaId ? { ...p, etapaAtual: targetEtapa } : p)));
    setIsUpdating(pecaId);
    setConflictError('');

    try {
      await moveKanbanPeca(pecaId, targetEtapa, activeMarca?.id);
    } catch (err) {
      // Rollback otimista
      setPecas(previousPecas);
      const isConflict = err instanceof ApiError && err.status === 409;
      setConflictError(
        isConflict
          ? `Conflito de concorrência: A peça "${targetPeca.nome}" foi alterada em outra sessão. Recarregando estado atualizado...`
          : `Não foi possível mover a peça "${targetPeca.nome}". A operação foi revertida. ${err instanceof Error ? err.message : 'Confira a ficha antes de entregar para outra etapa.'}`
      );
      void fetchKanban();
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredPecas = useMemo(() => {
    return pecas.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.estilista && p.estilista.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEtapa = selectedEtapaFilter === 'TODAS' || p.etapaAtual === selectedEtapaFilter;

      return matchesSearch && matchesEtapa;
    });
  }, [pecas, searchQuery, selectedEtapaFilter]);

  const displayedEtapas = useMemo(() => {
    if (selectedEtapaFilter === 'TODAS') return ETAPAS_KANBAN;
    return ETAPAS_KANBAN.filter((e) => e.key === selectedEtapaFilter);
  }, [selectedEtapaFilter]);

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans animate-in fade-in duration-200">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-muted pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold font-editorial text-primary tracking-wide flex items-center gap-2">
              <Kanban className="w-5 h-5 text-accent-camel" />
              <span>Quadro Kanban de Produção</span>
            </h1>
            {activeMarca && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent-camel/10 text-accent-camel border border-accent-camel/30">
                {activeMarca.nome}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Acompanhamento das 23 etapas de produção com movimentação interativa e teclado
          </p>
        </div>

        {/* Toolbar de Ações: Busca, Filtro de Etapas, Recarregar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar peça ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:outline-none w-48 sm:w-60 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-muted" />
            <select
              value={selectedEtapaFilter}
              onChange={(e) => setSelectedEtapaFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-semibold text-primary focus:border-accent-camel focus:outline-none shadow-2xs cursor-pointer max-w-[200px]"
            >
              <option value="TODAS">Todas as etapas (23)</option>
              {ETAPAS_KANBAN.map((et) => (
                <option key={et.key} value={et.key}>
                  {et.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={fetchKanban}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-primary flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-accent-camel ${isLoading ? 'animate-spin' : ''}`}
            />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {conflictError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{conflictError}</span>
          </div>
          <button
            type="button"
            onClick={() => setConflictError('')}
            className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-400"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* QUADRO KANBAN DE COLUNAS */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-max">
          {displayedEtapas.map((col, colIdx) => {
            const pecasNaEtapa = filteredPecas.filter((p) => p.etapaAtual === col.key);

            return (
              <div
                key={col.key}
                role="region"
                aria-label={`Coluna ${col.label}, ${pecasNaEtapa.length} peças`}
                className="w-72 bg-surface-muted/60 border border-border rounded-2xl flex flex-col max-h-[calc(100vh-230px)] shadow-2xs shrink-0"
              >
                {/* Header da Coluna */}
                <div className="p-3.5 border-b border-border bg-surface rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-5 h-5 rounded-md bg-accent-camel/15 text-accent-camel font-bold text-[10px] flex items-center justify-center shrink-0">
                      {col.number}
                    </span>
                    <h3 className="text-xs font-bold text-primary truncate" title={col.label}>
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-muted text-muted-foreground border border-border shrink-0">
                    {pecasNaEtapa.length}
                  </span>
                </div>

                {/* Lista de Peças da Coluna */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {pecasNaEtapa.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-muted border border-dashed border-border-muted rounded-xl">
                      Nenhuma peça nesta etapa
                    </div>
                  ) : (
                    pecasNaEtapa.map((peca) => {
                      const isPieceUpdating = isUpdating === peca.id;
                      const hasOverdue = peca.diasAtraso && peca.diasAtraso > 0;

                      return (
                        <div
                          key={peca.id}
                          className={`bg-surface border rounded-xl p-3.5 space-y-2.5 shadow-2xs transition-all duration-200 group ${
                            isPieceUpdating
                              ? 'opacity-60 pointer-events-none'
                              : hasOverdue
                                ? 'border-rose-200 dark:border-rose-800/60 hover:border-rose-300 dark:hover:border-rose-800/60'
                                : 'border-border hover:border-accent-camel/50'
                          }`}
                        >
                          {/* Topo do Card */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="truncate">
                              <h4
                                className="text-xs font-bold text-primary truncate"
                                title={peca.nome}
                              >
                                {peca.nome}
                              </h4>
                              <span className="font-mono text-[10px] font-semibold text-accent-camel">
                                {peca.codigo}
                              </span>
                            </div>

                            {hasOverdue && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 shrink-0">
                                +{peca.diasAtraso}d
                              </span>
                            )}
                          </div>

                          {/* Estilista / Responsável */}
                          {peca.estilista && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <User className="w-3 h-3 text-muted" />
                              <span className="truncate">{peca.estilista}</span>
                            </div>
                          )}

                          {/* CONTROLES ACESSÍVEIS DE MOVIMENTAÇÃO POR TECLADO */}
                          <div className="pt-2 border-t border-border-muted flex items-center justify-between gap-1.5">
                            {/* Botão Etapa Anterior */}
                            <button
                              type="button"
                              disabled={colIdx === 0 || isPieceUpdating}
                              onClick={() => {
                                const prevEtapa = ETAPAS_KANBAN[colIdx - 1]?.key;
                                if (prevEtapa) void handleMovePeca(peca.id, prevEtapa);
                              }}
                              aria-label={`Mover ${peca.nome} para etapa anterior`}
                              title="Mover para etapa anterior"
                              className="p-1 rounded border border-border bg-surface hover:bg-surface-muted text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>

                            {/* Dropdown seletor rápido de destino */}
                            <select
                              aria-label={`Mover etapa de ${peca.nome}`}
                              value={peca.etapaAtual}
                              onChange={(e) =>
                                void handleMovePeca(peca.id, e.target.value as EtapaPecaEnum)
                              }
                              className="w-full text-[10px] font-semibold px-1.5 py-1 bg-surface-muted border border-border rounded text-primary focus:border-accent-camel focus:outline-none cursor-pointer truncate"
                            >
                              {ETAPAS_KANBAN.map((et) => (
                                <option key={et.key} value={et.key}>
                                  {et.label}
                                </option>
                              ))}
                            </select>

                            {/* Botão Próxima Etapa */}
                            <button
                              type="button"
                              disabled={colIdx === ETAPAS_KANBAN.length - 1 || isPieceUpdating}
                              onClick={() => {
                                const nextEtapa = ETAPAS_KANBAN[colIdx + 1]?.key;
                                if (nextEtapa) void handleMovePeca(peca.id, nextEtapa);
                              }}
                              aria-label={`Mover ${peca.nome} para próxima etapa`}
                              title="Mover para próxima etapa"
                              className="p-1 rounded border border-border bg-surface hover:bg-surface-muted text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanPage;
