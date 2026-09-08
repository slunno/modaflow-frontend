/**
 * ============================================================================
 * MODAL: Editar Marca (EditarMarcaModal)
 * ARQUIVO: src/pages/Gestao/modals/EditarMarcaModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal para edição de marcas existentes.
 * ============================================================================
 */

import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import type { MarcaSummary } from '../../../types/auth';

interface EditarMarcaModalProps {
  editingMarca: MarcaSummary | null;
  onClose: () => void;
  formMarcaNome: string;
  setFormMarcaNome: (v: string) => void;
  formMarcaIntegracaoId: string;
  setFormMarcaIntegracaoId: (v: string) => void;
  onSave: () => void;
}

export const EditarMarcaModal: React.FC<EditarMarcaModalProps> = ({
  editingMarca,
  onClose,
  formMarcaNome,
  setFormMarcaNome,
  formMarcaIntegracaoId,
  setFormMarcaIntegracaoId,
  onSave,
}) => {
  if (!editingMarca) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold font-editorial text-primary">Edição de marca</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-muted-foreground block">Imagem</label>
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted hover:border-accent-camel transition cursor-pointer text-muted">
              <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-muted-foreground block">Nome *</label>
            <input
              type="text"
              value={formMarcaNome}
              onChange={(e) => setFormMarcaNome(e.target.value)}
              className="w-full bg-surface-muted border border-border text-primary font-semibold rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-muted-foreground block">
              ID de integração da marca
            </label>
            <input
              type="text"
              value={formMarcaIntegracaoId}
              onChange={(e) => setFormMarcaIntegracaoId(e.target.value)}
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
          >
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
};
