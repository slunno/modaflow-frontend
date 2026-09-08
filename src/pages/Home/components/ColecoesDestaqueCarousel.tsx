/**
 * ============================================================================
 * COMPONENTE WRAPPER: Carrossel 3D de Marcas da AKR BRANDS
 * ARQUIVO: src/pages/Home/components/ColecoesDestaqueCarousel.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o CoverFlowCarousel 3D e exibe as marcas da King & Joe / AKR BRANDS
 *            em tela cheia com fundo escuro ambiente e navegação direta para coleções.
 * ============================================================================
 */

import React from 'react';
import { CoverFlowCarousel, type CarouselItem } from '@/components/ui/3-d-coverflow-carousel';
import { MOCK_MARCAS } from '@/constants/mockData';
import type { MarcaSummary } from '@/types/auth';

interface ColecoesDestaqueCarouselProps {
  onSelectMarca?: (marca: MarcaSummary) => void;
}

interface MarcaCarouselItem extends CarouselItem {
  marcaObj: MarcaSummary;
}

/** Dados Reais das Marcas da AKR BRANDS / King & Joe (Apenas as 3 marcas oficiais) */
const MARCAS_PLM_ITEMS: MarcaCarouselItem[] = [
  {
    tag: '#LinhaPrincipal',
    titleLine1: 'KING & JOE',
    titleLine2: '– MAIN COLLECTION',
    desc: 'Moda masculina contemporânea com foco em conforto, estilo casual sofisticado e alfaiataria desconstruída.',
    img: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'ABRIR COLEÇÕES',
    ctaUrl: '#',
    marcaObj: MOCK_MARCAS[0]!,
  },
  {
    tag: '#LinhaPremium',
    titleLine1: 'K&J BLACK',
    titleLine2: '– SARTORIAL & NIGHT',
    desc: 'Coleção premium e sartorial. Peças exclusivas em tecidos nobres, blazers estruturados e alfaiataria noitiva.',
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'ABRIR COLEÇÕES',
    ctaUrl: '#',
    marcaObj: MOCK_MARCAS[1]!,
  },
  {
    tag: '#Sportwear',
    titleLine1: 'KING & JOE PLAY',
    titleLine2: '– URBAN & SPORT',
    desc: 'Estilo urbano, esportivo e jovem. Camisetas exclusivas, bermudas funcionais e moda casual dinâmica.',
    img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'ABRIR COLEÇÕES',
    ctaUrl: '#',
    marcaObj: MOCK_MARCAS[2]!,
  },
];

export const ColecoesDestaqueCarousel: React.FC<ColecoesDestaqueCarouselProps> = ({
  onSelectMarca,
}) => {
  const handleCtaClick = (item: CarouselItem) => {
    const matched = MARCAS_PLM_ITEMS.find((m) => m.titleLine1 === item.titleLine1);
    if (onSelectMarca && matched) {
      onSelectMarca(matched.marcaObj);
    } else if (onSelectMarca) {
      onSelectMarca(MOCK_MARCAS[0]!);
    }
  };

  return (
    <div className="w-full bg-[#0c0a09]">
      <CoverFlowCarousel
        items={MARCAS_PLM_ITEMS}
        sectionLabel="MARCAS DA ORGANIZAÇÃO — AKR BRANDS"
        autoplay={true}
        autoplayDelay={6000}
        onCtaClick={handleCtaClick}
      />
    </div>
  );
};
