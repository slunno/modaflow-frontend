/**
 * ============================================================================
 * MODAL: Criar Marca (CriarMarcaModal)
 * ARQUIVO: src/pages/Gestao/modals/CriarMarcaModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal acessível para cadastro de novas marcas via POST /marcas.
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CriarMarcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  formMarcaNome: string;
  setFormMarcaNome: (v: string) => void;
  formMarcaIntegracaoId: string;
  setFormMarcaIntegracaoId: (v: string) => void;
  onSave: () => Promise<void> | void;
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
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFormError('');
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formMarcaNome.trim()) {
      setFormError('O nome da marca é obrigatório.');
      return;
    }
    if (!formMarcaIntegracaoId.trim()) {
      setFormError('O código/ID de integração da marca é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar marca no servidor.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-criar-marca-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden font-sans">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3
            id="modal-criar-marca-title"
            className="text-base font-bold font-editorial text-primary"
          >
            Criação de Marca
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-muted hover:text-primary transition cursor-pointer p-1"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {formError && (
          <div
            role="alert"
            className="mx-6 mt-4 p-3 rounded-xl bg-accent-bordo/10 border border-accent-bordo/30 text-accent-bordo text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-muted-foreground block">Imagem da Marca</label>
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-muted text-muted">
                <ImageIcon className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="criar-marca-nome" className="font-bold text-muted-foreground block">
                Nome da Marca <span className="text-accent-bordo">*</span>
              </label>
              <input
                id="criar-marca-nome"
                type="text"
                value={formMarcaNome}
                onChange={(e) => setFormMarcaNome(e.target.value)}
                placeholder="Ex: King & Joe Premium"
                className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="criar-marca-code" className="font-bold text-muted-foreground block">
                Código / ID de Integração <span className="text-accent-bordo">*</span>
              </label>
              <input
                id="criar-marca-code"
                type="text"
                value={formMarcaIntegracaoId}
                onChange={(e) => setFormMarcaIntegracaoId(e.target.value)}
                placeholder="Ex: KJ_PREMIUM"
                className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 font-bold bg-action text-action-foreground rounded-lg hover:bg-action-hover transition cursor-pointer shadow-2xs text-xs flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>Criar Marca</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarMarcaModal;
