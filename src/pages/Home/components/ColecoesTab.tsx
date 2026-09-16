/**
 * ============================================================================
 * MÓDULO: Aba Coleções (Listagem & Status de Cronograma por Marca)
 * ARQUIVO: src/pages/Home/components/ColecoesTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe as coleções da marca ativa divididas em sub-abas (Em andamento,
 *            Completas, Arquivadas), com barra de progresso %, contagem de peças
 *            concluídas, prazos de entrega e badges de atraso ou entrega.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import type { ColecaoItem } from '../../../types/plm';
import { ArrowUpDown } from 'lucide-react';
import { getCollections } from '../../../services/plmService';

export const ColecoesTab: React.FC = () => {
  const [statusFiltro, setStatusFiltro] = useState<'Em andamento' | 'Completas' | 'Arquivadas'>(
    'Completas'
  );
  const [allColecoes, setAllColecoes] = useState<ColecaoItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    getCollections().then((data) => {
      if (isMounted) setAllColecoes(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const colecoesFiltradas = allColecoes.filter((c) => c.status === statusFiltro);

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-200">
      {/* 1. NAVEGAÇÃO DE SUB-STATUS */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setStatusFiltro('Em andamento')}
            className={`pb-2 border-b-2 transition-all duration-200 cursor-pointer ${
              statusFiltro === 'Em andamento'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            Em andamento
          </button>

          <button
            onClick={() => setStatusFiltro('Completas')}
            className={`pb-2 border-b-2 transition-all duration-200 cursor-pointer ${
              statusFiltro === 'Completas'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            Completas
          </button>

          <button
            onClick={() => setStatusFiltro('Arquivadas')}
            className={`pb-2 border-b-2 transition-all duration-200 cursor-pointer ${
              statusFiltro === 'Arquivadas'
                ? 'border-transparent text-muted hover:text-muted-foreground'
                : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            Arquivadas
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted">
            {colecoesFiltradas.length}/{allColecoes.length}
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-camel/30 text-accent-camel bg-accent-camel/10 text-xs font-bold hover:bg-accent-camel/20 transition-all duration-200 cursor-pointer">
            <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={1.5} /> Ordenação
          </button>
        </div>
      </div>

      {/* 2. GRID DE CARDS DAS COLEÇÕES (CARD NÍVEL 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {colecoesFiltradas.map((c) => {
          const isEntregue = c.progressoPercent === 100;
          return (
            <div
              key={c.id}
              className="bg-surface border border-border rounded-xl p-5 shadow-2xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 space-y-4 cursor-pointer"
            >
              {/* Título da Coleção com fonte editorial */}
              <h4 className="text-xs font-bold font-editorial text-primary leading-snug uppercase tracking-wide min-h-[32px]">
                {c.nome}
              </h4>

              {/* Detalhes de Progresso e Peças */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Progresso da coleção</span>
                  <strong className="text-primary font-bold">{c.progressoPercent} %</strong>
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Peças concluídas</span>
                  <strong className="text-primary font-bold">
                    {c.pecasConcluidas} de {c.pecasTotal}
                  </strong>
                </div>

                {c.concluidoEmDate && (
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Concluído em</span>
                    <strong className="text-primary font-bold">{c.concluidoEmDate}</strong>
                  </div>
                )}

                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Entrega em</span>
                  {isEntregue ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      Entregue ✓
                    </span>
                  ) : c.diasAtraso < 0 ? (
                    <span className="text-[11px] font-bold text-accent-bordo bg-accent-bordo/10 px-2.5 py-0.5 rounded-lg border border-accent-bordo/30">
                      {c.diasAtraso} dias
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-primary bg-surface-muted px-2.5 py-0.5 rounded-lg border border-border-muted">
                      Em dia
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Data de Entrega</span>
                  <strong className="text-primary font-bold">{c.dataEntrega}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
