/**
 * ============================================================================
 * MÓDULO: Página Inicial (Home)
 * ARQUIVO: src/pages/Home/HomePage.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe a interface principal da AKR BRANDS com o carrossel 3D Coverflow
 *            em tela cheia restrito às marcas do usuário ou a visão de coleções
 *            da marca selecionada. Apresenta empty state explícito se o usuário
 *            não possuir marcas vinculadas.
 * ============================================================================
 */

import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { normalizeId } from '../../services/contractMappers';
import type { MarcaSummary } from '../../types/auth';
import { BrandCollectionsView } from './components/BrandCollectionsView';
import { ColecoesDestaqueCarousel } from './components/ColecoesDestaqueCarousel';

export const HomePage: React.FC = () => {
  const { user, setActiveMarca } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Marcas estritamente restritas às permissões do usuário
  const userBrands = useMemo(() => {
    return Array.isArray(user?.marcas) ? user.marcas : [];
  }, [user]);

  const marcaIdFromUrl = searchParams.get('marca');
  const colecaoIdFromUrl = searchParams.get('colecao');

  // Reconstrói a marca selecionada a partir da URL com normalização de ID
  const selectedMarcaForView = useMemo(() => {
    if (!marcaIdFromUrl) return null;
    const normUrl = normalizeId(marcaIdFromUrl);
    return (
      userBrands.find(
        (m) =>
          normalizeId(m.id) === normUrl ||
          m.nome.trim().toLowerCase() === marcaIdFromUrl.trim().toLowerCase()
      ) ?? null
    );
  }, [marcaIdFromUrl, userBrands]);

  const handleSelectMarca = (marca: MarcaSummary) => {
    // Valida se a marca selecionada pertence ao escopo do usuário
    const normSelect = normalizeId(marca.id);
    const allowed = userBrands.find(
      (m) => normalizeId(m.id) === normSelect || m.nome.toLowerCase() === marca.nome.toLowerCase()
    );
    if (!allowed) return;

    setActiveMarca(allowed);
    setSearchParams({ marca: allowed.id });
  };

  const handleBackToHome = () => {
    setSearchParams({});
  };

  return (
    <div
      className={`w-full min-h-[calc(100vh-65px)] flex flex-col font-sans transition-colors duration-300 ${
        selectedMarcaForView ? 'bg-bg' : 'bg-[#0c0a09]'
      }`}
    >
      {userBrands.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center text-stone-300">
          <div className="max-w-md p-8 rounded-xl border border-stone-800 bg-stone-900/60 shadow-xl backdrop-blur-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-camel/20 flex items-center justify-center text-accent-camel">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Nenhuma Marca Vinculada</h2>
            <p className="text-sm text-stone-400 mb-6">
              Seu perfil de usuário não possui marcas autorizadas atribuídas no momento. Solicite
              permissão de acesso a um administrador da organização.
            </p>
            <div className="text-xs text-stone-500">
              Usuário: <span className="font-semibold text-stone-300">{user?.email || 'N/A'}</span>
            </div>
          </div>
        </div>
      ) : selectedMarcaForView ? (
        <div className="home-workspace animate-in fade-in duration-200 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full text-primary flex-1">
          <BrandCollectionsView
            marca={selectedMarcaForView}
            selectedColecaoId={colecaoIdFromUrl}
            onBack={handleBackToHome}
            onSelectMarca={handleSelectMarca}
            onSelectColecao={(colecao) =>
              setSearchParams({ marca: selectedMarcaForView.id, colecao: colecao.id })
            }
            onClearColecao={() => setSearchParams({ marca: selectedMarcaForView.id })}
          />
        </div>
      ) : (
        <div className="w-full bg-[#0c0a09] animate-in fade-in duration-300 flex-1 flex flex-col items-center justify-center">
          <ColecoesDestaqueCarousel
            onSelectMarca={(marca) => {
              handleSelectMarca(marca);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
