/**
 * ============================================================================
 * MÓDULO: Página Inicial (Home)
 * ARQUIVO: src/pages/Home/HomePage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe a interface principal da AKR BRANDS com o carrossel 3D Coverflow
 *            em tela cheia ou a visão dedicada de coleções da marca selecionada.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getBrands } from '../../services/plmService';
import type { MarcaSummary } from '../../types/auth';
import { BrandCollectionsView } from './components/BrandCollectionsView';
import { ColecoesDestaqueCarousel } from './components/ColecoesDestaqueCarousel';

export const HomePage: React.FC = () => {
  const { user, setActiveMarca } = useAuth();
  const [allBrands, setAllBrands] = useState<MarcaSummary[]>([]);

  // Marca selecionada recuperada do localStorage
  const [selectedMarcaForView, setSelectedMarcaForView] = useState<MarcaSummary | null>(() => {
    const savedMarcaRaw = localStorage.getItem('modaflow_active_marca');
    if (savedMarcaRaw) {
      try {
        return JSON.parse(savedMarcaRaw) as MarcaSummary;
      } catch {
        // Ignora
      }
    }
    return null;
  });

  useEffect(() => {
    let isMounted = true;
    getBrands()
      .then((data) => {
        if (isMounted) setAllBrands(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

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
      setSelectedMarcaForView(null);
      localStorage.removeItem('modaflow_selected_marca_id');
      localStorage.removeItem('modaflow_selected_colecao_id');
    };

    const handleOpenMarca = (e: Event) => {
      const customEvt = e as CustomEvent;
      const marcaId = customEvt.detail;
      const available = [...(user?.marcas || []), ...allBrands];
      const found = available.find((m) => m.id === marcaId || m.nome === marcaId);
      if (found) {
        setSelectedMarcaForView(found);
      }
    };

    window.addEventListener('modaflow_reset_to_home', handleReset);
    window.addEventListener('modaflow_open_marca_colecoes', handleOpenMarca);
    return () => {
      window.removeEventListener('modaflow_reset_to_home', handleReset);
      window.removeEventListener('modaflow_open_marca_colecoes', handleOpenMarca);
    };
  }, [user, allBrands]);

  return (
    <div
      className={`w-full min-h-[calc(100vh-65px)] flex flex-col font-sans transition-colors duration-300 ${
        selectedMarcaForView ? 'bg-bg' : 'bg-[#0c0a09]'
      }`}
    >
      {selectedMarcaForView ? (
        <div className="animate-in fade-in duration-200 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full text-primary flex-1">
          <BrandCollectionsView
            marca={selectedMarcaForView}
            onBack={() => setSelectedMarcaForView(null)}
            onSelectMarca={(m) => setSelectedMarcaForView(m)}
          />
        </div>
      ) : (
        <div className="w-full bg-[#0c0a09] animate-in fade-in duration-300 flex-1 flex flex-col items-center justify-center">
          <ColecoesDestaqueCarousel
            onSelectMarca={(marca) => {
              setActiveMarca(marca);
              setSelectedMarcaForView(marca);
            }}
          />
        </div>
      )}
    </div>
  );
};
