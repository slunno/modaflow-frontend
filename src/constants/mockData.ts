/**
 * ============================================================================
 * MÓDULO: Dados Mock — Marcas AKR BRANDS
 * ARQUIVO: src/constants/mockData.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Constantes de mock separadas do AuthContext para respeitar a
 *            regra react-refresh/only-export-components e permitir HMR correto.
 * ============================================================================
 */

import type { MarcaSummary } from '../types/auth';

/**
 * Dados fictícios (Mock) das Marcas pertencentes ao Grupo AKR BRANDS.
 * Utilizado para testes de interface e apresentação do carrossel da home.
 */
export const MOCK_MARCAS: MarcaSummary[] = [
  {
    id: '1',
    nome: 'King & Joe',
    code: 'KJ',
    initials: 'KING&JOE',
    colecoesCount: 4,
    totalColecoes: 15,
    totalUsuarios: 16,
    pecasCount: 48,
    heroImageUrl:
      'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1600&auto=format&fit=crop',
    description:
      'Moda masculina contemporânea com foco em conforto, estilo casual sofisticado e alfaiataria desconstruída.',
    badgeTag: 'Linha Principal',
  },
  {
    id: '2',
    nome: 'K&J Black',
    code: 'KJB',
    initials: 'KB',
    colecoesCount: 2,
    totalColecoes: 12,
    totalUsuarios: 16,
    pecasCount: 24,
    heroImageUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
    description:
      'Coleção premium e sartorial. Peças exclusivas em tecidos nobres, blazers estruturados e linhas noitivas.',
    badgeTag: 'Linha Premium',
  },
  {
    id: '3',
    nome: 'King & Joe Play',
    code: 'KJP',
    initials: 'K&',
    colecoesCount: 3,
    totalColecoes: 13,
    totalUsuarios: 16,
    pecasCount: 32,
    heroImageUrl:
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1600&auto=format&fit=crop',
    description:
      'Estilo urbano, esportivo e jovem. Camisetas exclusivas, bermudas funcionais e moda casual dinâmica.',
    badgeTag: 'Linha Sportwear',
  },
];
