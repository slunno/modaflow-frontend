import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Moon, 
  Sun,
  Shirt, 
  Kanban, 
  Layers, 
  Database, 
  Building2, 
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Cpu,
  ArrowUpRight
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

  // ESTADO INTERATIVO DO PREVIEW DO SOFTWARE NO LOGIN
  const [activeTab, setActiveTab] = useState<'ficha' | 'kanban' | 'linx' | 'multimarca'>('ficha');
  const [selectedBrand, setSelectedBrand] = useState('King & Joe');
  const [linxSyncing, setLinxSyncing] = useState(false);

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

  const triggerLinxSync = () => {
    setLinxSyncing(true);
    setTimeout(() => setLinxSyncing(false), 1000);
  };

  return (
    <div className={`h-screen w-full flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* ========================================================= */}
      {/* PAINEL ESQUERDO - FORMULÁRIO AKR BRANDS                  */}
      {/* ========================================================= */}
      <div className={`w-full md:w-1/2 lg:w-5/12 ${
        isDarkMode ? 'bg-black text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200/80'
      } px-6 sm:px-10 py-8 flex flex-col justify-between relative shadow-sm border-r z-10 overflow-hidden transition-colors duration-300`}>
        
        {/* TOPO: LOGO AKR BRANDS + SUBTÍTULO */}
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center py-2">
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2.5">
                <span className={`text-3xl font-black tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>AKR</span>
                <span className="text-2xl font-light text-slate-400">|</span>
                <span className={`text-xs font-bold tracking-[0.3em] uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>BRANDS</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isDarkMode ? 'bg-blue-950/60 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                SISTEMA INTERNO
              </span>
            </div>

            <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Entre com seu e-mail e senha. <strong className={isDarkMode ? 'text-blue-400' : 'text-blue-700'}>Apenas funcionários</strong>
            </p>
          </div>

          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* FORMULÁRIO COMPACTO */}
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
                    ? 'bg-[#0a0e1a] border border-slate-800 text-white focus:border-blue-500' 
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
                      ? 'bg-[#0a0e1a] border border-slate-800 text-white focus:border-blue-500' 
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
            <div className={`p-3 rounded-xl flex items-center justify-between shadow-xs max-w-xs border ${
              isDarkMode ? 'bg-[#0a0e1a] border-slate-800' : 'bg-slate-50 border-slate-200'
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

        </div>

        {/* RODAPÉ ESQUERDO */}
        <div className="pt-4 text-center text-[11px] text-slate-400 font-semibold">
          Direitos reservados &copy; {new Date().getFullYear()} T.I Versão : 0.0.1
        </div>
      </div>

      {/* ========================================================= */}
      {/* PAINEL DIREITO - MOCKUP INTERATIVO DO SOFTWARE (PLM)      */}
      {/* ========================================================= */}
      <div className={`w-full md:w-1/2 lg:w-7/12 px-6 sm:px-10 py-8 flex flex-col justify-between relative overflow-hidden transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-black text-white' 
          : 'bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e0e7ff] text-slate-800'
      }`}>
        
        {/* Efeitos Vibrantes de Fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho Superior Direito */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-sm font-black tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ModaFlow <span className="text-[10px] text-blue-700 font-bold px-2 py-0.5 rounded-md bg-blue-100 border border-blue-200">PLM</span>
              </span>
              <span className={`text-[10px] block font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Plataforma Interna AKR BRANDS</span>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border ${
            isDarkMode ? 'bg-[#0a0e1a] text-blue-400 border-slate-800' : 'bg-white text-blue-700 border-blue-200/80'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Rede Corporativa Privada</span>
          </div>
        </div>

        {/* MOCKUP VISUAL INTERATIVO DINÂMICO NO CENTRO */}
        <div className="my-auto py-2 relative z-10 max-w-xl mx-auto w-full">
          
          {/* Título & Descrição Focados no Uso Interno da AKR BRANDS */}
          <div className="mb-4 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold mb-2 border border-blue-200/60">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Preview Interativo do Módulo</span>
            </div>

            <h2 className={`text-xl sm:text-2xl font-black tracking-tight leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Painel Operacional de Desenvolvimento & Produção
            </h2>
            <p className={`text-xs mt-1 leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Clique nos 4 botões abaixo para interagir e visualizar cada recurso do sistema da <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>AKR BRANDS</strong>.
            </p>
          </div>

          {/* CARD DE VISUALIZAÇÃO INTERNA INTERATIVO (TROCA CONFORME A ABA SELECIONADA) */}
          <div className={`p-4.5 rounded-2xl border shadow-lg transition-all duration-300 min-h-[220px] flex flex-col justify-between ${
            isDarkMode ? 'bg-[#090d16] border-slate-800/90' : 'bg-white border-slate-200/90'
          }`}>
            
            {/* ---------------------------------------------------- */}
            {/* CONTEÚDO 1: FICHA TÉCNICA (INSPIRADO NOS PRINTS)     */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'ficha' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">FICHA TÉCNICA • PEÇA BZ00004J</span>
                    <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Blazer Travel Pack — Linha Essentials</h4>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    Custo: R$ 42,50 | Preço: R$ 149,90
                  </span>
                </div>

                {/* Tags da Ficha (Tags como no print enviado pelo usuário!) */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">MALHA</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">BASE SLIM</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">ESSENTIALS</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">FICHA TÉCNICA</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">MOSTRUÁRIO</span>
                </div>

                {/* Sub-abas da Ficha */}
                <div className="grid grid-cols-5 gap-1 pt-1 text-center">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold">Geral</div>
                  <div className={`p-1.5 rounded-lg text-[10px] font-semibold border ${isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>Tecidos</div>
                  <div className={`p-1.5 rounded-lg text-[10px] font-semibold border ${isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>Aviamentos</div>
                  <div className={`p-1.5 rounded-lg text-[10px] font-semibold border ${isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>Custos</div>
                  <div className={`p-1.5 rounded-lg text-[10px] font-semibold border ${isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>Precificação</div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-semibold">
                  <span>Estilista: <strong>Mariana Barbosa</strong></span>
                  <span>Marca: <strong>{selectedBrand}</strong></span>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* CONTEÚDO 2: KANBAN 23 ETAPAS DE PRODUÇÃO             */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'kanban' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">FLUXO KANBAN DE PRODUÇÃO</span>
                    <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Acompanhamento em Tempo Real (23 Etapas)</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Etapa 05/23
                  </span>
                </div>

                {/* Colunas do Kanban Simulado */}
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2 rounded-xl border text-[10px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="font-extrabold text-slate-500 block mb-1">03 MODELAGEM</span>
                    <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-bold text-slate-800 dark:text-white">
                      BZ00004J • Blazer
                    </div>
                  </div>

                  <div className="p-2 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-[10px]">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block mb-1">05 CHECAGEM LINX</span>
                    <div className="p-1.5 rounded bg-indigo-600 text-white font-bold shadow-xs flex items-center justify-between">
                      <span>KJ-26 • Camisa</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl border text-[10px] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="font-extrabold text-slate-500 block mb-1">10 CORTE</span>
                    <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs font-bold text-slate-800 dark:text-white">
                      CS-12 • Polo Slim
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                    <span>Progresso da Coleção Verão 2026</span>
                    <span className="text-indigo-600 font-extrabold">42% Concluído</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-600 w-[42%] rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* CONTEÚDO 3: INTEGRAÇÃO ERP LINX SYNC                 */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'linx' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">INTEGRAÇÃO ERP LINX</span>
                    <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sincronizador de Preços de Matérias-Primas</h4>
                  </div>
                  <button 
                    onClick={triggerLinxSync}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs flex items-center gap-1 hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${linxSyncing ? 'animate-spin' : ''}`} />
                    {linxSyncing ? 'Sincronizando...' : 'Atualizar Linx'}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Tecido Linho Misto Fios Nobres</div>
                      <span className="text-[10px] text-slate-500">Ref: TEC-LIN-990</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">R$ 42,90 / metro</span>
                      <span className="text-[9px] text-emerald-600 block font-bold">✓ Selo ERP Ativo</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Botão Nácar 18mm</div>
                      <span className="text-[10px] text-slate-500">Ref: AVI-BOT-18</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">R$ 0,85 / un</span>
                      <span className="text-[9px] text-blue-600 block font-bold">Sincronizado</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 
                  <span>Todas as fichas com preços sincronizados com o Linx em tempo real.</span>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* CONTEÚDO 4: MULTI-MARCA AKR BRANDS                   */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'multimarca' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">MULTI-TENANT • MARCAS AKR</span>
                    <h4 className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Alternador de Marcas do Grupo</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Marca Ativa: {selectedBrand}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBrand('King & Joe')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedBrand === 'King & Joe' 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md font-bold' 
                        : isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-xs block font-black">King & Joe</span>
                    <span className="text-[9px] opacity-80">4 Coleções</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBrand('K&J Black')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedBrand === 'K&J Black' 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md font-bold' 
                        : isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-xs block font-black">K&J Black</span>
                    <span className="text-[9px] opacity-80">2 Coleções</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBrand('King & Joe Play')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedBrand === 'King & Joe Play' 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md font-bold' 
                        : isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-xs block font-black">King & Joe Play</span>
                    <span className="text-[9px] opacity-80">3 Coleções</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-300 font-bold flex items-center justify-between">
                  <span>Contexto de dados filtrado exclusivamente para {selectedBrand}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

          </div>

          {/* OS 4 BOTÕES INTERATIVOS INFERIORES DO PREVIEW */}
          <div className="grid grid-cols-4 gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('ficha')}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                activeTab === 'ficha'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold scale-[1.02]'
                  : isDarkMode ? 'bg-[#090d16] text-slate-300 border-slate-800 hover:border-slate-700' : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
              }`}
            >
              <Layers className={`w-4 h-4 mx-auto mb-0.5 ${activeTab === 'ficha' ? 'text-white' : 'text-blue-500'}`} />
              <span className="text-[10px] font-bold block">Fichas Técnicas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold scale-[1.02]'
                  : isDarkMode ? 'bg-[#090d16] text-slate-300 border-slate-800 hover:border-slate-700' : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <Kanban className={`w-4 h-4 mx-auto mb-0.5 ${activeTab === 'kanban' ? 'text-white' : 'text-indigo-500'}`} />
              <span className="text-[10px] font-bold block">23 Etapas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('linx')}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                activeTab === 'linx'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold scale-[1.02]'
                  : isDarkMode ? 'bg-[#090d16] text-slate-300 border-slate-800 hover:border-slate-700' : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <Database className={`w-4 h-4 mx-auto mb-0.5 ${activeTab === 'linx' ? 'text-white' : 'text-emerald-500'}`} />
              <span className="text-[10px] font-bold block">ERP Linx Sync</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('multimarca')}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                activeTab === 'multimarca'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md font-bold scale-[1.02]'
                  : isDarkMode ? 'bg-[#090d16] text-slate-300 border-slate-800 hover:border-slate-700' : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
              }`}
            >
              <Building2 className={`w-4 h-4 mx-auto mb-0.5 ${activeTab === 'multimarca' ? 'text-white' : 'text-amber-500'}`} />
              <span className="text-[10px] font-bold block">Multi-Marca AKR</span>
            </button>
          </div>

        </div>

        {/* RODAPÉ DIREITO COM BOTÃO FLUTUANTE DE TEMA (MIDNIGHT OLED TOGGLE) */}
        <div className="flex items-center justify-between relative z-10 pt-2">
          <span className="text-[11px] text-slate-500 font-semibold">
            AKR BRANDS &copy; {new Date().getFullYear()} • ModaFlow PLM
          </span>

          {/* BOTÃO FLUTUANTE DE TEMA (LUA / SOL) */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
            title={isDarkMode ? "Alternar para Tema Claro Vibrante" : "Alternar para Tema Midnight OLED (Preto Absoluto #000000)"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-white" />}
          </button>
        </div>

      </div>

    </div>
  );
};
