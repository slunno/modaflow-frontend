/**
 * ============================================================================
 * MÓDULO: Autenticação de Usuários
 * ARQUIVO: src/pages/Login/LoginPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tela de Login centralizada do sistema corporativo AKR BRANDS.
 *            Possui validação reCAPTCHA simulada, opção de mostrar/ocultar senha,
 *            tema consistente em Off-White + Preto Tinta e design responsivo 100vh.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface LoginPageProps {
  /** Callback opcional executado ao autenticar com sucesso */
  onLoginSuccess?: () => void;
}

/**
 * Componente da Tela de Login Centralizada AKR BRANDS.
 */
export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  
  // Estados do Formulário
  const [email, setEmail] = useState('nathanhlima10@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(true);
  
  // Estado do Carregamento / Feedback de Erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Submete o formulário de login e valida credenciais.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }
    if (!captchaChecked) {
      setError('Por favor, confirme a validação reCAPTCHA.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError('Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 font-sans selection:bg-accent-camel selection:text-white overflow-hidden relative bg-bg text-primary">
      
      {/* CARD CENTRALIZADO DE LOGIN AKR BRANDS (NÍVEL 1 HERO/DESTAQUE) */}
      <div className="w-full max-w-md bg-surface text-primary border border-border shadow-xl p-8 sm:p-10 rounded-3xl relative z-10 animate-in fade-in duration-300">
        
        {/* TOPO: LOGO AKR BRANDS (BRANDING EDITORIAL) */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 font-editorial text-2xl font-bold tracking-[0.25em] text-primary uppercase">
            <span>AKR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-camel"></span>
            <span className="font-light tracking-[0.3em]">BRANDS</span>
          </div>
          <p className="text-[11px] font-semibold text-muted-foreground mt-2 uppercase tracking-wider">
            ModaFlow PLM — Plataforma Corporativa
          </p>
        </div>

        {/* MENSAGEM DE ERRO (SE HOUVER) */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-accent-bordo/10 border border-accent-bordo/30 text-accent-bordo text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-bordo" />
            {error}
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo Email Corporativo */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
              Email Corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nathanhlima10@gmail.com"
              className="w-full px-4 py-3 rounded-lg text-xs font-medium focus:outline-none transition-all duration-200 bg-surface-muted border border-border text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20"
              required
            />
          </div>

          {/* Campo Senha com Toggle de Visualização */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
              Senha
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
                {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {/* Validação reCAPTCHA simulada */}
          <div className="pt-2 flex items-center justify-between">
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
              <RefreshCw className="w-3.5 h-3.5 text-accent-camel animate-spin-slow" strokeWidth={1.5} />
              <span className="text-[7px] font-extrabold text-muted uppercase tracking-tighter mt-0.5">reCAPTCHA</span>
            </div>
          </div>

          {/* LINKS DE SUPORTE */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted">
              Não tem cadastro?{' '}
              <a href="#cadastro" className="text-accent-camel hover:underline font-bold transition-all duration-200">
                Cadastre-se
              </a>
            </span>
            <a href="#esqueceu" className="text-accent-camel hover:underline font-bold transition-all duration-200">
              Esqueceu a senha?
            </a>
          </div>

          {/* BOTÃO ENTRAR */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 text-white font-bold text-xs rounded-lg shadow-2xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer bg-primary hover:bg-accent-camel"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
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
