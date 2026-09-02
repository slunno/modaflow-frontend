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
  Sparkles,
  Layers,
  Clock,
  AlertTriangle,
  Database,
  ArrowRight
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, activeMarca, setActiveMarca, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'inicio' | 'gestao' | 'relatorios' | 'kanban'>('inicio');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. NAVEGAÇÃO DO TOPO (HEADER) */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Esquerda: Logo + Seletor de Marca Multi-tenant */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-600/30 flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">
                  ModaFlow <span className="text-xs text-indigo-400 font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">PLM</span>
                </span>
              </div>

              {/* Seletor de Marca Multi-tenant */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-200 transition"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Marca: <strong className="text-white">{activeMarca?.nome || 'King & Joe'}</strong></span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown de Marcas */}
                {brandDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-1.5">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Selecione a Marca (Tenant)
                    </div>
                    {user?.marcas.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveMarca(m);
                          setBrandDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition ${
                          activeMarca?.id === m.id
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{m.nome}</span>
                        <span className="text-[10px] opacity-70 px-1.5 py-0.5 rounded bg-black/20">
                          {m.colecoesCount} coleções
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Centro: As 4 Grandes Áreas de Navegação (Início, Gestão, Relatórios, Kanban) */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'inicio'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </button>

              <button
                onClick={() => setActiveTab('gestao')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'gestao'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Gestão</span>
              </button>

              <button
                onClick={() => setActiveTab('relatorios')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'relatorios'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Relatórios</span>
              </button>

              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
              </button>

              <div className="h-6 w-px bg-slate-800" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {user?.nome.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-white leading-tight">{user?.nome}</div>
                    <div className="text-[10px] text-indigo-400 font-medium">{user?.cargo}</div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (DASHBOARD) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Banner de Boas-vindas da Marca Contextualizada */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Contexto Ativo: Marca {activeMarca?.nome}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Painel de Gestão da Coleção — Verão 2026
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Acompanhamento de fichas técnicas, cronograma de aprovações e sincronização com ERP Linx.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('kanban')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              <Kanban className="w-4 h-4" />
              <span>Abrir Quadro Kanban</span>
            </button>
          </div>
        </div>

        {/* Métricas Principais / Visão Geral da Marca */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Total de Peças em Ficha</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">48 Peças</div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>+12 peças cadastradas na semana</span>
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Tempo Média na Etapa</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">3.4 Dias</div>
            <p className="text-[11px] text-slate-400 mt-1">Permanência média por peça</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Peças com Atraso</span>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-400">3 Peças</div>
            <p className="text-[11px] text-red-400/80 mt-1">Requer atenção da Engenharia</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Status ERP Linx</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400">Sincronizado</div>
            <p className="text-[11px] text-slate-400 mt-1">Última checagem: Há 5 min</p>
          </div>
        </div>

        {/* Módulos do Sistema de Moda */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Acesso Rápido aos Módulos do PLM</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Kanban */}
            <div 
              onClick={() => setActiveTab('kanban')}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Kanban className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-indigo-400 transition">
                Kanban Visual de Produção
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Movimente as peças pelas 23 etapas do fluxo produtivo (Croqui, Modelagem, Mini Risco, Corte, Costura e Linx).
              </p>
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                Acessar Kanban <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* Card 2: Fichas Técnicas */}
            <div 
              onClick={() => setActiveTab('gestao')}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition">
                Fichas Técnicas & Peças
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Consumo de tecidos e aviamentos, cálculo de custos, memorial de corte e sincronizador de preços do Linx.
              </p>
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
                Ver Fichas Técnicas <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* Card 3: Módulo de Relatórios & BI */}
            <div 
              onClick={() => setActiveTab('relatorios')}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition">
                Relatórios & Repilotagens
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Acompanhe retrabalhos, consumo total de matérias-primas por coleção e relatórios gerenciais customizados.
              </p>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                Visualizar BI <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};
