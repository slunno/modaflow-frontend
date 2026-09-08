/**
 * ============================================================================
 * MÓDULO: Relatórios & Analytics (RelatoriosPage)
 * ARQUIVO: src/pages/Relatorios/RelatoriosPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Página central de Relatórios, Analytics e Catálogo de Peças, com
 *            sub-abas para Peças, Dashboard Executivo e Gráficos de BI.
 * ============================================================================
 */

import React, { useState } from 'react';
import { PecasTab } from '../Home/components/PecasTab';
import { DashboardTab } from '../Home/components/DashboardTab';
import { GraficosTab } from '../Home/components/GraficosTab';
import { Layers, BarChart2, PieChart } from 'lucide-react';

export const RelatoriosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pecas' | 'dashboard' | 'graficos'>('pecas');

  return (
    <div className="w-full flex flex-col font-sans">
      {/* NAVEGAÇÃO DE SUB-ABAS (Peças | Dashboard | Gráficos) */}
      <div className="border-b border-border bg-surface px-4 sm:px-8 pt-4">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pecas')}
            className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'pecas'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            <Layers className="w-4 h-4 text-accent-camel" />
            <span>Peças</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-accent-camel" />
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graficos')}
            className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'graficos'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            <PieChart className="w-4 h-4 text-accent-camel" />
            <span>Gráficos</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO REATIVO POR ABA SELECIONADA */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        {activeTab === 'pecas' && <PecasTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'graficos' && <GraficosTab />}
      </div>
    </div>
  );
};

export default RelatoriosPage;
