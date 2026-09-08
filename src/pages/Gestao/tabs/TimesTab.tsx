/**
 * ============================================================================
 * COMPONENTE: Sub-aba de Times (TimesTab)
 * ARQUIVO: src/pages/Gestao/tabs/TimesTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tabela e filtros de times da organização.
 * ============================================================================
 */

import React from 'react';
import { Search, Plus, MoreVertical, Pencil } from 'lucide-react';
import type { TeamItem } from '../../../types/gestao';

interface TimesTabProps {
  teamsList: TeamItem[];
  teamFilterMarca: string;
  setTeamFilterMarca: (marca: string) => void;
  openMenuTeamId: string | null;
  setOpenMenuTeamId: (id: string | null) => void;
  onOpenCriarTeamModal: () => void;
  onOpenEditTeamModal: (team: TeamItem) => void;
}

export const TimesTab: React.FC<TimesTabProps> = ({
  teamsList,
  teamFilterMarca,
  setTeamFilterMarca,
  openMenuTeamId,
  setOpenMenuTeamId,
  onOpenCriarTeamModal,
  onOpenEditTeamModal,
}) => {
  return (
    <>
      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
          <Search className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
          <span>Filtros</span>
        </div>
        <div className="space-y-1 max-w-xs">
          <label className="text-xs font-semibold text-muted-foreground block">Marca</label>
          <select
            value={teamFilterMarca}
            onChange={(e) => setTeamFilterMarca(e.target.value)}
            className="w-full bg-surface-muted border border-border text-primary font-medium rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none cursor-pointer"
          >
            <option value="King & Joe">King & Joe</option>
            <option value="King & Joe Play">King & Joe Play</option>
            <option value="K&J Black">K&J Black</option>
          </select>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-border-muted pb-4">
          <h2 className="text-lg font-bold font-editorial text-primary">Times</h2>
          <button
            type="button"
            onClick={onOpenCriarTeamModal}
            className="px-4 py-2 bg-primary hover:bg-neutral-800 text-white font-bold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {teamsList.map((team) => (
                <tr key={team.id} className="hover:bg-surface-muted/30 transition">
                  <td className="py-3 px-4 font-bold text-primary">{team.nome}</td>
                  <td className="py-3 px-4 text-muted-foreground font-medium">
                    {team.descricao || '--'}
                  </td>
                  <td className="py-3 px-4 text-right relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuTeamId(openMenuTeamId === team.id ? null : team.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    {openMenuTeamId === team.id && (
                      <div className="absolute right-4 top-10 w-36 bg-surface border border-border rounded-xl shadow-xl z-50 p-1 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuTeamId(null);
                            onOpenEditTeamModal(team);
                          }}
                          className="w-full text-left px-3 py-2 text-primary hover:bg-surface-muted font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 text-muted" strokeWidth={1.5} />
                          <span>Editar</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
