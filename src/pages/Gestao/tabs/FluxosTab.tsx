/**
 * ============================================================================
 * MÓDULO: Aba Fluxos (Gestão & Cadastros Base)
 * ARQUIVO: src/pages/Gestao/tabs/FluxosTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Cadastro de fluxos operacionais e esteiras de etapas de produção.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { GitFork, Search, Plus, Filter } from 'lucide-react';

interface FluxoItem {
  id: string;
  nome: string;
  totalEtapas: number;
  etapaInicial: string;
  slaEstimadoDias: number;
  tipoFluxo: 'Principal' | 'Rápido' | 'Amostragem';
  status: 'Ativo' | 'Em Validação';
}

const INITIAL_FLUXOS: FluxoItem[] = [
  {
    id: 'fl-1',
    nome: 'Fluxo Padrão Coleção (23 Etapas)',
    totalEtapas: 23,
    etapaInicial: '01 Geração de Ficha',
    slaEstimadoDias: 45,
    tipoFluxo: 'Principal',
    status: 'Ativo',
  },
  {
    id: 'fl-2',
    nome: 'Fluxo Reposição Rápida / Perenes',
    totalEtapas: 12,
    etapaInicial: '05 Checagem de MP Linx',
    slaEstimadoDias: 20,
    tipoFluxo: 'Rápido',
    status: 'Ativo',
  },
  {
    id: 'fl-3',
    nome: 'Fluxo Protótipo & Cápsula Nobre',
    totalEtapas: 16,
    etapaInicial: '03 Modelagem',
    slaEstimadoDias: 30,
    tipoFluxo: 'Amostragem',
    status: 'Ativo',
  },
];

export const FluxosTab: React.FC = () => {
  const [fluxos] = useState<FluxoItem[]>(INITIAL_FLUXOS);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');

  const filtered = useMemo(() => {
    return fluxos.filter((f) => {
      const matchSearch = search === '' || f.nome.toLowerCase().includes(search.toLowerCase());
      const matchTipo = tipoFilter === 'Todos' || f.tipoFluxo === tipoFilter;
      return matchSearch && matchTipo;
    });
  }, [fluxos, search, tipoFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-4">
        <div>
          <h3 className="text-base font-bold font-editorial text-primary flex items-center gap-2">
            <GitFork className="w-5 h-5 text-accent-camel" strokeWidth={1.5} />
            <span>Fluxos de Trabalho & Etapas</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Sequenciamento de etapas e regras de transição de status para a esteira de
            desenvolvimento.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-all duration-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Fluxo</span>
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar fluxo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted" />
          {(['Todos', 'Principal', 'Rápido', 'Amostragem'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipoFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                tipoFilter === t
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-surface border border-border text-center space-y-2">
          <GitFork className="w-10 h-10 text-muted mx-auto opacity-50" />
          <h4 className="text-sm font-bold text-primary font-editorial">Nenhum fluxo encontrado</h4>
          <p className="text-xs text-muted">Ajuste os filtros ou crie um fluxo customizado.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border text-muted font-bold tracking-wider uppercase text-[10px]">
                  <th className="py-3 px-4">Nome do Fluxo</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-center">Total de Etapas</th>
                  <th className="py-3 px-4">Etapa Inicial</th>
                  <th className="py-3 px-4 text-center">SLA Estimado</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-muted/50 transition">
                    <td className="py-3.5 px-4 font-bold text-primary">{item.nome}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{item.tipoFluxo}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-accent-camel">
                      {item.totalEtapas} etapas
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{item.etapaInicial}</td>
                    <td className="py-3.5 px-4 text-center text-muted-foreground">
                      {item.slaEstimadoDias} dias
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
export default FluxosTab;
