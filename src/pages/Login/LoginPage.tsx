/**
 * ============================================================================
 * MÓDULO: Autenticação de Usuários
 * ARQUIVO: src/pages/Login/LoginPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tela de Login centralizada do sistema corporativo AKR BRANDS.
 *            Credenciais reais (sem pré-preenchimento inseguro), layout responsivo
 *            e rolável, validações de acessibilidade completas e comunicação clara
 *            sobre a regra de governança de cadastros (Gestão > Usuários).
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, ArrowRight, LogIn, Info, X } from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

interface LoginPageProps {
  /** Callback opcional executado ao autenticar com sucesso */
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Campos do Formulário — sem credenciais pré-preenchidas por segurança
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modais informativos
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showAccessPolicyModal, setShowAccessPolicyModal] = useState(false);

  // Feedback e Carregamento
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Submete o formulário de Login via API REST real do backend
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Por favor, informe seu e-mail corporativo e sua senha.');
      return;
    }

    try {
      setLoading(true);
      await login(cleanEmail, password);
      if (onLoginSuccess) onLoginSuccess();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Credenciais inválidas ou serviço temporariamente indisponível.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 py-8 sm:py-12 font-sans selection:bg-selection selection:text-selection-foreground overflow-y-auto relative bg-bg text-primary">
      {/* CARD CENTRALIZADO AKR BRANDS */}
      <div className="w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <ThemeToggle showLabel />
        </div>
        <div className="w-full max-w-md bg-surface text-primary border border-border shadow-xl p-6 sm:p-10 rounded-3xl relative z-10 animate-in fade-in duration-300">
          {/* TOPO: LOGO AKR BRANDS */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3 font-editorial text-2xl font-bold tracking-[0.25em] text-primary uppercase">
              <span>AKR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-camel"></span>
              <span className="font-light tracking-[0.3em]">BRANDS</span>
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground mt-2 uppercase tracking-wider">
              ModaFlow PLM — Plataforma Corporativa
            </p>
          </div>

          {/* MENSAGEM DE ERRO COM ACESSIBILIDADE (ROLE=ALERT) */}
          {error && (
            <div
              id="login-error-msg"
              role="alert"
              className="mb-4 p-3.5 rounded-xl bg-accent-bordo/10 border border-accent-bordo/30 text-accent-bordo text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <span className="w-2 h-2 rounded-full bg-accent-bordo mt-1 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* FORMULÁRIO DE LOGIN */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email Corporativo */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground"
              >
                Email Corporativo <span className="text-accent-bordo">*</span>
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@akrbrands.com.br"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error-msg' : undefined}
                className="w-full px-4 py-3 rounded-lg text-xs font-medium focus:outline-none transition-all duration-200 bg-surface-muted border border-border text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
                required
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground"
              >
                Senha <span className="text-accent-bordo">*</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error-msg' : undefined}
                  className="w-full px-4 py-3 rounded-lg text-xs font-medium focus:outline-none transition-all duration-200 pr-10 bg-surface-muted border border-border text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer transition-colors duration-200 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* LINKS DE SUPORTE E INFORMAÇÃO */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowAccessPolicyModal(true)}
                className="text-muted hover:text-accent-camel font-semibold transition-colors duration-200 cursor-pointer text-left"
              >
                Não tem cadastro?{' '}
                <span className="text-accent-camel underline font-bold">Solicitar acesso</span>
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-accent-camel hover:underline font-bold transition-all duration-200 cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* BOTÃO DE SUBMISSÃO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 text-action-foreground font-bold text-xs rounded-lg shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer bg-action hover:bg-action-hover focus:outline-none focus:ring-2 focus:ring-accent-camel mt-2"
            >
              {loading ? (
                <div
                  role="status"
                  aria-label="Autenticando..."
                  className="w-4 h-4 border-2 border-action-foreground/30 border-t-action-foreground rounded-full animate-spin"
                />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* RODAPÉ DO CARD */}
          <div className="pt-6 mt-6 border-t border-border-muted text-center text-[11px] text-muted font-semibold">
            AKR BRANDS &copy; {new Date().getFullYear()} • Direitos reservados T.I Versão : 0.0.1
          </div>
        </div>
      </div>

      {/* MODAL: ESQUECEU A SENHA (FLUXO REAL DOCUMENTADO) */}
      {showForgotPasswordModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3
                id="forgot-password-title"
                className="text-base font-bold font-editorial text-primary flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-accent-camel" />
                Recuperação de Senha
              </h3>
              <button
                type="button"
                aria-label="Fechar modal"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
              <p>
                Por motivos de conformidade e segurança da informação corporativa, a redefinição de
                senhas do ModaFlow PLM não é realizada por autosserviço público.
              </p>
              <p className="p-3 bg-surface-muted rounded-lg border border-border font-medium text-primary">
                Envie uma solicitação para o Suporte de TI em{' '}
                <strong className="text-accent-camel">ti@akrbrands.com.br</strong> ou solicite ao
                gestor da sua unidade em <em>Gestão &gt; Usuários</em>.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-2 bg-action text-action-foreground text-xs font-bold rounded-lg hover:bg-action-hover transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POLÍTICA DE CADASTRO (REGRA DE PRODUTO: GESTÃO CENTRALIZADA) */}
      {showAccessPolicyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-policy-title"
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3
                id="access-policy-title"
                className="text-base font-bold font-editorial text-primary flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-accent-camel" />
                Cadastro de Novos Usuários
              </h3>
              <button
                type="button"
                aria-label="Fechar modal"
                onClick={() => setShowAccessPolicyModal(false)}
                className="text-muted hover:text-primary transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
              <p>
                O ModaFlow PLM é uma plataforma corporativa com acesso restrito a colaboradores
                autorizados da AKR BRANDS.
              </p>
              <p>
                O provisionamento de novas contas é gerenciado centralmente por administradores
                autenticados através da aba <strong>Gestão &gt; Usuários</strong>, garantindo a
                associação precisa com as marcas autorizadas.
              </p>
              <p className="p-3 bg-surface-muted rounded-lg border border-border font-medium text-primary">
                Caso você necessite de acesso ao sistema, contate o administrador da sua marca ou
                envie um e-mail para{' '}
                <strong className="text-accent-camel">acessos@akrbrands.com.br</strong>.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAccessPolicyModal(false)}
                className="px-4 py-2 bg-action text-action-foreground text-xs font-bold rounded-lg hover:bg-action-hover transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
