/**
 * ============================================================================
 * MODAL: Criar Marca (CriarMarcaModal)
 * ARQUIVO: src/pages/Gestao/modals/CriarMarcaModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal para cadastro de novas marcas.
 * ============================================================================
 */

import React from 'react';
import { X, Image as ImageIcon, AlertTriangle } from 'lucide-react';

interface CriarMarcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  formMarcaNome: string;
  setFormMarcaNome: (v: string) => void;
  formMarcaIntegracaoId: string;
  setFormMarcaIntegracaoId: (v: string) => void;
  onSave: () => void;
}

export const CriarMarcaModal: React.FC<CriarMarcaModalProps> = ({
  isOpen,
  onClose,
  formMarcaNome,
  setFormMarcaNome,
  formMarcaIntegracaoId,
  setFormMarcaIntegracaoId,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold font-editorial text-primary">Criação de marca</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-5 text-xs">
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 font-medium leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <strong>Atenção!</strong> Ao criar uma nova marca, solicite a replicação da
              customização enviando um e-mail para{' '}
              <span className="font-bold underline text-amber-950">customizacoes@colecao.moda</span>{' '}
              detalhando sua demanda. Em caso de dúvidas, acione o Suporte.
            </div>
          </div>
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
              placeholder="Ex: Majestoso Brocado, Anos 80, Pegada CoolVibe"
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
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
              placeholder="Ex: BRAND_123"
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
            Criar Marca
          </button>
        </div>
      </div>
    </div>
  );
};
