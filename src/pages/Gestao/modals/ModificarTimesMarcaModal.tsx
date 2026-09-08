/**
 * ============================================================================
 * MODAL: Modificar Times da Marca (ModificarTimesMarcaModal)
 * ARQUIVO: src/pages/Gestao/modals/ModificarTimesMarcaModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal para vincular e desvincular times a uma marca específica.
 * ============================================================================
 */

import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MarcaSummary } from '../../../types/auth';
import type { TeamItem } from '../../../types/gestao';

interface ModificarTimesMarcaModalProps {
  updatingTeamsMarca: MarcaSummary | null;
  onClose: () => void;
  teamsList: TeamItem[];
  onToggleTeamProductDesignated: (teamId: string) => void;
}

export const ModificarTimesMarcaModal: React.FC<ModificarTimesMarcaModalProps> = ({
  updatingTeamsMarca,
  onClose,
  teamsList,
  onToggleTeamProductDesignated,
}) => {
  if (!updatingTeamsMarca) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold font-editorial text-primary">Modificar times</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4 text-center">Designado de produto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {teamsList.map((team) => (
                <tr key={team.id} className="hover:bg-surface-muted/30 transition">
                  <td className="py-3 px-4 font-semibold text-primary">{team.nome}</td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={team.designadoProduto}
                      onChange={() => onToggleTeamProductDesignated(team.id)}
                      className="w-4 h-4 rounded border-border text-primary accent-accent-camel cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-muted/30 text-xs text-muted">
          <span>1-4 de 4</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="p-1 rounded border border-border text-muted hover:text-primary transition cursor-pointer disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
