/**
 * ============================================================================
 * COMPONENTE WRAPPER: Carrossel 3D de Marcas da AKR BRANDS
 * ARQUIVO: src/pages/Home/components/ColecoesDestaqueCarousel.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o CoverFlowCarousel 3D e exibe as marcas da King & Joe / AKR BRANDS
 *            em tela cheia com fundo escuro ambiente e navegação direta para coleções.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CoverFlowCarousel, type CarouselItem } from '@/components/ui/3-d-coverflow-carousel';
import type { MarcaSummary } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import { getBrands } from '@/services/plmService';
import { MOCK_MARCAS } from '@/constants/mockData';

interface ColecoesDestaqueCarouselProps {
  onSelectMarca?: (marca: MarcaSummary) => void;
}

interface MarcaCarouselItem extends CarouselItem {
  marcaObj: MarcaSummary;
}

export const ColecoesDestaqueCarousel: React.FC<ColecoesDestaqueCarouselProps> = ({
  onSelectMarca,
}) => {
  const { user } = useAuth();
  const [marcasList, setMarcasList] = useState<MarcaSummary[]>([]);

  useEffect(() => {
    let isMounted = true;
    getBrands()
      .then((brandsData) => {
        if (isMounted && brandsData.length > 0) {
          setMarcasList(brandsData);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveBrands = useMemo(() => {
    if (marcasList.length > 0) return marcasList;
    if (user?.marcas && user.marcas.length > 0) return user.marcas;
    return MOCK_MARCAS;
  }, [marcasList, user]);

  const carouselItems: MarcaCarouselItem[] = useMemo(() => {
    return effectiveBrands.map((m) => ({
      titleLine1: m.nome.toUpperCase(),
      img:
        m.heroImageUrl ||
        'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1600&auto=format&fit=crop',
      ctaText: 'ABRIR COLEÇÕES',
      ctaUrl: '#',
      marcaObj: m,
    }));
  }, [effectiveBrands]);

  const handleCtaClick = (item: CarouselItem) => {
    const matched = carouselItems.find((m) => m.titleLine1 === item.titleLine1);
    if (onSelectMarca && matched) {
      onSelectMarca(matched.marcaObj);
    } else if (onSelectMarca && effectiveBrands[0]) {
      onSelectMarca(effectiveBrands[0]);
    }
  };

  if (carouselItems.length === 0) return null;

  return (
    <div className="w-full bg-[#0c0a09]">
      <CoverFlowCarousel
        items={carouselItems}
        sectionLabel="MARCAS DA ORGANIZAÇÃO — AKR BRANDS"
        autoplay={true}
        autoplayDelay={6000}
        onCtaClick={handleCtaClick}
      />
    </div>
  );
};
