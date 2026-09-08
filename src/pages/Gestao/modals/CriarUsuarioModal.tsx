/**
 * ============================================================================
 * MODAL: Criar Usuário (CriarUsuarioModal)
 * ARQUIVO: src/pages/Gestao/modals/CriarUsuarioModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal para criação de novos usuários com definição de permissões.
 * ============================================================================
 */

import React from 'react';
import { X, Info } from 'lucide-react';

interface CriarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  newUserName: string;
  setNewUserName: (v: string) => void;
  newUserCodigo: string;
  setNewUserCodigo: (v: string) => void;
  newUserEmail: string;
  setNewUserEmail: (v: string) => void;
  newUserIsFantasma: boolean;
  setNewUserIsFantasma: (v: boolean) => void;
  newUserSenha: string;
  setNewUserSenha: (v: string) => void;
  newUserConfirmarSenha: string;
  setNewUserConfirmarSenha: (v: string) => void;
  onSave: () => void;
}

export const CriarUsuarioModal: React.FC<CriarUsuarioModalProps> = ({
  isOpen,
  onClose,
  newUserName,
  setNewUserName,
  newUserCodigo,
  setNewUserCodigo,
  newUserEmail,
  setNewUserEmail,
  newUserIsFantasma,
  setNewUserIsFantasma,
  newUserSenha,
  setNewUserSenha,
  newUserConfirmarSenha,
  setNewUserConfirmarSenha,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold font-editorial text-primary">Criação de Usuário</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary transition cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-6 pt-4 text-xs text-muted-foreground leading-relaxed">
          Ao criar um usuário, é necessário definir quais serão os Cargos em cada uma das Marcas que
          você deseja que ele tenha acesso.
        </div>
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">
                Nome <span className="text-accent-bordo">*</span>
              </label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground flex items-center gap-1">
                <span>Código</span>
                <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </label>
              <input
                type="text"
                value={newUserCodigo}
                onChange={(e) => setNewUserCodigo(e.target.value)}
                className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">
                E-mail <span className="text-accent-bordo">*</span>
              </label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
              />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <span>Usuário fantasma</span>
                <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewUserIsFantasma(!newUserIsFantasma)}
                  className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${
                    newUserIsFantasma ? 'bg-accent-camel' : 'bg-surface-muted border border-border'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                      newUserIsFantasma ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-primary">
                  {newUserIsFantasma ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">
                Nova Senha <span className="text-accent-bordo">*</span>
              </label>
              <input
                type="password"
                value={newUserSenha}
                onChange={(e) => setNewUserSenha(e.target.value)}
                className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground block">
                Confirmação de Senha <span className="text-accent-bordo">*</span>
              </label>
              <input
                type="password"
                value={newUserConfirmarSenha}
                onChange={(e) => setNewUserConfirmarSenha(e.target.value)}
                className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
              />
            </div>
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
