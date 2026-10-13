/**
 * ============================================================================
 * COMPONENTE WRAPPER: Carrossel 3D de Marcas da AKR BRANDS
 * ARQUIVO: src/pages/Home/components/ColecoesDestaqueCarousel.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o CoverFlowCarousel 3D e exibe exclusivamente as marcas
 *            permitidas do usuário autenticado (user.marcas). Sem fallbacks mock.
 * ============================================================================
 */

import React, { useMemo } from 'react';
import { CoverFlowCarousel, type CarouselItem } from '@/components/ui/3-d-coverflow-carousel';
import type { MarcaSummary } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';

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

  const userBrands = useMemo(() => {
    return Array.isArray(user?.marcas) ? user.marcas : [];
  }, [user]);

  const carouselItems: MarcaCarouselItem[] = useMemo(() => {
    return userBrands.map((m) => ({
      titleLine1: m.nome.toUpperCase(),
      img:
        m.heroImageUrl ||
        'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1600&auto=format&fit=crop',
      ctaText: 'ABRIR COLEÇÕES',
      ctaUrl: '#',
      marcaObj: m,
    }));
  }, [userBrands]);

  const handleCtaClick = (item: CarouselItem) => {
    const matched = carouselItems.find((m) => m.titleLine1 === item.titleLine1);
    if (onSelectMarca && matched) {
      onSelectMarca(matched.marcaObj);
    } else if (onSelectMarca && userBrands[0]) {
      onSelectMarca(userBrands[0]);
    }
  };

  if (carouselItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-[#0c0a09]">
      <CoverFlowCarousel
        items={carouselItems}
        sectionLabel="MARCAS DA ORGANIZAÇÃO — AKR BRANDS"
        autoplay={carouselItems.length > 1}
        autoplayDelay={6000}
        onCtaClick={handleCtaClick}
      />
    </div>
  );
};
