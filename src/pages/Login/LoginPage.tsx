/**
 * ============================================================================
 * MÓDULO: Autenticação de Usuários
 * ARQUIVO: src/pages/Login/LoginPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tela de Login e Cadastro centralizada do sistema corporativo AKR BRANDS.
 *            Possui login com JWT e cadastro em memória (Hash BCrypt) conectado à API backend.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registerUserApi } from '../../services/authService';
import { Eye, EyeOff, RefreshCw, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface LoginPageProps {
  /** Callback opcional executado ao autenticar com sucesso */
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  // Modo do formulário: Login ou Cadastro
  const [isRegistering, setIsRegistering] = useState(false);

  // Campos do Formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('admin@akrbrands.com.br');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(true);

  // Feedback e Carregamento
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Submete o formulário de Login ou Cadastro
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!captchaChecked) {
      setError('Por favor, confirme a validação reCAPTCHA.');
      return;
    }

    if (isRegistering) {
      // ===== FLUXO DE CADASTRO =====
      if (!nome.trim() || !email.trim() || !password) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas digitadas não coincidem.');
        return;
      }

      try {
        setLoading(true);
        // 1. Cadastra o usuário na API backend (salvo em memória com Hash BCrypt)
        await registerUserApi({
          nome: nome.trim(),
          email: email.trim(),
          senha: password,
          empresa: 'AKR BRANDS',
          cargo: 'Estilista',
        });

        setSuccessMsg('Conta criada com sucesso! Realizando login automático...');

        // 2. Realiza o login automático imediatamente
        await login(email.trim(), password);
        if (onLoginSuccess) onLoginSuccess();
        navigate(from, { replace: true });
      } catch (err: unknown) {
        const errorData = err as { message?: string };
        setError(errorData.message || 'Falha ao criar conta. Verifique os dados informados.');
      } finally {
        setLoading(false);
      }
    } else {
      // ===== FLUXO DE LOGIN =====
      if (!email.trim() || !password) {
        setError('Por favor, preencha o e-mail e a senha.');
        return;
      }

      try {
        setLoading(true);
        await login(email.trim(), password);
        if (onLoginSuccess) onLoginSuccess();
        navigate(from, { replace: true });
      } catch (err: unknown) {
        const errorData = err as { message?: string };
        setError(errorData.message || 'Falha ao realizar login. Verifique suas credenciais.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 font-sans selection:bg-accent-camel selection:text-white overflow-hidden relative bg-bg text-primary">
      {/* CARD CENTRALIZADO AKR BRANDS */}
      <div className="w-full max-w-md bg-surface text-primary border border-border shadow-xl p-8 sm:p-10 rounded-3xl relative z-10 animate-in fade-in duration-300">
        {/* TOPO: LOGO AKR BRANDS */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 font-editorial text-2xl font-bold tracking-[0.25em] text-primary uppercase">
            <span>AKR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-camel"></span>
            <span className="font-light tracking-[0.3em]">BRANDS</span>
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground mt-2 uppercase tracking-wider">
            {isRegistering ? 'Criar Conta Corporativa' : 'ModaFlow PLM — Plataforma Corporativa'}
          </p>
        </div>

        {/* FEEDBACK DE SUCESSO */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            {successMsg}
          </div>
        )}

        {/* MENSAGEM DE ERRO */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-accent-bordo/10 border border-accent-bordo/30 text-accent-bordo text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-bordo" />
            {error}
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo (Apenas no Cadastro) */}
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                Nome Completo <span className="text-accent-bordo">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 rounded-lg text-xs font-medium focus:outline-none transition-all duration-200 bg-surface-muted border border-border text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
                required
              />
            </div>
          )}

          {/* Campo Email Corporativo */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
              Email Corporativo <span className="text-accent-bordo">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@akrbrands.com.br"
              className="w-full px-4 py-3 rounded-lg text-xs font-medium focus:outline-none transition-all duration-200 bg-surface-muted border border-border text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
              required
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
              Senha <span className="text-accent-bordo">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-xs font-medium focus:outline-none transition-all duration-200 pr-10 bg-surface-muted border border-border text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar Senha (Apenas no Cadastro) */}
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                Confirmar Senha <span className="text-accent-bordo">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite novamente a senha"
                className="w-full px-4 py-3 rounded-lg text-xs font-medium focus:outline-none transition-all duration-200 bg-surface-muted border border-border text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
                required
              />
            </div>
          )}

          {/* Validação reCAPTCHA simulada */}
          <div className="pt-1 flex items-center justify-between">
            <label className="flex items-center gap-3 p-3 bg-surface-muted border border-border rounded-lg cursor-pointer flex-1 mr-3">
              <input
                type="checkbox"
                checked={captchaChecked}
                onChange={(e) => setCaptchaChecked(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent-camel focus:ring-accent-camel cursor-pointer"
              />
              <span className="text-xs font-semibold text-muted-foreground">Não sou um robô</span>
            </label>
            <div className="flex flex-col items-center pr-2">
              <RefreshCw
                className="w-3.5 h-3.5 text-accent-camel animate-spin-slow"
                strokeWidth={1.5}
              />
              <span className="text-[7px] font-extrabold text-muted uppercase tracking-tighter mt-0.5">
                reCAPTCHA
              </span>
            </div>
          </div>

          {/* LINKS DE ALTERNÂNCIA (LOGIN <-> CADASTRO) */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted">
              {isRegistering ? 'Já tem uma conta?' : 'Não tem cadastro?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-accent-camel hover:underline font-bold transition-all duration-200 cursor-pointer"
              >
                {isRegistering ? 'Faça Login' : 'Cadastre-se'}
              </button>
            </span>
            {!isRegistering && (
              <a
                href="#esqueceu"
                className="text-accent-camel hover:underline font-bold transition-all duration-200"
              >
                Esqueceu a senha?
              </a>
            )}
          </div>

          {/* BOTÃO DE SUBMISSÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 text-white font-bold text-xs rounded-lg shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer bg-primary hover:bg-accent-camel mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegistering ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta e Entrar</span>
              </>
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
  );
};
