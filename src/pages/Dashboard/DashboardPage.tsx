/**
 * ============================================================================
 * PÁGINA: Dashboard Operacional de Produção (DashboardPage)
 * ARQUIVO: src/pages/Dashboard/DashboardPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Página dedicada de Dashboard de fluxo de produção e tempo de
 *            permanência por etapa para as marcas da AKR BRANDS.
 * ============================================================================
 */

import React from 'react';
import { DashboardTab } from '../Home/components/DashboardTab';
import { LayoutDashboard, Sparkles } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* CABEÇALHO EDITORIAL DO DASHBOARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-camel/10 text-accent-camel border border-accent-camel/20 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visão Operacional em Tempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-primary tracking-wide">
            Dashboard de Produção
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tempo médio de permanência, fluxo de entradas e saídas e status de entregas por etapa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted bg-surface px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 shadow-2xs">
            <LayoutDashboard className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
            <span>Indicadores de SLA</span>
          </span>
        </div>
      </div>

      {/* COMPONENTE REAPROVEITADO DO DASHBOARD */}
      <DashboardTab />
    </div>
  );
};
export default DashboardPage;
