/**
 * ============================================================================
 * MÓDULO: Página Inicial / Seleção de Marcas (Home)
 * ARQUIVO: src/pages/Home/HomePage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe o Menu Inicial com sub-abas (Marcas, Peças, Dashboard, Gráficos)
 *            e o Carrossel Suspenso de Marcas da AKR BRANDS com setas de navegação
 *            interativas (< e >) e transição dinâmica de imagem de fundo.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MOCK_MARCAS } from '../../constants/mockData';
import type { MarcaSummary } from '../../types/auth';
import { PecasTab } from './components/PecasTab';
import { DashboardTab } from './components/DashboardTab';
import { GraficosTab } from './components/GraficosTab';
import { BrandCollectionsView } from './components/BrandCollectionsView';
import { ColecoesDestaqueCarousel } from './components/ColecoesDestaqueCarousel';

/**
 * Componente da Tela Inicial (Home) com Carrossel Suspenso de Marcas e Abas do PLM.
 */
export const HomePage: React.FC = () => {
  const { setActiveMarca } = useAuth();

  // Estado da Sub-aba ativa na Home com persistência no localStorage
  const [subTab, setSubTab] = useState<'marcas' | 'pecas' | 'dashboard' | 'graficos'>(() => {
    const saved = localStorage.getItem('modaflow_sub_tab');
    if (saved === 'marcas' || saved === 'pecas' || saved === 'dashboard' || saved === 'graficos') {
      return saved;
    }
    return 'marcas';
  });

  // Marca selecionada recuperada do localStorage
  const [selectedMarcaForView, setSelectedMarcaForView] = useState<MarcaSummary | null>(() => {
    const savedMarcaId = localStorage.getItem('modaflow_selected_marca_id');
    if (savedMarcaId) {
      return MOCK_MARCAS.find((m) => m.id === savedMarcaId) || null;
    }
    return null;
  });

  // Salvar subTab no localStorage
  useEffect(() => {
    localStorage.setItem('modaflow_sub_tab', subTab);
  }, [subTab]);

  // Salvar selectedMarcaForView no localStorage
  useEffect(() => {
    if (selectedMarcaForView) {
      localStorage.setItem('modaflow_selected_marca_id', selectedMarcaForView.id);
    } else {
      localStorage.removeItem('modaflow_selected_marca_id');
      localStorage.removeItem('modaflow_selected_colecao_id');
    }
  }, [selectedMarcaForView]);

  // Escutar eventos de reset e de abertura de marca disparados pela navegação
  useEffect(() => {
    const handleReset = () => {
      setSubTab('marcas');
      setSelectedMarcaForView(null);
      localStorage.removeItem('modaflow_sub_tab');
      localStorage.removeItem('modaflow_selected_marca_id');
      localStorage.removeItem('modaflow_selected_colecao_id');
    };

    const handleOpenMarca = (e: Event) => {
      const customEvt = e as CustomEvent;
      const marcaId = customEvt.detail;
      const found = MOCK_MARCAS.find((m) => m.id === marcaId);
      if (found) {
        setSelectedMarcaForView(found);
        setSubTab('marcas');
      }
    };

    window.addEventListener('modaflow_reset_to_home', handleReset);
    window.addEventListener('modaflow_open_marca_colecoes', handleOpenMarca);
    return () => {
      window.removeEventListener('modaflow_reset_to_home', handleReset);
      window.removeEventListener('modaflow_open_marca_colecoes', handleOpenMarca);
    };
  }, []);

  const isDarkTheme = subTab === 'marcas' && !selectedMarcaForView;

  return (
    <div className="w-full flex flex-col font-sans">
      {/* 1. NAVEGAÇÃO DE SUB-ABAS (Marcas | Peças | Dashboard | Gráficos) */}
      <div
        className={`border-b transition-colors duration-300 ${
          isDarkTheme ? 'bg-[#0c0a09] border-white/10 text-white' : 'bg-surface border-border'
        } px-4 sm:px-8 pt-4`}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-sm font-semibold">
          <button
            onClick={() => {
              setSubTab('marcas');
              setSelectedMarcaForView(null);
            }}
            className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer ${
              subTab === 'marcas'
                ? isDarkTheme
                  ? 'border-[#c5a880] text-[#c5a880] font-bold'
                  : 'border-primary text-primary font-bold'
                : isDarkTheme
                  ? 'border-transparent text-neutral-400 hover:text-white'
                  : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            Marcas
          </button>
          <button
            onClick={() => setSubTab('pecas')}
            className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer ${
              subTab === 'pecas'
                ? 'border-primary text-primary font-bold'
                : isDarkTheme
                  ? 'border-transparent text-neutral-400 hover:text-white'
                  : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            Peças
          </button>
          <button
            onClick={() => setSubTab('dashboard')}
            className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer ${
              subTab === 'dashboard'
                ? 'border-primary text-primary font-bold'
                : isDarkTheme
                  ? 'border-transparent text-neutral-400 hover:text-white'
                  : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setSubTab('graficos')}
            className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer ${
              subTab === 'graficos'
                ? 'border-primary text-primary font-bold'
                : isDarkTheme
                  ? 'border-transparent text-neutral-400 hover:text-white'
                  : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            Gráficos
          </button>
        </div>
      </div>

      {/* 2. CONTEÚDO REATIVO POR ABA SELECIONADA */}
      <div
        className={`w-full ${isDarkTheme ? 'bg-[#0c0a09]' : 'max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'}`}
      >
        {/* ABA 1: MARCAS (CARROSSEL 3D COVERFLOW EM TELA CHEIA E DETALHAMENTO DE COLEÇÕES) */}
        {subTab === 'marcas' &&
          (selectedMarcaForView ? (
            <div className="animate-in fade-in duration-200 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <BrandCollectionsView
                marca={selectedMarcaForView}
                onBack={() => setSelectedMarcaForView(null)}
                onSelectMarca={(m) => setSelectedMarcaForView(m)}
              />
            </div>
          ) : (
            <div className="w-full bg-[#0c0a09] animate-in fade-in duration-300">
              <ColecoesDestaqueCarousel
                onSelectMarca={(marca) => {
                  setActiveMarca(marca);
                  setSelectedMarcaForView(marca);
                }}
              />
            </div>
          ))}

        {/* ABA 2: PEÇAS (CATÁLOGO & FILTROS) */}
        {subTab === 'pecas' && <PecasTab />}

        {/* ABA 3: DASHBOARD (MÉTRICAS & VISÃO GERAL) */}
        {subTab === 'dashboard' && <DashboardTab />}

        {/* ABA 4: GRÁFICOS (ANALYTICS & BI) */}
        {subTab === 'graficos' && <GraficosTab />}
      </div>
    </div>
  );
};
