/**
 * ============================================================================
 * PÁGINA: Gráficos & Business Intelligence (BIPage)
 * ARQUIVO: src/pages/BI/BIPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Página dedicada de Gráficos e Analytics (BI) com agrupamentos
 *            dinâmicos por criador, marca, fornecedor, estilista, tipo e tags.
 * ============================================================================
 */

import React from 'react';
import { GraficosTab } from '../Home/components/GraficosTab';
import { BarChart3, TrendingUp } from 'lucide-react';

export const BIPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* CABEÇALHO EDITORIAL DO BI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-camel/10 text-accent-camel border border-accent-camel/20 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Business Intelligence & Métricas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-primary tracking-wide">
            Gráficos & BI
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Análise multidimensional da produção, estilistas, fornecedores e tipos de produtos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted bg-surface px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 shadow-2xs">
            <BarChart3 className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
            <span>Relatórios Gráficos</span>
          </span>
        </div>
      </div>

      {/* COMPONENTE REAPROVEITADO DE GRÁFICOS */}
      <GraficosTab />
    </div>
  );
};
export default BIPage;
