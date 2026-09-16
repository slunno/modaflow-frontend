/**
 * ============================================================================
 * PÁGINA: Planejamento Visual Kanban (KanbanPage)
 * ARQUIVO: src/pages/Kanban/KanbanPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Visão de quadro Kanban com as 23 etapas do fluxo de confecção.
 *            Mantida como rota futura/secundária fora do menu principal do portal.
 * ============================================================================
 */

import React from 'react';
import { Kanban, Sparkles, Clock } from 'lucide-react';

export const KanbanPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200 font-sans">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-camel/10 text-accent-camel border border-accent-camel/20 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo em Planejamento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-primary tracking-wide">
            Quadro Kanban de Produção
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Visualização por colunas com as 23 etapas de produção e movimentação interativa de
            peças.
          </p>
        </div>

        <span className="text-xs font-semibold text-muted bg-surface px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 shadow-2xs self-start sm:self-auto">
          <Clock className="w-4 h-4 text-accent-camel" />
          <span>Fase de Desenvolvimento</span>
        </span>
      </div>

      {/* CARD DE PLACEHOLDER ESTRUTURADO */}
      <div className="p-12 rounded-2xl bg-surface border border-border text-center space-y-4 shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-accent-camel/10 border border-accent-camel/30 text-accent-camel flex items-center justify-center mx-auto">
          <Kanban className="w-7 h-7" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold font-editorial text-primary">
            Planejamento Visual por Etapas
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Esta funcionalidade está sendo preparada com suporte completo a drag-and-drop
            (@hello-pangea/dnd) para movimentação ágil de peças entre as fases de criação,
            modelagem, corte, costura e acabamento.
          </p>
        </div>
      </div>
    </div>
  );
};
export default KanbanPage;
