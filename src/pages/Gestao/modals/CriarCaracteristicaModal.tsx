/**
 * ============================================================================
 * MODAL: Criar Característica (CriarCaracteristicaModal)
 * ARQUIVO: src/pages/Gestao/modals/CriarCaracteristicaModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal para criação de nova característica com tabela de medidas.
 * ============================================================================
 */

import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export interface FormTabelaItem {
  id: string;
  nomeTabela: string;
  medidas: string;
}

interface CriarCaracteristicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  caracteristicaFormNome: string;
  setCaracteristicaFormNome: (v: string) => void;
  caracteristicaFormTabelas: FormTabelaItem[];
  setCaracteristicaFormTabelas: React.Dispatch<React.SetStateAction<FormTabelaItem[]>>;
  onAddFormTabela: () => void;
  onRemoveFormTabela: (id: string) => void;
  onSave: () => void;
}

export const CriarCaracteristicaModal: React.FC<CriarCaracteristicaModalProps> = ({
  isOpen,
  onClose,
  caracteristicaFormNome,
  setCaracteristicaFormNome,
  caracteristicaFormTabelas,
  setCaracteristicaFormTabelas,
  onAddFormTabela,
  onRemoveFormTabela,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold font-editorial text-primary">
            Criar característica de marca
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-6 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground block">Nome</label>
            <input
              type="text"
              value={caracteristicaFormNome}
              onChange={(e) => setCaracteristicaFormNome(e.target.value)}
              placeholder="Ex.: Blusa V"
              className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
            />
          </div>

          <div className="space-y-3">
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold bg-surface-muted/50">
                    <th className="py-2.5 px-3">Nome da tabela</th>
                    <th className="py-2.5 px-3">Medidas</th>
                    <th className="py-2.5 px-3 w-20 text-center">Imagem</th>
                    <th className="py-2.5 px-3 w-16 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted">
                  {caracteristicaFormTabelas.map((tab) => (
                    <tr key={tab.id}>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={tab.nomeTabela}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCaracteristicaFormTabelas((prev) =>
                              prev.map((t) => (t.id === tab.id ? { ...t, nomeTabela: val } : t))
                            );
                          }}
                          placeholder="Ex.: Top, Bottom, ..."
                          className="w-full bg-surface-muted border border-border text-primary rounded-md px-2.5 py-1.5 text-xs outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={tab.medidas}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCaracteristicaFormTabelas((prev) =>
                              prev.map((t) => (t.id === tab.id ? { ...t, medidas: val } : t))
                            );
                          }}
                          placeholder="Ex.: Gola V, Manga, ..."
                          className="w-full bg-surface-muted border border-border text-primary rounded-md px-2.5 py-1.5 text-xs outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-surface-muted border border-border rounded text-[11px] text-muted-foreground">
                          Sim
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveFormTabela(tab.id)}
                          className="p-1 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={onAddFormTabela}
              className="px-3 py-1.5 bg-primary text-white font-bold rounded-md hover:bg-neutral-800 transition cursor-pointer text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Tabela</span>
            </button>
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
            className="px-5 py-2 font-bold bg-primary text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-2xs text-xs"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};
