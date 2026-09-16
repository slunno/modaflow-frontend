/**
 * ============================================================================
 * COMPONENTE: Sub-aba de Características (CaracteristicasTab)
 * ARQUIVO: src/pages/Gestao/tabs/CaracteristicasTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tabela e cadastro de características por marca.
 * ============================================================================
 */

import React from 'react';
import { Search, Plus, ChevronDown, MoreVertical, Trash2 } from 'lucide-react';

import type { MarcaSummary } from '../../../types/auth';

export interface CaracteristicaRecord {
  id: string;
  nome: string;
  marca: string;
  tabelasMedidas: { id: string; nomeTabela: string; medidas: string }[];
}

interface CaracteristicasTabProps {
  caracteristicasList: CaracteristicaRecord[];
  marcas?: MarcaSummary[];
  caracteristicaFilterMarca: string;
  setCaracteristicaFilterMarca: (m: string) => void;
  caracteristicaSearchQuery: string;
  setCaracteristicaSearchQuery: (v: string) => void;
  openMenuCaracteristicaId: string | null;
  setOpenMenuCaracteristicaId: (id: string | null) => void;
  onOpenCriarCaracteristicaModal: () => void;
  onDeleteCaracteristica: (id: string) => void;
}

export const CaracteristicasTab: React.FC<CaracteristicasTabProps> = ({
  caracteristicasList,
  marcas = [],
  caracteristicaFilterMarca,
  setCaracteristicaFilterMarca,
  caracteristicaSearchQuery,
  setCaracteristicaSearchQuery,
  openMenuCaracteristicaId,
  setOpenMenuCaracteristicaId,
  onOpenCriarCaracteristicaModal,
  onDeleteCaracteristica,
}) => {
  const filteredCaracteristicas = caracteristicasList
    .filter((c) => !caracteristicaFilterMarca || c.marca === caracteristicaFilterMarca)
    .filter(
      (c) =>
        !caracteristicaSearchQuery ||
        c.nome.toLowerCase().includes(caracteristicaSearchQuery.toLowerCase())
    );

  return (
    <>
      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
          <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
          <span>Filtros</span>
        </div>
        <div className="space-y-3">
          {marcas.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-muted-foreground w-16">Marcas</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {marcas.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCaracteristicaFilterMarca(m.nome)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      caracteristicaFilterMarca === m.nome
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                    }`}
                  >
                    {m.nome}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1 max-w-xs pt-1">
            <label className="text-xs font-semibold text-muted-foreground block">Busca</label>
            <input
              type="text"
              value={caracteristicaSearchQuery}
              onChange={(e) => setCaracteristicaSearchQuery(e.target.value)}
              placeholder="Código ou Nome."
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-border-muted pb-4">
          <h2 className="text-lg font-bold font-editorial text-primary">
            Características de Marca
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-border hover:bg-surface-muted font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 text-primary cursor-pointer"
            >
              <span>Opções</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={onOpenCriarCaracteristicaModal}
              className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Adicionar</span>
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Tabelas de medidas</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {filteredCaracteristicas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-muted-foreground font-medium">
                    Nenhum item listado
                  </td>
                </tr>
              ) : (
                filteredCaracteristicas.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-muted/30 transition">
                    <td className="py-3 px-4 font-bold text-primary">{c.nome}</td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {c.tabelasMedidas.length} tabela(s)
                    </td>
                    <td className="py-3 px-4 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuCaracteristicaId(
                            openMenuCaracteristicaId === c.id ? null : c.id
                          )
                        }
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      {openMenuCaracteristicaId === c.id && (
                        <div className="absolute right-4 top-10 w-32 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => onDeleteCaracteristica(c.id)}
                            className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
