/**
 * ============================================================================
 * MÓDULO: Página Inicial / Seleção de Marcas (Home)
 * ARQUIVO: src/pages/Home/HomePage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe o Menu Inicial com sub-abas (Marcas, Peças, Dashboard, Gráficos)
 *            e o Carrossel Suspenso de Marcas da AKR BRANDS com setas de navegação
 *            interativas (< e >) e transição dinâmica de imagem de fundo.
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - Para trocar as imagens de fundo das marcas no carrossel, altere o campo
 *   `heroImageUrl` na constante `MOCK_MARCAS` em `src/contexts/AuthContext.tsx`.
 * - Ao incluir novas sub-abas na Home, adicione o manipulador no estado `subTab`.
 * ============================================================================
 */

import React, { useState } from 'react';
import { useAuth, MOCK_MARCAS } from '../../contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles,
  FolderKanban
} from 'lucide-react';
import type { MarcaSummary } from '../../types/auth';

/**
 * Componente da Tela Inicial (Home) com Carrossel Suspenso de Marcas.
 */
export const HomePage: React.FC = () => {
  const { activeMarca, setActiveMarca } = useAuth();
  
  // Estado da Sub-aba ativa na Home
  const [subTab, setSubTab] = useState<'marcas' | 'pecas' | 'dashboard' | 'graficos'>('marcas');
  
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

  return (
    <div className="w-full flex flex-col font-sans">
      
      {/* 1. NAVEGAÇÃO DE SUB-ABAS (Marcas | Peças | Dashboard | Gráficos) */}
      <div className="border-b border-slate-200 bg-white px-4 sm:px-8 pt-4">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-sm font-semibold">
          <button
            onClick={() => setSubTab('marcas')}
            className={`pb-3 border-b-2 transition ${
              subTab === 'marcas'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Marcas
          </button>
          <button
            onClick={() => setSubTab('pecas')}
            className={`pb-3 border-b-2 transition ${
              subTab === 'pecas'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Peças
          </button>
          <button
            onClick={() => setSubTab('dashboard')}
            className={`pb-3 border-b-2 transition ${
              subTab === 'dashboard'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setSubTab('graficos')}
            className={`pb-3 border-b-2 transition ${
              subTab === 'graficos'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Gráficos
          </button>
        </div>
      </div>

      {/* 2. CONTEÚDO DA ABA MARCAS */}
      {subTab === 'marcas' && (
        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Marcas da organização
            </h3>
          </div>

          {/* 3. HERO CARROSSEL SUSPENSO DAS MARCAS AKR BRANDS */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl min-h-[460px] flex flex-col justify-between p-6 sm:p-10 text-white transition-all duration-500 bg-slate-900">
            
            {/* IMAGEM DE FUNDO DA MARCA ATIVA NO CARROSSEL */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
              style={{ backgroundImage: `url(${currentMarca.heroImageUrl})` }}
            />
            
            {/* OVERLAY DE DEGRADÊ PARA GARANTIR LEITURA PERFEITA */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

            {/* BARRA SUPERIOR SUSPENSA DO CARROSSEL */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>AKR BRANDS • {currentMarca.badgeTag}</span>
              </div>

              {/* CONTADOR DO CARROSSEL */}
              <div className="text-xs font-bold text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                {currentIndex + 1} de {MOCK_MARCAS.length}
              </div>
            </div>

            {/* SETAS INTERATIVAS DE NAVEGAÇÃO (< E >) */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-white text-white hover:text-slate-900 border border-white/20 backdrop-blur-md flex items-center justify-center transition shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
              title="Marca Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-white text-white hover:text-slate-900 border border-white/20 backdrop-blur-md flex items-center justify-center transition shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
              title="Próxima Marca"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* MEIO: INFORMAÇÕES DA MARCA SELECIONADA */}
            <div className="relative z-10 my-auto max-w-2xl">
              <div className="inline-block px-3 py-1 rounded-md bg-blue-600 font-black text-xs uppercase tracking-widest text-white mb-2 shadow-md">
                {currentMarca.code}
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
                {currentMarca.nome}
              </h2>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 font-medium max-w-xl backdrop-blur-xs">
                {currentMarca.description}
              </p>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveMarca(currentMarca)}
                  className="px-6 py-3 bg-white hover:bg-blue-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition hover:scale-105 cursor-pointer"
                >
                  <span>Abrir Coleções de {currentMarca.nome}</span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>

            {/* 4. CARDS SUSPENSOS DAS MARCAS (FORMATO KB, KING&JOE, K&) */}
            <div className="relative z-10 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MOCK_MARCAS.map((m, idx) => {
                  const isSelected = idx === currentIndex;
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMarca(m, idx)}
                      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center gap-3 ${
                        isSelected
                          ? 'bg-white text-slate-950 border-white shadow-xl scale-[1.03]'
                          : 'bg-black/40 text-white border-white/20 hover:bg-black/60 hover:border-white/40'
                      }`}
                    >
                      {/* INICIAIS DA MARCA */}
                      <div className={`px-3 py-2.5 rounded-xl font-extrabold text-xs tracking-wider border shrink-0 ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-white/10 text-white border-white/20'
                      }`}>
                        {m.initials}
                      </div>

                      <div className="overflow-hidden">
                        <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                          {m.nome}
                        </h4>
                        <span className={`text-[11px] font-semibold block ${isSelected ? 'text-slate-500' : 'text-slate-300'}`}>
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
      )}

      {/* ABA DE PEÇAS / DASHBOARD / GRÁFICOS */}
      {subTab !== 'marcas' && (
        <div className="max-w-7xl mx-auto w-full p-8 text-center text-slate-500">
          <div className="p-12 rounded-3xl bg-white border border-slate-200 max-w-lg mx-auto">
            <FolderKanban className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">Visualização de {subTab}</h4>
            <p className="text-xs text-slate-500 mt-1">
              Filtro ativo para a marca <strong>{activeMarca?.nome}</strong>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
