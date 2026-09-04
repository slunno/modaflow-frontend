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
import { useAuth, MOCK_MARCAS } from '../../contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import type { MarcaSummary } from '../../types/auth';
import { PecasTab } from './components/PecasTab';
import { DashboardTab } from './components/DashboardTab';
import { GraficosTab } from './components/GraficosTab';
import { BrandCollectionsView } from './components/BrandCollectionsView';

/**
 * Componente da Tela Inicial (Home) com Carrossel Suspenso de Marcas e Abas do PLM.
 */
export const HomePage: React.FC = () => {
  const { activeMarca, setActiveMarca } = useAuth();
  
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
      return MOCK_MARCAS.find(m => m.id === savedMarcaId) || null;
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

  // Escutar evento de reset disparado ao clicar no logo "AKR BRANDS" no topo
  useEffect(() => {
    const handleReset = () => {
      setSubTab('marcas');
      setSelectedMarcaForView(null);
      localStorage.removeItem('modaflow_sub_tab');
      localStorage.removeItem('modaflow_selected_marca_id');
      localStorage.removeItem('modaflow_selected_colecao_id');
    };

    window.addEventListener('modaflow_reset_to_home', handleReset);
    return () => window.removeEventListener('modaflow_reset_to_home', handleReset);
  }, []);

  // Índice da Marca atualmente focada no Carrossel Suspenso
  const [currentIndex, setCurrentIndex] = useState(() => {
    const found = MOCK_MARCAS.findIndex(m => m.id === activeMarca?.id);
    return found !== -1 ? found : 0;
  });

  const currentMarca: MarcaSummary = MOCK_MARCAS[currentIndex];

  /** Avança para a próxima marca no carrossel */
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % MOCK_MARCAS.length);
  };

  /** Volta para a marca anterior no carrossel */
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + MOCK_MARCAS.length) % MOCK_MARCAS.length);
  };

  /** Seleciona uma marca diretamente ao clicar no seu card suspenso */
  const handleSelectMarca = (marca: MarcaSummary, index: number) => {
    setCurrentIndex(index);
    setActiveMarca(marca);
  };

  /** Abre a visão dedicada de coleções da marca selecionada */
  const handleOpenColecoes = (marca: MarcaSummary) => {
    setActiveMarca(marca);
    setSelectedMarcaForView(marca);
  };

  return (
    <div className="w-full flex flex-col font-sans">
      
      {/* 1. NAVEGAÇÃO DE SUB-ABAS (Marcas | Peças | Dashboard | Gráficos) */}
      <div className="border-b border-border bg-surface px-4 sm:px-8 pt-4">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-sm font-semibold">
          <button
            onClick={() => {
              setSubTab('marcas');
              setSelectedMarcaForView(null);
            }}
            className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer ${
              subTab === 'marcas'
                ? 'border-primary text-primary font-bold'
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
                : 'border-transparent text-muted hover:text-muted-foreground'
            }`}
          >
            Gráficos
          </button>
        </div>
      </div>

      {/* 2. CONTEÚDO REATIVO POR ABA SELECIONADA COM FADE SUTIL */}
      <div className={`w-full ${subTab === 'marcas' && !selectedMarcaForView ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto' : 'max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'}`}>
        
        {/* ABA 1: MARCAS (CARROSSEL SUSPENSO E DETALHAMENTO DE COLEÇÕES) */}
        {subTab === 'marcas' && (
          selectedMarcaForView ? (
            <div className="animate-in fade-in duration-200">
              <BrandCollectionsView 
                marca={selectedMarcaForView} 
                onBack={() => setSelectedMarcaForView(null)} 
                onSelectMarca={(m) => setSelectedMarcaForView(m)}
              />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="mb-2">
                <h3 className="text-base font-bold font-editorial text-primary tracking-tight">
                  Marcas da organização
                </h3>
              </div>

              {/* HERO CARROSSEL SUSPENSO DAS MARCAS AKR BRANDS */}
              <div className="relative w-full rounded-3xl overflow-hidden shadow-xl min-h-[480px] sm:min-h-[520px] flex flex-col justify-between p-6 sm:p-10 text-white transition-all duration-500 bg-neutral-950">
                
                {/* IMAGEM DE FUNDO DA MARCA ATIVA NO CARROSSEL */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500 transform scale-105 img-brand-treated"
                  style={{ backgroundImage: `url(${currentMarca.heroImageUrl})` }}
                />
                
                {/* OVERLAY DE DEGRADÊ PARA LEITURA PERFEITA */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/30" />

                {/* BARRA SUPERIOR SUSPENSA DO CARROSSEL */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} />
                    <span>AKR BRANDS • {currentMarca.badgeTag}</span>
                  </div>

                  <div className="text-xs font-bold text-white/80 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                    {currentIndex + 1} de {MOCK_MARCAS.length}
                  </div>
                </div>

                {/* SETAS INTERATIVAS DE NAVEGAÇÃO (< E >) */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-white text-white hover:text-primary border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                  title="Marca Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-white text-white hover:text-primary border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                  title="Próxima Marca"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* MEIO: INFORMAÇÕES DA MARCA SELECIONADA */}
                <div className="relative z-10 my-auto max-w-2xl">
                  <div className="inline-block px-3 py-1 rounded-md bg-accent-camel font-extrabold text-xs uppercase tracking-widest text-white mb-2 shadow-2xs">
                    {currentMarca.code}
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-bold font-editorial text-white tracking-wide mb-3">
                    {currentMarca.nome}
                  </h2>
                  <p className="text-neutral-200 text-sm sm:text-base leading-relaxed mb-6 font-medium max-w-xl backdrop-blur-xs">
                    {currentMarca.description}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleOpenColecoes(currentMarca)}
                      className="px-6 py-3.5 bg-white hover:bg-surface-muted text-primary font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    >
                      <span>Abrir Coleções de {currentMarca.nome}</span>
                      <ArrowRight className="w-4 h-4 text-accent-camel" />
                    </button>
                  </div>
                </div>

                {/* CARDS SUSPENSOS DAS MARCAS */}
                <div className="relative z-10 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {MOCK_MARCAS.map((m, idx) => {
                      const isSelected = idx === currentIndex;
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelectMarca(m, idx)}
                          className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center gap-3 ${
                            isSelected
                              ? 'bg-white text-primary border-white shadow-md scale-[1.02]'
                              : 'bg-black/40 text-white border-white/20 hover:bg-black/60 hover:border-white/40'
                          }`}
                        >
                          <div className={`px-3 py-2.5 rounded-lg font-extrabold text-xs tracking-wider border shrink-0 ${
                            isSelected 
                              ? 'bg-accent-camel/10 text-accent-camel border-accent-camel/30' 
                              : 'bg-white/10 text-white border-white/20'
                          }`}>
                            {m.initials}
                          </div>

                          <div className="overflow-hidden">
                            <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-white'}`}>
                              {m.nome}
                            </h4>
                            <span className={`text-[11px] font-semibold block ${isSelected ? 'text-muted-foreground' : 'text-neutral-300'}`}>
                              {m.colecoesCount} Coleções • {m.pecasCount} Peças
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )
        )}

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
