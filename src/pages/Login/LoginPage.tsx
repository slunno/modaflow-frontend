/**
 * ============================================================================
 * MÓDULO: Autenticação de Usuários
 * ARQUIVO: src/pages/Login/LoginPage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tela de Login centralizada do sistema corporativo AKR BRANDS.
 *            Possui validação reCAPTCHA simulada, opção de mostrar/ocultar senha,
 *            alternância de tema (Claro Vibrante vs. Midnight OLED #000000) e
 *            design responsivo ajustado aos 100vh sem scroll.
 * ----------------------------------------------------------------------------
 * PADRÃO DE ALTERAÇÃO/ADIÇÃO:
 * - Mantenha o container externo `h-screen overflow-hidden` para prevenir barras de
 *   rolagem indesejadas no desktop.
 * - Ao adicionar integração com SSO (Google/Microsoft OAuth) ou biometria, inclua
 *   os botões dentro do bloco `<form>` de maneira modular.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Moon, 
  Sun,
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
  
  // Estado do Tema (Light / Dark Midnight OLED)
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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
    <div className="h-screen w-full flex items-center justify-center p-4 font-sans selection:bg-amber-900 selection:text-white overflow-hidden relative bg-[#F5F3EF] text-[#181818]">
      
      {/* CARD CENTRALIZADO DE LOGIN AKR BRANDS */}
      <div className="w-full max-w-md bg-white text-[#181818] border border-neutral-200/90 shadow-xl p-8 sm:p-10 rounded-3xl relative z-10">
        
        {/* TOPO: LOGO AKR BRANDS (BRANDING EDITORIAL - PASSO 5) */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 font-editorial text-2xl font-bold tracking-[0.25em] text-neutral-900 uppercase">
            <span>AKR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-800"></span>
            <span className="font-light tracking-[0.3em]">BRANDS</span>
          </div>
          <p className="text-[11px] font-medium text-neutral-500 mt-2 uppercase tracking-wider">
            ModaFlow PLM — Plataforma Corporativa
          </p>
        </div>

        {/* MENSAGEM DE ERRO (SE HOUVER) */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo Email Corporativo */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-neutral-700">
              Email Corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nathanhlima10@gmail.com"
              className="w-full px-4 py-3 rounded-xl text-xs font-medium focus:outline-none transition shadow-2xs bg-neutral-50 border border-neutral-200 text-neutral-900 focus:bg-white focus:border-neutral-900"
              required
            />
          </div>

          {/* Campo Senha com Toggle de Visualização */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-neutral-700">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-xs font-medium focus:outline-none transition shadow-2xs pr-10 bg-neutral-50 border border-neutral-200 text-neutral-900 focus:bg-white focus:border-neutral-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validação reCAPTCHA simulada */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={captchaChecked}
                onChange={(e) => setCaptchaChecked(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Não sou um robô</span>
            </label>
            <div className="flex flex-col items-center pl-2">
              <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
              <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-tighter mt-0.5">reCAPTCHA</span>
            </div>
          </div>

          {/* LINKS DE SUPORTE */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">
              Não tem cadastro?{' '}
              <a href="#cadastro" className="text-blue-500 hover:text-blue-400 font-bold transition">
                Cadastre-se
              </a>
            </span>
            <a href="#esqueceu" className="text-blue-500 hover:text-blue-400 font-bold transition">
              Esqueceu a senha?
            </a>
          </div>

          {/* BOTÃO ENTRAR */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 text-white font-bold text-xs rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-900 hover:bg-blue-700'
            }`}
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
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 text-center text-[11px] text-slate-400 font-semibold">
          AKR BRANDS &copy; {new Date().getFullYear()} • Direitos reservados T.I Versão : 0.0.1
        </div>

      </div>

      {/* BOTÃO FLUTUANTE DE ALTERNÂNCIA DE TEMA (CANTO INFERIOR DIREITO) */}
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute bottom-6 right-6 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-50"
        title={isDarkMode ? 'Alternar para Tema Claro Vibrante' : 'Alternar para Tema Midnight OLED (Preto Absoluto #000000)'}
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-white" />}
      </button>

    </div>
  );
};
