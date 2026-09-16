/**
 * ============================================================================
 * MÓDULO: Aba Precificação (Gestão & Cadastros Base)
 * ARQUIVO: src/pages/Gestao/tabs/PrecificacaoTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Regras de precificação, markup alvo e políticas de margem mínima.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Percent, Search, Plus, Filter } from 'lucide-react';

interface RegraPrecificacaoItem {
  id: string;
  linhaProduto: string;
  markupAlvo: number;
  margemMinimaPercent: number;
  impostosEstimadosPercent: number;
  status: 'Ativo' | 'Em Revisão';
}

const INITIAL_REGRAS: RegraPrecificacaoItem[] = [];

export const PrecificacaoTab: React.FC = () => {
  const [regras] = useState<RegraPrecificacaoItem[]>(INITIAL_REGRAS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Em Revisão'>('Todos');

  const filtered = useMemo(() => {
    return regras.filter((r) => {
      const matchSearch =
        search === '' || r.linhaProduto.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Todos' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [regras, search, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-4">
        <div>
          <h3 className="text-base font-bold font-editorial text-primary flex items-center gap-2">
            <Percent className="w-5 h-5 text-accent-camel" strokeWidth={1.5} />
            <span>Regras de Precificação & Margens</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Políticas comerciais de mark-up, taxas de impostos e margem de contribuição mínima por
            linha.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-all duration-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Regra de Preço</span>
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por linha de produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted" />
          {(['Todos', 'Ativo', 'Em Revisão'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-surface border border-border text-center space-y-2">
          <Percent className="w-10 h-10 text-muted mx-auto opacity-50" />
          <h4 className="text-sm font-bold text-primary font-editorial">
            Nenhuma regra de preço cadastrada
          </h4>
          <p className="text-xs text-muted">
            Ajuste os termos da busca para localizar outras regras.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border text-muted font-bold tracking-wider uppercase text-[10px]">
                  <th className="py-3 px-4">Linha / Segmento</th>
                  <th className="py-3 px-4 text-center">Markup Alvo</th>
                  <th className="py-3 px-4 text-center">Margem Mínima</th>
                  <th className="py-3 px-4 text-center">Impostos Estimados</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-muted/50 transition">
                    <td className="py-3.5 px-4 font-bold text-primary">{item.linhaProduto}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-accent-camel">
                      {item.markupAlvo.toFixed(2)}x
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                      {item.margemMinimaPercent.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-center text-muted-foreground">
                      {item.impostosEstimadosPercent.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default PrecificacaoTab;
