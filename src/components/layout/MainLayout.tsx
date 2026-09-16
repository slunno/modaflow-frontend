/**
 * ============================================================================
 * MÓDULO: Layout Principal & Header Corporativo
 * ARQUIVO: src/components/layout/MainLayout.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Componente de Layout global exibido após a autenticação.
 *            Integra React Router para navegação declarativa entre as áreas da aplicação.
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { MarcaSummary } from '../../types/auth';
import { LogOut, Bell, ChevronDown, Layers, BarChart2, PieChart } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // NAVEGAÇÃO INTERNA DA GESTÃO PARA COLEÇÕES DA MARCA SELECIONADA
  const handleOpenColecoesFromGestao = (marca: MarcaSummary) => {
    localStorage.setItem('modaflow_selected_marca_id', marca.id);
    navigate('/');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('modaflow_open_marca_colecoes', { detail: marca.id }));
    }, 50);
  };

  // Estado dos Dropdowns
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [relatoriosDropdownOpen, setRelatoriosDropdownOpen] = useState(false);

  const relatoriosRef = useRef<HTMLDivElement>(null);
  const userProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (relatoriosRef.current && !relatoriosRef.current.contains(event.target as Node)) {
        setRelatoriosDropdownOpen(false);
      }
      if (userProfileRef.current && !userProfileRef.current.contains(event.target as Node)) {
        setBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabClass = (path: string) => {
    const isActive =
      path === '/'
        ? location.pathname === '/' || location.pathname === ''
        : location.pathname.startsWith(path);
    return `py-2 transition cursor-pointer ${
      isActive
        ? 'text-primary font-bold border-b-2 border-primary'
        : 'text-muted hover:text-primary'
    }`;
  };

  const isRelatoriosActive =
    location.pathname.startsWith('/products') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/bi') ||
    location.pathname.startsWith('/relatorios');

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
                  navigate('/');
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

            {/* Centro: Navegação com Dropdown de Relatórios, Gestão e Kanban */}
            <nav className="flex items-center gap-2 sm:gap-6 text-sm font-semibold">
              {/* DROPDOWN MENU: RELATÓRIOS & ANALYTICS */}
              <div className="relative" ref={relatoriosRef}>
                <button
                  type="button"
                  onClick={() => setRelatoriosDropdownOpen(!relatoriosDropdownOpen)}
                  className={`flex items-center gap-1.5 py-2 transition cursor-pointer ${
                    isRelatoriosActive
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <span>Relatórios</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      relatoriosDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Sub-menu suspenso (Peças, Dashboard, Gráficos) */}
                {relatoriosDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/products');
                        setRelatoriosDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                        location.pathname.startsWith('/products')
                          ? 'bg-accent-camel/10 text-accent-camel font-bold'
                          : 'text-muted-foreground hover:bg-surface-muted hover:text-primary'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                      <span>Peças</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/dashboard');
                        setRelatoriosDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                        location.pathname.startsWith('/dashboard')
                          ? 'bg-accent-camel/10 text-accent-camel font-bold'
                          : 'text-muted-foreground hover:bg-surface-muted hover:text-primary'
                      }`}
                    >
                      <BarChart2 className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                      <span>Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/bi');
                        setRelatoriosDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                        location.pathname.startsWith('/bi')
                          ? 'bg-accent-camel/10 text-accent-camel font-bold'
                          : 'text-muted-foreground hover:bg-surface-muted hover:text-primary'
                      }`}
                    >
                      <PieChart className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                      <span>Gráficos</span>
                    </button>
                  </div>
                )}
              </div>

              {/* GESTÃO */}
              <button onClick={() => navigate('/gestao')} className={getTabClass('/gestao')}>
                Gestão
              </button>

              {/* KANBAN */}
              <button onClick={() => navigate('/kanban')} className={getTabClass('/kanban')}>
                Kanban
              </button>
            </nav>

            {/* Direita: Perfil do Usuário e Notificação com Badge '2' */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/notifications')}
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

                <div className="relative" ref={userProfileRef}>
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
                      <div className="px-3 py-1.5 font-bold text-primary">{user?.email}</div>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
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
        <Outlet context={{ handleOpenColecoesFromGestao }} />
      </main>
    </div>
  );
};
