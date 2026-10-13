/**
 * ============================================================================
 * MODAL: Criar Usuário (CriarUsuarioModal)
 * ARQUIVO: src/pages/Gestao/modals/CriarUsuarioModal.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Modal para cadastro de novos colaboradores com validações rigorosas:
 *            sem senha padrão insegura, validação de confirmação idêntica,
 *            definição semântica de usuário fantasma e tratamento de estado de envio.
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, Info, AlertCircle } from 'lucide-react';

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
  onSave: () => Promise<void> | void;
  isLoading?: boolean;
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
  isLoading = false,
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

    const nome = newUserName.trim();
    const email = newUserEmail.trim();

    if (!nome) {
      setFormError('O nome do usuário é obrigatório.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setFormError('Informe um endereço de e-mail corporativo válido.');
      return;
    }

    if (!newUserSenha) {
      setFormError('A senha é obrigatória. Defina uma senha com no mínimo 6 caracteres.');
      return;
    }

    if (newUserSenha.length < 6) {
      setFormError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (newUserSenha !== newUserConfirmarSenha) {
      setFormError('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar usuário na API.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-criar-usuario-title"
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3
            id="modal-criar-usuario-title"
            className="text-base font-bold font-editorial text-primary"
          >
            Criação de Usuário
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de criação de usuário"
            className="text-muted hover:text-primary transition cursor-pointer p-1"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* FEEDBACK DE ERRO */}
        {formError && (
          <div
            role="alert"
            className="mx-6 mt-4 p-3 rounded-xl bg-accent-bordo/10 border border-accent-bordo/30 text-accent-bordo text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="px-6 pt-4 text-xs text-muted-foreground leading-relaxed">
          Informe os dados cadastrais do novo usuário. As marcas e cargos de acesso devem ser
          atribuídos de acordo com a autorização de cada unidade.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-1">
                <label
                  htmlFor="modal-user-nome"
                  className="font-semibold text-muted-foreground block"
                >
                  Nome Completo <span className="text-accent-bordo">*</span>
                </label>
                <input
                  id="modal-user-nome"
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nome do colaborador"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  required
                />
              </div>

              {/* Código */}
              <div className="space-y-1">
                <label
                  htmlFor="modal-user-codigo"
                  className="font-semibold text-muted-foreground flex items-center gap-1"
                >
                  <span>Código de Referência</span>
                  <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                </label>
                <input
                  id="modal-user-codigo"
                  type="text"
                  value={newUserCodigo}
                  onChange={(e) => setNewUserCodigo(e.target.value)}
                  placeholder="Ex: USR-102"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                />
              </div>

              {/* E-mail */}
              <div className="space-y-1">
                <label
                  htmlFor="modal-user-email"
                  className="font-semibold text-muted-foreground block"
                >
                  E-mail Corporativo <span className="text-accent-bordo">*</span>
                </label>
                <input
                  id="modal-user-email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="colaborador@akrbrands.com.br"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  required
                />
              </div>

              {/* Usuário Fantasma com significado semântico documentado */}
              <div className="space-y-1 flex flex-col justify-end">
                <label className="font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                  <span>Usuário Fantasma</span>
                  <span
                    title="Usuário técnico/virtual utilizado para atribuição histórica de tarefas e produtos sem credenciais de login ativo."
                    className="cursor-help"
                  >
                    <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={newUserIsFantasma}
                    onClick={() => setNewUserIsFantasma(!newUserIsFantasma)}
                    className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${
                      newUserIsFantasma
                        ? 'bg-accent-camel'
                        : 'bg-surface-muted border border-border'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                        newUserIsFantasma ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-primary">
                    {newUserIsFantasma ? 'Sim (Técnico / Virtual)' : 'Não (Usuário Padrão)'}
                  </span>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-1">
                <label
                  htmlFor="modal-user-senha"
                  className="font-semibold text-muted-foreground block"
                >
                  Nova Senha <span className="text-accent-bordo">*</span>
                </label>
                <input
                  id="modal-user-senha"
                  type="password"
                  value={newUserSenha}
                  onChange={(e) => setNewUserSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  required
                />
              </div>

              {/* Confirmação de Senha */}
              <div className="space-y-1">
                <label
                  htmlFor="modal-user-conf-senha"
                  className="font-semibold text-muted-foreground block"
                >
                  Confirmação de Senha <span className="text-accent-bordo">*</span>
                </label>
                <input
                  id="modal-user-conf-senha"
                  type="password"
                  value={newUserConfirmarSenha}
                  onChange={(e) => setNewUserConfirmarSenha(e.target.value)}
                  placeholder="Digite a mesma senha"
                  className="w-full bg-surface-muted border border-border text-primary rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-accent-camel/20 focus:border-accent-camel transition outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-muted/30">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || isLoading}
              className="px-4 py-2 font-bold border border-border rounded-lg text-primary hover:bg-surface-muted transition cursor-pointer text-xs disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="px-5 py-2 font-bold bg-action text-action-foreground rounded-lg hover:bg-action-hover transition cursor-pointer shadow-2xs text-xs flex items-center gap-2 disabled:opacity-50"
            >
              {(submitting || isLoading) && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>Criar Usuário</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarUsuarioModal;
