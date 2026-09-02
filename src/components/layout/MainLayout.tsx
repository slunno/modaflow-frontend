import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { HomePage } from '../../pages/Home/HomePage';
import { 
  Kanban, 
  BarChart3, 
  LogOut, 
  Bell, 
  ChevronDown,
  FolderKanban
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'inicio' | 'gestao' | 'relatorios' | 'kanban'>('inicio');
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. NAVEGAÇÃO DO TOPO (HEADER FIEL AO PRINT DO SISTEMA PLM) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Esquerda: Logo CM / AKR */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                {/* Logo Estilo CM do Print */}
                <div className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                  C<span className="text-blue-600">.</span>M
                </div>
                <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                <span className="text-xs font-extrabold text-slate-400 hidden sm:block tracking-wider">
                  AKR BRANDS
                </span>
              </div>
            </div>

            {/* Centro: As 4 Grandes Áreas de Navegação (Início, Gestão, Relatórios, Kanban) */}
            <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`py-2 transition ${
                  activeTab === 'inicio'
                    ? 'text-slate-950 font-bold border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Início
              </button>

              <button
                onClick={() => setActiveTab('gestao')}
                className={`py-2 transition ${
                  activeTab === 'gestao'
                    ? 'text-slate-950 font-bold border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Gestão
              </button>

              <button
                onClick={() => setActiveTab('relatorios')}
                className={`py-2 transition ${
                  activeTab === 'relatorios'
                    ? 'text-slate-950 font-bold border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Relatórios
              </button>

              <button
                onClick={() => setActiveTab('kanban')}
                className={`py-2 transition ${
                  activeTab === 'kanban'
                    ? 'text-slate-950 font-bold border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Kanban
              </button>
            </nav>

            {/* Direita: Perfil do Usuário Juliano (como no print!) e Notificação com Badge '2' */}
            <div className="flex items-center gap-4">
              
              {/* Notificação com Bolinha Vermelha '2' (Como no print!) */}
              <button
                type="button"
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 transition relative"
                title="Notificações"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  2
                </span>
              </button>

              {/* Seletor de Perfil do Usuário (Juliano / Nathan) */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {user?.nome.charAt(0) || 'J'}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 transition"
                  >
                    <span>{user?.nome || 'Juliano'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Dropdown de Opções / Logout */}
                  {brandDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-xs">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                        Conta Corporativa
                      </div>
                      <div className="px-3 py-1.5 font-bold text-slate-800">
                        {user?.email}
                      </div>
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center gap-2 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair do Sistema</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (DASHBOARD OU CARROSSEL DE MARCAS DA HOME) */}
      <main className="flex-1 w-full">
        {activeTab === 'inicio' && (
          <HomePage />
        )}

        {activeTab === 'gestao' && (
          <div className="max-w-7xl mx-auto p-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center">
              <FolderKanban className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Módulo de Gestão (Cadastros Base)</h3>
              <p className="text-xs text-slate-500 mt-1">Marcas, Usuários, Times, Tecidos, Aviamentos, Custos Fixos e Precificação.</p>
            </div>
          </div>
        )}

        {activeTab === 'relatorios' && (
          <div className="max-w-7xl mx-auto p-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Módulo de Relatórios & BI</h3>
              <p className="text-xs text-slate-500 mt-1">Histórico de entregas, Repilotagens, consumo de matérias-primas e relatórios customizados.</p>
            </div>
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="max-w-7xl mx-auto p-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center">
              <Kanban className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Quadro Kanban de Planejamento Visual</h3>
              <p className="text-xs text-slate-500 mt-1">Visualização por colunas com as 23 etapas de produção e drag-and-drop de peças.</p>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};
