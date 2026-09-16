/**
 * ============================================================================
 * MÓDULO: Aba Fornecedores (Gestão & Cadastros Base)
 * ARQUIVO: src/pages/Gestao/tabs/FornecedoresTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Cadastro de parceiros, tecelagens, facções de costura e lavanderias.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Truck, Search, Plus, Filter } from 'lucide-react';

interface FornecedorItem {
  id: string;
  razaoSocial: string;
  categoria: 'Tecelagem' | 'Aviamentos' | 'Facção de Costura' | 'Lavanderia' | 'Estamparia';
  cidadeUf: string;
  contato: string;
  status: 'Homologado' | 'Em Análise';
}

const INITIAL_FORNECEDORES: FornecedorItem[] = [];

export const FornecedoresTab: React.FC = () => {
  const [fornecedores] = useState<FornecedorItem[]>(INITIAL_FORNECEDORES);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('Todas');

  const filtered = useMemo(() => {
    return fornecedores.filter((f) => {
      const matchSearch =
        search === '' ||
        f.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
        f.cidadeUf.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'Todas' || f.categoria === catFilter;
      return matchSearch && matchCat;
    });
  }, [fornecedores, search, catFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-4">
        <div>
          <h3 className="text-base font-bold font-editorial text-primary flex items-center gap-2">
            <Truck className="w-5 h-5 text-accent-camel" strokeWidth={1.5} />
            <span>Cadastro de Fornecedores & Terceiros</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Rede homologada de fornecedores de tecidos, aviamentos, oficinas de facção e
            acabamentos.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-all duration-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por razão social ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted" />
          {(['Todas', 'Tecelagem', 'Facção de Costura', 'Lavanderia'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                catFilter === cat
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-surface border border-border text-center space-y-2">
          <Truck className="w-10 h-10 text-muted mx-auto opacity-50" />
          <h4 className="text-sm font-bold text-primary font-editorial">
            Nenhum fornecedor encontrado
          </h4>
          <p className="text-xs text-muted">
            Ajuste os filtros de pesquisa para visualizar parceiros cadastrados.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border text-muted font-bold tracking-wider uppercase text-[10px]">
                  <th className="py-3 px-4">Razão Social / Parceiro</th>
                  <th className="py-3 px-4">Segmento</th>
                  <th className="py-3 px-4">Localidade</th>
                  <th className="py-3 px-4">Contato Oficial</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-muted/50 transition">
                    <td className="py-3.5 px-4 font-bold text-primary">{item.razaoSocial}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{item.categoria}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{item.cidadeUf}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{item.contato}</td>
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
export default FornecedoresTab;
