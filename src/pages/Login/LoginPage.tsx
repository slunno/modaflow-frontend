import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shirt, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Kanban, 
  Layers, 
  Database, 
  Building2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('nathan@kingjoe.com.br');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
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

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setLoading(true);
    setError('');
    await login(demoEmail, '123456');
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* PAINEL ESQUERDO - BRANDING & REQUISITOS DO PLM */}
      <div className="md:w-1/2 lg:w-3/5 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden border-r border-slate-800/60">
        {/* Elementos Decorativos de Fundo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo: Logo & Badge */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <Shirt className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                ModaFlow <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">PLM</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Gestão do Ciclo de Vida do Produto</p>
            </div>
          </div>
        </div>

        {/* Meio: Apresentação das Funcionalidades Principais */}
        <div className="relative z-10 my-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Multi-Marca & Kanban Visual</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Controle total do desenvolvimento da sua coleção de moda.
          </h2>

          <p className="text-slate-400 text-sm lg:text-base leading-relaxed mb-8">
            Centralize fichas técnicas, controle de consumo de materiais, custos, etapas de produção e integração em tempo real com o ERP Linx.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2 text-indigo-400">
                <Kanban className="w-5 h-5" />
                <span className="font-semibold text-sm text-slate-200">Kanban Visual</span>
              </div>
              <p className="text-xs text-slate-400">
                Acompanhe o andamento das peças por 23+ etapas personalizadas com drag-and-drop.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2 text-purple-400">
                <Database className="w-5 h-5" />
                <span className="font-semibold text-sm text-slate-200">Integração Linx ERP</span>
              </div>
              <p className="text-xs text-slate-400">
                Importação e atualização de preços de tecidos e aviamentos sincronizados.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2 text-emerald-400">
                <Layers className="w-5 h-5" />
                <span className="font-semibold text-sm text-slate-200">Fichas Técnicas</span>
              </div>
              <p className="text-xs text-slate-400">
                Cálculos de consumo, variabilidade de cores, croquis e memorial de corte.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2 text-amber-400">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold text-sm text-slate-200">Multi-Marca</span>
              </div>
              <p className="text-xs text-slate-400">
                Alterne facilmente entre King & Joe, K&J Black e outras marcas do grupo.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé do Painel Esquerdo */}
        <div className="relative z-10 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} ModaFlow PLM</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Ambiente Seguro & Multi-Tenant
          </span>
        </div>
      </div>

      {/* PAINEL DIREITO - FORMULÁRIO DE LOGIN */}
      <div className="md:w-1/2 lg:w-2/5 p-8 lg:p-16 flex flex-col justify-center bg-slate-950">
        <div className="max-w-md w-full mx-auto">
          {/* Cabeçalho do Form */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta!</h3>
            <p className="text-slate-400 text-sm">
              Entre com suas credenciais para acessar o painel do **ModaFlow PLM**.
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo E-mail */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                E-mail corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome@kingjoe.com.br"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Senha
                </label>
                <a href="#forgot" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox Lembrar de mim */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
              />
              <label htmlFor="remember" className="ml-2.5 text-xs text-slate-400">
                Manter conectado nesta máquina
              </label>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Atalhos de Teste Rápido (Demo Shortcuts) */}
          <div className="mt-10 pt-6 border-t border-slate-900">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Atalhos de Acesso Rápido (Ambiente de Dev)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('estilo@kingjoe.com.br')}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 text-center transition"
              >
                👕 Estilista
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('producao@kingjoe.com.br')}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 text-center transition"
              >
                🏭 Produção
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@modaflow.com.br')}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 text-center transition"
              >
                👑 Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
