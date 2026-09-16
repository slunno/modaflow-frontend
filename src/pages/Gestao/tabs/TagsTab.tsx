/**
 * ============================================================================
 * MÓDULO: Aba Tags (Gestão & Cadastros Base)
 * ARQUIVO: src/pages/Gestao/tabs/TagsTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Cadastro e taxonomia de tags e marcadores de produto.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Bookmark, Search, Plus, Filter } from 'lucide-react';

interface TagItem {
  id: string;
  nome: string;
  grupo: 'Linha' | 'Comercial' | 'Sustentabilidade' | 'Produção';
  totalPecas: number;
  corHex: string;
  status: 'Ativo' | 'Inativo';
}

const INITIAL_TAGS: TagItem[] = [
  {
    id: 'tg-1',
    nome: 'Linha Nobre',
    grupo: 'Linha',
    totalPecas: 48,
    corHex: '#c09858',
    status: 'Ativo',
  },
  {
    id: 'tg-2',
    nome: 'Best Seller',
    grupo: 'Comercial',
    totalPecas: 85,
    corHex: '#10b981',
    status: 'Ativo',
  },
  {
    id: 'tg-3',
    nome: 'Algodão Sustentável BCI',
    grupo: 'Sustentabilidade',
    totalPecas: 32,
    corHex: '#3b82f6',
    status: 'Ativo',
  },
  {
    id: 'tg-4',
    nome: 'Lavagem Especial',
    grupo: 'Produção',
    totalPecas: 19,
    corHex: '#8b5cf6',
    status: 'Ativo',
  },
];

export const TagsTab: React.FC = () => {
  const [tags] = useState<TagItem[]>(INITIAL_TAGS);
  const [search, setSearch] = useState('');
  const [grupoFilter, setGrupoFilter] = useState<string>('Todos');

  const filtered = useMemo(() => {
    return tags.filter((t) => {
      const matchSearch = search === '' || t.nome.toLowerCase().includes(search.toLowerCase());
      const matchGrupo = grupoFilter === 'Todos' || t.grupo === grupoFilter;
      return matchSearch && matchGrupo;
    });
  }, [tags, search, grupoFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-muted pb-4">
        <div>
          <h3 className="text-base font-bold font-editorial text-primary flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-accent-camel" strokeWidth={1.5} />
            <span>Tags & Classificações de Produto</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Marcadores estratégicos para agrupamento no BI, relatórios gerenciais e filtros do
            catálogo.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-all duration-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tag</span>
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted" />
          {(['Todos', 'Linha', 'Comercial', 'Sustentabilidade', 'Produção'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrupoFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                grupoFilter === g
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* TABELA */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-surface border border-border text-center space-y-2">
          <Bookmark className="w-10 h-10 text-muted mx-auto opacity-50" />
          <h4 className="text-sm font-bold text-primary font-editorial">Nenhuma tag cadastrada</h4>
          <p className="text-xs text-muted">
            Cadastre tags para organizar os produtos nas análises de BI.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border text-muted font-bold tracking-wider uppercase text-[10px]">
                  <th className="py-3 px-4">Nome da Tag</th>
                  <th className="py-3 px-4">Grupo / Finalidade</th>
                  <th className="py-3 px-4 text-center">Produtos Associados</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-muted/50 transition">
                    <td className="py-3.5 px-4 font-bold text-primary">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.corHex }}
                        />
                        <span>{item.nome}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{item.grupo}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-accent-camel">
                      {item.totalPecas} produtos
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
export default TagsTab;
