import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shirt, 
  Kanban, 
  Home, 
  FolderKanban, 
  BarChart3, 
  Building2, 
  LogOut, 
  Bell, 
  ChevronDown,
  Layers,
  Clock,
  AlertTriangle,
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, activeMarca, setActiveMarca, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'inicio' | 'gestao' | 'relatorios' | 'kanban'>('inicio');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. NAVEGAÇÃO DO TOPO (HEADER AKR BRANDS LIGHT & VIBRANTE) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Esquerda: Logo AKR BRANDS + ModaFlow PLM + Seletor de Marca */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {/* Logo AKR BRANDS */}
                <div className="hidden sm:flex items-center gap-1.5 pr-3 border-r border-slate-200">
                  <span className="font-black text-xl text-slate-950 tracking-wider">AKR</span>
                  <span className="text-slate-400 font-light">|</span>
                  <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em]">BRANDS</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center text-white">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">
                    ModaFlow <span className="text-[10px] text-blue-700 font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">PLM</span>
                  </span>
                </div>
              </div>

              {/* Seletor de Marca Multi-tenant */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Marca: <strong className="text-blue-700">{activeMarca?.nome || 'King & Joe'}</strong></span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown de Marcas */}
                {brandDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2">
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Marcas AKR BRANDS (Tenants)
                    </div>
                    {user?.marcas.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveMarca(m);
                          setBrandDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-bold transition ${
                          activeMarca?.id === m.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{m.nome}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          activeMarca?.id === m.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {m.colecoesCount} coleções
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Centro: As 4 Grandes Áreas de Navegação (Início, Gestão, Relatórios, Kanban) */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'inicio'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </button>

              <button
                onClick={() => setActiveTab('gestao')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'gestao'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Gestão</span>
              </button>

              <button
                onClick={() => setActiveTab('relatorios')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'relatorios'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Relatórios</span>
              </button>

              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'kanban'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Kanban className="w-4 h-4" />
                <span>Kanban Visual</span>
              </button>
            </nav>

            {/* Direita: Notificações & Perfil do Usuário */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative"
                title="Notificações Internas"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
              </button>

              <div className="h-6 w-px bg-slate-200" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {user?.nome.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">{user?.nome}</div>
                    <div className="text-[10px] text-blue-700 font-bold">{user?.cargo} • AKR</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Sair da Conta Corporativa"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (DASHBOARD LIGHT) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Banner Operacional AKR BRANDS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/60 border border-blue-100 shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> AKR BRANDS — Painel de Controle: {activeMarca?.nome}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Acompanhamento da Coleção Verão 2026
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
              Controle de Engenharia de Produto, aprovação de croquis e sincronizador de custos do Linx.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('kanban')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/25 flex items-center gap-2 transition"
            >
              <Kanban className="w-4 h-4" />
              <span>Abrir Quadro Kanban</span>
            </button>
          </div>
        </div>

        {/* Métricas Principais Internas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peças em Ficha</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">48 Peças</div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">
              +12 cadastradas na semana
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tempo Média/Etapa</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">3.4 Dias</div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Permanência por peça</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peças com Atraso</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-red-600">3 Peças</div>
            <p className="text-[11px] text-red-600/80 font-bold mt-1">Requer atenção da Engenharia</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status ERP Linx</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600">Sincronizado</div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Última checagem: Há 5 min</p>
          </div>
        </div>

        {/* Módulos Operacionais Internos */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Módulos de Trabalho (AKR BRANDS)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Kanban */}
            <div 
              onClick={() => setActiveTab('kanban')}
              className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-500/50 hover:shadow-lg transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Kanban className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition">
                Kanban Visual de Produção
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
                Movimente as peças pelas 23 etapas do fluxo produtivo (Croqui, Modelagem, Mini Risco, Corte, Costura e Linx).
              </p>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                Acessar Kanban <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* Card 2: Fichas Técnicas */}
            <div 
              onClick={() => setActiveTab('gestao')}
              className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-purple-500/50 hover:shadow-lg transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition">
                Fichas Técnicas & Peças
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
                Consumo de tecidos e aviamentos, cálculo de custos, memorial de corte e sincronizador de preços do Linx.
              </p>
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                Ver Fichas Técnicas <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* Card 3: Módulo de Relatórios & BI */}
            <div 
              onClick={() => setActiveTab('relatorios')}
              className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-lg transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition">
                Relatórios & Repilotagens
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">
                Acompanhe retrabalhos, consumo total de matérias-primas por coleção e relatórios gerenciais customizados.
              </p>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                Visualizar BI <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};
