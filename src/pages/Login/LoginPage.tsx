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
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('nathanhlima10@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className={`h-screen w-full flex items-center justify-center p-4 font-sans selection:bg-blue-600 selection:text-white overflow-hidden transition-colors duration-300 relative ${
      isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* CARD CENTRALIZADO DE LOGIN AKR BRANDS */}
      <div className={`w-full max-w-md ${
        isDarkMode 
          ? 'bg-[#090d16] text-white border-slate-800 shadow-2xl shadow-blue-950/20' 
          : 'bg-white text-slate-900 border-slate-200/90 shadow-xl'
      } p-8 sm:p-10 rounded-3xl border relative z-10 transition-colors duration-300`}>
        
        {/* TOPO: LOGO AKR BRANDS */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-3">
            <span className={`text-3xl font-black tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>AKR</span>
            <span className="text-2xl font-light text-slate-400">|</span>
            <span className={`text-xs font-bold tracking-[0.3em] uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>BRANDS</span>
          </div>
        </div>

        {/* MENSAGEM DE ERRO */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo Email */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Email Corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nathanhlima10@gmail.com"
              className={`w-full px-4 py-3 rounded-xl text-xs font-medium focus:outline-none transition shadow-xs ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800 text-white focus:border-blue-500' 
                  : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-600'
              }`}
              required
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-4 pr-11 py-3 rounded-xl text-xs font-medium focus:outline-none transition shadow-xs ${
                  isDarkMode 
                    ? 'bg-slate-900 border border-slate-800 text-white focus:border-blue-500' 
                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-600'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* RECAPTCHA CLEAN */}
          <div className={`p-3 rounded-xl flex items-center justify-between shadow-xs border ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
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

      {/* BOTÃO FLUTUANTE DE TEMA NO CANTO INFERIOR DIREITO */}
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute bottom-6 right-6 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer z-50"
        title={isDarkMode ? "Alternar para Tema Claro Vibrante" : "Alternar para Tema Midnight OLED (Preto Absoluto #000000)"}
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-white" />}
      </button>

    </div>
  );
};
