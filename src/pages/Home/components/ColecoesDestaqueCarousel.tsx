/**
 * ============================================================================
 * COMPONENTE WRAPPER: Carrossel 3D de Coleções em Destaque
 * ARQUIVO: src/pages/Home/components/ColecoesDestaqueCarousel.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o componente de UI reutilizável CoverFlowCarousel e
 *            injeta os dados reais das coleções e marcas da AKR BRANDS.
 * ============================================================================
 */

import React from 'react';
import { CoverFlowCarousel, type CarouselItem } from '@/components/ui/3-d-coverflow-carousel';

interface ColecoesDestaqueCarouselProps {
  onSelectColecao?: (colecaoTitle: string) => void;
}

/** Dados Reais de Domínio do ModaFlow PLM — AKR BRANDS */
const COLECOES_PLM_ITEMS: CarouselItem[] = [
  {
    tag: '#LinhaPrincipal',
    titleLine1: 'VERÃO 2028',
    titleLine2: '– KING & JOE',
    desc: 'Alfaiataria desconstruída, linho puro e tons terracota contemporâneos.',
    img: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Explorar Coleção',
    ctaUrl: '#',
  },
  {
    tag: '#LinhaPremium',
    titleLine1: 'INVERNO 2027',
    titleLine2: '– K&J BLACK',
    desc: 'Peças sartoriais em tecidos nobres, blazers estruturados e alfaiataria noitiva.',
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Explorar Coleção',
    ctaUrl: '#',
  },
  {
    tag: '#Sportwear',
    titleLine1: 'ALTO VERÃO 26',
    titleLine2: '– KING & JOE PLAY',
    desc: 'Estilo urbano dinâmico, bermudas aquáticas e camisetas de toque macio.',
    img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Explorar Coleção',
    ctaUrl: '#',
  },
  {
    tag: '#PreviewInverno',
    titleLine1: 'PREVIEW 2028',
    titleLine2: '– URBAN HERITAGE',
    desc: 'Tricots texturizados, overshirts em sarja pesada e paleta militar minimalista.',
    img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Explorar Coleção',
    ctaUrl: '#',
  },
  {
    tag: '#EdicaoLimitada',
    titleLine1: 'CÁPSULA ATEMPORAL',
    titleLine2: '– AKR SELECTION',
    desc: 'Edição limitada em algodão egípcio orgânico com tingimento artesanal.',
    img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'Explorar Coleção',
    ctaUrl: '#',
  },
];

export const ColecoesDestaqueCarousel: React.FC<ColecoesDestaqueCarouselProps> = ({
  onSelectColecao,
}) => {
  const handleCtaClick = (item: CarouselItem) => {
    if (onSelectColecao) {
      onSelectColecao(`${item.titleLine1} ${item.titleLine2 ?? ''}`);
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl my-6 border border-border/40">
      <CoverFlowCarousel
        items={COLECOES_PLM_ITEMS}
        sectionLabel="COLEÇÕES EM DESTAQUE — AKR BRANDS"
        autoplay={true}
        autoplayDelay={6000}
        onCtaClick={handleCtaClick}
      />
    </div>
  );
};
