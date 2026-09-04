/**
 * ============================================================================
 * MÓDULO: Layout Principal & Header Corporativo
 * ARQUIVO: src/components/layout/MainLayout.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Componente de Layout global exibido após a autenticação.
 *            Possui o cabeçalho superior com as 4 áreas de navegação principal
 *            (Início, Gestão, Relatórios, Kanban), notificações e perfil do usuário.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { HomePage } from '../../pages/Home/HomePage';
import { GestaoPage } from '../../pages/Gestao/GestaoPage';
import type { MarcaSummary } from '../../types/auth';
import { 
  Kanban, 
  BarChart3, 
  LogOut, 
  Bell, 
  ChevronDown
} from 'lucide-react';

/**
 * Componente de Layout Principal do ModaFlow PLM.
 */
export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Estado da Aba Principal de Navegação (Início, Gestão, Relatórios, Kanban)
  const [activeTab, setActiveTab] = useState<'inicio' | 'gestao' | 'relatorios' | 'kanban'>('inicio');
  
  // NAVEGAÇÃO INTERNA DA GESTÃO PARA COLEÇÕES DA MARCA SELECIONADA
  const handleOpenColecoesFromGestao = (marca: MarcaSummary) => {
    localStorage.setItem('modaflow_selected_marca_id', marca.id);
    setActiveTab('inicio');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('modaflow_open_marca_colecoes', { detail: marca.id }));
    }, 50);
  };
  
  // Estado do Dropdown de Perfil
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-primary flex flex-col font-sans selection:bg-accent-camel selection:text-white">
      
      {/* 1. NAVEGAÇÃO DO TOPO (HEADER CORPORATIVO AKR BRANDS) */}
      <header className="bg-surface border-b border-border sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Esquerda: AKR BRANDS (Branding Editorial Clicável) */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inicio');
                  localStorage.removeItem('modaflow_selected_marca_id');
                  localStorage.removeItem('modaflow_selected_colecao_id');
                  window.dispatchEvent(new Event('modaflow_reset_to_home'));
                }}
                className="font-editorial text-base font-semibold tracking-[0.25em] text-primary uppercase hover:text-accent-camel transition cursor-pointer flex items-center gap-2"
                title="Voltar para o Menu Inicial"
              >
                <span>AKR</span>
                <span className="w-1 h-1 rounded-full bg-accent-camel"></span>
                <span className="font-light tracking-[0.3em]">BRANDS</span>
              </button>
            </div>

            {/* Centro: As 4 Grandes Áreas de Navegação (Início, Gestão, Relatórios, Kanban) */}
            <nav className="flex items-center gap-2 sm:gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`py-2 transition cursor-pointer ${
                  activeTab === 'inicio'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                Início
              </button>

              <button
                onClick={() => setActiveTab('gestao')}
                className={`py-2 transition cursor-pointer ${
                  activeTab === 'gestao'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                Gestão
              </button>

              <button
                onClick={() => setActiveTab('relatorios')}
                className={`py-2 transition cursor-pointer ${
                  activeTab === 'relatorios'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                Relatórios
              </button>

              <button
                onClick={() => setActiveTab('kanban')}
                className={`py-2 transition cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-muted hover:text-primary'
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
                className="p-1.5 rounded-full text-muted-foreground hover:text-primary transition relative cursor-pointer"
                title="Notificações Internas"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-camel text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                  2
                </span>
              </button>

              {/* Seletor de Perfil do Usuário */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-amber-200 font-bold text-xs flex items-center justify-center shadow-2xs border border-neutral-800">
                  {user?.nome.charAt(0) || 'J'}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition cursor-pointer"
                  >
                    <span>{user?.nome || 'Juliano'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted" />
                  </button>

                  {/* Dropdown de Opções do Perfil / Logout */}
                  {brandDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 p-2 text-xs">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold text-muted uppercase tracking-wider border-b border-border-muted mb-1">
                        Conta Corporativa
                      </div>
                      <div className="px-3 py-1.5 font-bold text-primary">
                        {user?.email}
                      </div>
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-accent-bordo hover:bg-accent-bordo/10 font-bold rounded-lg flex items-center gap-2 transition cursor-pointer"
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
          <GestaoPage onOpenColecoes={handleOpenColecoesFromGestao} />
        )}

        {activeTab === 'relatorios' && (
          <div className="max-w-7xl mx-auto p-8">
            <div className="p-12 rounded-xl bg-fabric-pattern border border-border shadow-2xs text-center space-y-3">
              <BarChart3 className="w-12 h-12 text-accent-camel mx-auto opacity-80" />
              <h3 className="text-xl font-bold font-editorial text-primary">Módulo de Relatórios & BI Executivo</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">Histórico consolidado de coleções, índices de repilotagem por marca, consumo de matéria-prima e exportação de relatórios gerenciais.</p>
            </div>
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="max-w-7xl mx-auto p-8">
            <div className="p-8 rounded-xl bg-surface border border-border text-center">
              <Kanban className="w-12 h-12 text-accent-camel mx-auto mb-3" />
              <h3 className="text-lg font-bold font-editorial text-primary">Quadro Kanban de Planejamento Visual</h3>
              <p className="text-xs text-muted-foreground mt-1">Visualização por colunas com as 23 etapas de produção e drag-and-drop de peças.</p>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};
