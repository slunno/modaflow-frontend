/**
 * ============================================================================
 * MÓDULO: Layout Principal & Header Corporativo
 * ARQUIVO: src/components/layout/MainLayout.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Componente de Layout global exibido após a autenticação.
 *            Header totalmente responsivo (<768px com menu mobile/drawer),
 *            badge de notificações dinâmico e navegação declarativa.
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { MarcaSummary } from '../../types/auth';
import { LogOut, Bell, ChevronDown, BarChart2, Menu, X, Kanban, Settings } from 'lucide-react';
import { getNotifications } from '../../services/plmService';
import { ThemeToggle } from '../ui/ThemeToggle';
import { RelatoriosSubmenu } from './RelatoriosSubmenu';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // NAVEGAÇÃO INTERNA DA GESTÃO PARA COLEÇÕES DA MARCA SELECIONADA
  const handleOpenColecoesFromGestao = (marca: MarcaSummary) => {
    localStorage.setItem('modaflow_selected_marca_id', marca.id);
    navigate(`/?marca=${encodeURIComponent(marca.id)}`);
  };

  // Estados dos Dropdowns e Menu Mobile
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const userProfileRef = useRef<HTMLDivElement>(null);

  // Busca contagem real de notificações
  useEffect(() => {
    let isMounted = true;
    getNotifications()
      .then((notes) => {
        if (isMounted) {
          const unread = notes.filter((n) => !n.lida).length;
          setNotificationsCount(unread);
        }
      })
      .catch(() => {
        if (isMounted) setNotificationsCount(0);
      });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userProfileRef.current && !userProfileRef.current.contains(event.target as Node)) {
        setBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setBrandDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (mobileMenuOpen) setMobileMenuOpen(false);
      setBrandDropdownOpen(false);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [mobileMenuOpen]);

  const getTabClass = (path: string) => {
    const isActive =
      path === '/'
        ? location.pathname === '/' || location.pathname === ''
        : location.pathname.startsWith(path);
    return `py-2 transition cursor-pointer text-xs sm:text-sm ${
      isActive
        ? 'text-primary font-bold border-b-2 border-primary'
        : 'text-muted hover:text-primary'
    }`;
  };

  const hasRelatoriosSubmenu = ['/products', '/dashboard', '/bi'].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  const isRelatoriosActive = hasRelatoriosSubmenu || location.pathname.startsWith('/relatorios');

  return (
    <div className="min-h-screen bg-bg text-primary flex flex-col font-sans selection:bg-selection selection:text-selection-foreground">
      {/* 1. NAVEGAÇÃO DO TOPO (HEADER CORPORATIVO AKR BRANDS) */}
      <header className="bg-surface border-b border-border sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Esquerda: AKR BRANDS & Botão Hamburger Mobile */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate('/');
                  localStorage.removeItem('modaflow_selected_marca_id');
                  localStorage.removeItem('modaflow_selected_colecao_id');
                  window.dispatchEvent(new Event('modaflow_reset_to_home'));
                }}
                className="font-editorial text-xs min-[375px]:text-sm sm:text-base font-semibold tracking-[0.25em] text-primary uppercase hover:text-accent-camel transition cursor-pointer flex items-center gap-2"
                title="Voltar para o Menu Inicial"
              >
                <span>AKR</span>
                <span className="hidden min-[375px]:block w-1 h-1 rounded-full bg-accent-camel"></span>
                <span className="font-light tracking-[0.3em]">BRANDS</span>
              </button>
            </div>

            {/* Centro: Navegação Desktop */}
            <nav
              aria-label="Navegação principal"
              className="hidden md:flex items-center gap-6 text-sm font-semibold"
            >
              <button
                type="button"
                onClick={() => navigate('/products' + location.search)}
                aria-current={isRelatoriosActive ? 'location' : undefined}
                className={`py-2 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-camel ${isRelatoriosActive ? 'text-primary font-bold border-b-2 border-primary' : 'text-muted hover:text-primary'}`}
              >
                Relatórios
              </button>

              {/* GESTÃO */}
              <button onClick={() => navigate('/gestao')} className={getTabClass('/gestao')}>
                Gestão
              </button>

              {/* KANBAN */}
              <button onClick={() => navigate('/kanban')} className={getTabClass('/kanban')}>
                Kanban
              </button>
            </nav>

            {/* Direita: Perfil do Usuário e Notificação */}
            <div className="flex items-center gap-1 sm:gap-4">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                className="p-1.5 rounded-full text-muted-foreground hover:text-primary transition relative cursor-pointer"
                title="Notificações Internas"
                aria-label={`Notificações${notificationsCount > 0 ? ` (${notificationsCount} não lidas)` : ''}`}
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-accent-camel text-on-camel text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {/* Seletor de Perfil do Usuário */}
              <div className="flex items-center gap-2">
                <div className="relative" ref={userProfileRef}>
                  <button
                    type="button"
                    onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                    aria-expanded={brandDropdownOpen}
                    aria-label={`Conta de ${user?.nome || 'Usuário'}`}
                    className="flex min-h-10 min-w-10 items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-camel"
                  >
                    <span
                      className="w-8 h-8 shrink-0 rounded-full bg-action text-action-foreground font-bold text-xs flex items-center justify-center shadow-2xs border border-border"
                      aria-hidden="true"
                    >
                      {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user?.nome || 'Usuário'}
                    </span>
                    <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-muted shrink-0" />
                  </button>

                  {/* Dropdown de Opções do Perfil / Logout */}
                  {brandDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-xl z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold text-muted uppercase tracking-wider border-b border-border-muted mb-1">
                        Conta Corporativa
                      </div>
                      <div className="px-3 py-1.5 font-bold text-primary truncate">
                        {user?.email || 'email@akrbrands.com'}
                      </div>
                      <div className="px-3 py-0.5 text-[11px] text-muted-foreground">
                        Perfil:{' '}
                        <span className="font-semibold text-primary">
                          {user?.cargo || 'Membro'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 mt-2 text-accent-bordo hover:bg-accent-bordo/10 font-bold rounded-lg flex items-center gap-2 transition cursor-pointer border-t border-border-muted"
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

        {/* 1.1 MENU MOBILE (DRAWER SUSPENSO PARA TELAS PEQUENAS < 768px) */}
        {mobileMenuOpen && (
          <nav
            aria-label="Navegação mobile"
            className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-lg text-xs"
          >
            <div className="font-bold text-muted uppercase tracking-wider text-[10px] mb-1">
              Menu de Navegação
            </div>

            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg font-bold text-primary hover:bg-surface-muted transition flex items-center gap-2.5"
            >
              <span>Início</span>
            </button>

            <button
              type="button"
              onClick={() => {
                navigate('/products' + location.search);
                setMobileMenuOpen(false);
              }}
              aria-current={isRelatoriosActive ? 'location' : undefined}
              className="w-full text-left py-2 px-3 rounded-lg font-bold text-primary hover:bg-surface-muted transition flex items-center gap-2.5"
            >
              <BarChart2 className="w-4 h-4 text-accent-camel" />
              <span>Relatórios</span>
            </button>

            <button
              onClick={() => {
                navigate('/gestao');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg font-bold text-primary hover:bg-surface-muted transition flex items-center gap-2.5"
            >
              <Settings className="w-4 h-4 text-accent-camel" />
              <span>Gestão</span>
            </button>

            <button
              onClick={() => {
                navigate('/kanban');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg font-bold text-primary hover:bg-surface-muted transition flex items-center gap-2.5"
            >
              <Kanban className="w-4 h-4 text-accent-camel" />
              <span>Kanban</span>
            </button>
          </nav>
        )}
      </header>

      {/* Relatórios usa a mesma barra horizontal das abas de Gestão. */}
      {hasRelatoriosSubmenu && <RelatoriosSubmenu />}

      {/* 2. CONTEÚDO PRINCIPAL DE NAVEGAÇÃO DA APLICAÇÃO */}
      <main className="flex-1 w-full">
        <Outlet context={{ handleOpenColecoesFromGestao }} />
      </main>
    </div>
  );
};
export default MainLayout;
