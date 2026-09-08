/**
 * ============================================================================
 * MODAL: Atualizar/Criar Time (AtualizarTimeModal)
 * ARQUIVO: src/pages/Gestao/modals/AtualizarTimeModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal para criação e edição de times de usuários.
 * ============================================================================
 */

import React from 'react';
import { X, Info } from 'lucide-react';
import type { TeamItem } from '../../../types/gestao';

interface AtualizarTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTeam: TeamItem | null;
  teamFormNome: string;
  setTeamFormNome: (v: string) => void;
  teamFormDesignado: boolean;
  setTeamFormDesignado: (v: boolean) => void;
  teamFormDescricao: string;
  setTeamFormDescricao: (v: string) => void;
  onSave: () => void;
}

export const AtualizarTimeModal: React.FC<AtualizarTimeModalProps> = ({
  isOpen,
  onClose,
  editingTeam,
  teamFormNome,
  setTeamFormNome,
  teamFormDesignado,
  setTeamFormDesignado,
  teamFormDescricao,
  setTeamFormDescricao,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold font-editorial text-primary">
            {editingTeam ? 'Atualizar time' : 'Criar time'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">
              Nome <span className="text-accent-bordo">*</span>
            </label>
            <input
              type="text"
              value={teamFormNome}
              onChange={(e) => setTeamFormNome(e.target.value)}
              placeholder="Administrador"
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="designadoProdutoCheck"
              checked={teamFormDesignado}
              onChange={(e) => setTeamFormDesignado(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary accent-accent-camel cursor-pointer"
            />
            <label
              htmlFor="designadoProdutoCheck"
              className="font-semibold text-muted-foreground cursor-pointer flex items-center gap-1"
            >
              <span>Designado de Produto</span>
              <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            </label>
          </div>
          <div className="space-y-1 pt-1">
            <label className="font-semibold text-muted-foreground block">Descrição</label>
            <textarea
              rows={3}
              value={teamFormDescricao}
              onChange={(e) => setTeamFormDescricao(e.target.value)}
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs"
          >
            {editingTeam ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};
