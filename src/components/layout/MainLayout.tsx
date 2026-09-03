/**
 * ============================================================================
 * MÓDULO: Layout Principal & Header Corporativo
 * ARQUIVO: src/components/layout/MainLayout.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Componente de Layout global exibido após a autenticação.
 *            Possui o cabeçalho superior com as 4 áreas de navegação principal
 *            (Início, Gestão, Relatórios, Kanban), notificações e perfil do usuário.
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - Para criar novas seções no sistema, adicione as opções no menu `<nav>` e
 *   mapeie a renderização correspondente no bloco `<main>`.
 * ============================================================================
 */

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

/**
 * Componente de Layout Principal do ModaFlow PLM.
 */
export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Estado da Aba Principal de Navegação (Início, Gestão, Relatórios, Kanban)
  const [activeTab, setActiveTab] = useState<'inicio' | 'gestao' | 'relatorios' | 'kanban'>('inicio');
  
  // Estado do Dropdown de Perfil
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. NAVEGAÇÃO DO TOPO (HEADER FIEL AO PRINT DO SISTEMA PLM) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Esquerda: AKR BRANDS (Branding Editorial Clicável - Passo 5) */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inicio');
                  localStorage.removeItem('modaflow_selected_marca_id');
                  localStorage.removeItem('modaflow_selected_colecao_id');
                  window.dispatchEvent(new Event('modaflow_reset_to_home'));
                }}
                className="font-editorial text-base font-semibold tracking-[0.25em] text-neutral-900 uppercase hover:text-amber-800 transition cursor-pointer flex items-center gap-2"
                title="Voltar para o Menu Inicial"
              >
                <span>AKR</span>
                <span className="w-1 h-1 rounded-full bg-amber-800"></span>
                <span className="font-light tracking-[0.3em]">BRANDS</span>
              </button>
            </div>

            {/* Centro: As 4 Grandes Áreas de Navegação (Início, Gestão, Relatórios, Kanban) */}
            <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`py-2 transition ${
                  activeTab === 'inicio'
                    ? 'text-neutral-950 font-bold border-b-2 border-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Início
              </button>

              <button
                onClick={() => setActiveTab('gestao')}
                className={`py-2 transition ${
                  activeTab === 'gestao'
                    ? 'text-neutral-950 font-bold border-b-2 border-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Gestão
              </button>

              <button
                onClick={() => setActiveTab('relatorios')}
                className={`py-2 transition ${
                  activeTab === 'relatorios'
                    ? 'text-neutral-950 font-bold border-b-2 border-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Relatórios
              </button>

              <button
                onClick={() => setActiveTab('kanban')}
                className={`py-2 transition ${
                  activeTab === 'kanban'
                    ? 'text-neutral-950 font-bold border-b-2 border-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Kanban
              </button>
            </nav>

            {/* Direita: Perfil do Usuário e Notificação com Badge '2' */}
            <div className="flex items-center gap-4">
              
              {/* Notificação com Badge '2' */}
              <button
                type="button"
                className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 transition relative cursor-pointer"
                title="Notificações Internas"
              >
                <Bell className="w-5 h-5 text-neutral-700" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  2
                </span>
              </button>

              {/* Seletor de Perfil do Usuário */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-amber-200 font-bold text-xs flex items-center justify-center shadow-2xs border border-neutral-800">
                  {user?.nome.charAt(0) || 'J'}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition cursor-pointer"
                  >
                    <span>{user?.nome || 'Juliano'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {/* Dropdown de Opções do Perfil / Logout */}
                  {brandDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 p-2 text-xs">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 mb-1">
                        Conta Corporativa
                      </div>
                      <div className="px-3 py-1.5 font-bold text-neutral-800">
                        {user?.email}
                      </div>
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
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

      {/* 2. CONTEÚDO PRINCIPAL DE NAVEGAÇÃO DA APLICAÇÃO */}
      <main className="flex-1 w-full">
        {activeTab === 'inicio' && (
          <HomePage />
        )}

        {activeTab === 'gestao' && (
          <div className="max-w-7xl mx-auto p-8">
            <div className="p-12 rounded-3xl bg-fabric-pattern border border-neutral-200 shadow-2xs text-center space-y-3">
              <FolderKanban className="w-12 h-12 text-amber-800 mx-auto opacity-80" />
              <h3 className="text-xl font-bold font-editorial text-neutral-900">Módulo de Gestão & Cadastros Base</h3>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">Gerenciamento centralizado de marcas, linhas de produto, fichas técnicas de tecidos, aviamentos, estamparia e tabelas de precificação da holding AKR BRANDS.</p>
            </div>
          </div>
        )}

        {activeTab === 'relatorios' && (
          <div className="max-w-7xl mx-auto p-8">
            <div className="p-12 rounded-3xl bg-fabric-pattern border border-neutral-200 shadow-2xs text-center space-y-3">
              <BarChart3 className="w-12 h-12 text-amber-800 mx-auto opacity-80" />
              <h3 className="text-xl font-bold font-editorial text-neutral-900">Módulo de Relatórios & BI Executivo</h3>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">Histórico consolidado de coleções, índices de repilotagem por marca, consumo de matéria-prima e exportação de relatórios gerenciais.</p>
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
