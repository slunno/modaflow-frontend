/**
 * ============================================================================
 * MÓDULO: Relatórios & Analytics (RelatoriosPage)
 * ARQUIVO: src/pages/Relatorios/RelatoriosPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Página central de Relatórios, Analytics e Catálogo de Peças, com
 *            sub-abas para Peças, Dashboard Executivo e Gráficos de BI,
 *            incluindo modal de detalhes para o catálogo de peças Linx.
 * ============================================================================
 */

import React, { useState } from 'react';
import { PecasTab } from '../Home/components/PecasTab';
import { DashboardTab } from '../Home/components/DashboardTab';
import { GraficosTab } from '../Home/components/GraficosTab';
import { Layers, BarChart2, PieChart, X, Copy, Shirt } from 'lucide-react';
import type { LinxProdutoValido } from '../../types/linx';
import { formatCurrencyValue } from '../../services/contractMappers';

export const RelatoriosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pecas' | 'dashboard' | 'graficos'>('pecas');
  const [selectedLinxPeca, setSelectedLinxPeca] = useState<{
    peca: LinxProdutoValido;
    sourceDatabase: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code: string | null | undefined) => {
    if (!code) return;
    void navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

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
        {activeTab === 'pecas' && (
          <PecasTab
            onSelectPeca={(peca, db) => setSelectedLinxPeca({ peca, sourceDatabase: db })}
          />
        )}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'graficos' && <GraficosTab />}
      </div>

      {/* MODAL DE DETALHES DA PEÇA SELECIONADA NO CATÁLOGO LINX */}
      {selectedLinxPeca && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="linx-peca-detalhe-title"
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-xl w-full p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-border-muted pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-camel/10 text-accent-camel border border-accent-camel/30 flex items-center justify-center font-bold">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="linx-peca-detalhe-title"
                    className="text-base font-bold font-editorial text-primary"
                  >
                    {selectedLinxPeca.peca.descricao || selectedLinxPeca.peca.codigo}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono font-bold text-accent-camel">
                      {selectedLinxPeca.peca.codigo}
                    </span>
                    <span>•</span>
                    <span>Grife: {selectedLinxPeca.peca.griffe || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Fechar detalhes da peça"
                onClick={() => setSelectedLinxPeca(null)}
                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">Coleção Linx</span>
                <div className="font-semibold text-primary">
                  {selectedLinxPeca.peca.colecaoNome || selectedLinxPeca.peca.colecaoCodigo || '—'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">Subgrupo / Tipo</span>
                <div className="font-semibold text-primary">
                  {selectedLinxPeca.peca.subgrupo || selectedLinxPeca.peca.tipo || '—'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">Preço Reposição</span>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyValue(selectedLinxPeca.peca.precoReposicao)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">Custo Reposição</span>
                <div className="font-semibold text-accent-camel">
                  {formatCurrencyValue(selectedLinxPeca.peca.custoReposicao)}
                </div>
              </div>

              <div className="col-span-2 p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">
                  Material Principal
                </span>
                <div className="font-semibold text-primary">
                  {selectedLinxPeca.peca.descricaoMaterialPrincipal ||
                    selectedLinxPeca.peca.materialPrincipal ||
                    '—'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">Status Linx ERP</span>
                <div className="font-semibold text-primary">
                  {selectedLinxPeca.peca.tipoStatusProduto || 'Ativo'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">Base de Dados</span>
                <div className="font-semibold text-primary font-mono text-[11px]">
                  {selectedLinxPeca.sourceDatabase}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-muted">
              <button
                type="button"
                onClick={() => handleCopyCode(selectedLinxPeca.peca.codigo)}
                className="px-3.5 py-2 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-primary flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-accent-camel" />
                <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLinxPeca(null)}
                className="px-5 py-2 rounded-lg bg-action text-action-foreground text-xs font-bold hover:bg-action-hover transition cursor-pointer shadow-2xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatoriosPage;
