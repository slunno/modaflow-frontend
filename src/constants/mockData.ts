/**
 * ============================================================================
 * MÓDULO: Dados Mock — Marcas, Peças, Coleções & Notificações AKR BRANDS
 * ARQUIVO: src/constants/mockData.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Centraliza dados de fallback e demonstração para ambiente de desenvolvimento.
 * ============================================================================
 */

import type { MarcaSummary } from '../types/auth';
import type { NotificationItem, DashboardMetricDetail, GraficoDimensaoMetric } from '../types/plm';

/**
 * Dados fictícios (Mock) das Marcas pertencentes ao Grupo AKR BRANDS.
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

/** Mock de Notificações do Portal Coleção Moda */
export const MOCK_NOTIFICACOES: NotificationItem[] = [
  {
    id: 'notif-1',
    titulo: 'Nova ficha técnica enviada para aprovação',
    mensagem: 'A peça TE05003J (Calça Linho Misto) avançou para a etapa 05 checagem de mp linx.',
    tipo: 'alerta',
    data: 'Hoje, às 10:45',
    lida: false,
    categoria: 'Ficha Técnica',
    link: '/products',
  },
  {
    id: 'notif-2',
    titulo: 'Meta de produção atingida na modelagem',
    mensagem: '12 peças da coleção K&J Black concluíram a etapa 03 modelagem dentro do cronograma.',
    tipo: 'sucesso',
    data: 'Ontem, às 17:20',
    lida: false,
    categoria: 'Produção',
    link: '/dashboard',
  },
  {
    id: 'notif-3',
    titulo: 'Atualização no percurso da coleção',
    mensagem: 'O cronograma da coleção TESTES VERÃO 28 foi atualizado por Mariana Barbosa.',
    tipo: 'info',
    data: '14 de Setembro, às 14:10',
    lida: true,
    categoria: 'Coleções',
    link: '/products',
  },
  {
    id: 'notif-4',
    titulo: 'Alerta de prazo: Pilotagem/Costura',
    mensagem: 'A peça TE15003K possui previsão de entrega para os próximos 3 dias.',
    tipo: 'urgente',
    data: '12 de Setembro, às 09:00',
    lida: true,
    categoria: 'Prazos',
    link: '/products',
  },
];

/** Mapeamento de métricas dinâmicas por Etapa para a Visão Geral */
export const MOCK_ETAPAS_METRICS: Record<string, DashboardMetricDetail> = {
  '01 geração de ficha': {
    mediaMes: '1 dia e 13 horas',
    mediaSemana: '1 hora',
    entradas: 59,
    saidas: 55,
    emDia: 3,
    entregaHoje: 2,
    atrasadas: 0,
    responsaveis: ['F', 'IB'],
  },
  '02 engenharia recebimento': {
    mediaMes: '2 dias e 4 horas',
    mediaSemana: '5 horas',
    entradas: 42,
    saidas: 38,
    emDia: 7,
    entregaHoje: 3,
    atrasadas: 1,
    responsaveis: ['MB', 'J'],
  },
  '03 modelagem': {
    mediaMes: '3 dias e 12 horas',
    mediaSemana: '8 horas',
    entradas: 68,
    saidas: 60,
    emDia: 12,
    entregaHoje: 0,
    atrasadas: 0,
    responsaveis: ['J', 'CE'],
  },
  '07 estoque de tecidos matriz': {
    mediaMes: '1 dia',
    mediaSemana: '2 horas',
    entradas: 30,
    saidas: 28,
    emDia: 6,
    entregaHoje: 1,
    atrasadas: 0,
    responsaveis: ['F'],
  },
  '10 corte': {
    mediaMes: '2 dias',
    mediaSemana: '4 horas',
    entradas: 45,
    saidas: 41,
    emDia: 5,
    entregaHoje: 2,
    atrasadas: 0,
    responsaveis: ['AKR'],
  },
  '11 estamparia': {
    mediaMes: '4 dias',
    mediaSemana: '12 horas',
    entradas: 22,
    saidas: 18,
    emDia: 3,
    entregaHoje: 1,
    atrasadas: 2,
    responsaveis: ['MB'],
  },
  '14 pilotagem/costura': {
    mediaMes: '3 dias e 6 horas',
    mediaSemana: '6 horas',
    entradas: 36,
    saidas: 32,
    emDia: 4,
    entregaHoje: 1,
    atrasadas: 0,
    responsaveis: ['J'],
  },
  '16 lavanderia': {
    mediaMes: '2 dias e 8 horas',
    mediaSemana: '3 horas',
    entradas: 19,
    saidas: 15,
    emDia: 2,
    entregaHoje: 0,
    atrasadas: 1,
    responsaveis: ['CE'],
  },
  'integração linx': {
    mediaMes: '12 horas',
    mediaSemana: '45 minutos',
    entradas: 80,
    saidas: 78,
    emDia: 4,
    entregaHoje: 0,
    atrasadas: 0,
    responsaveis: ['AKR'],
  },
};

/** Dados de BI para agrupamento */
export const MOCK_BI_DATA: Record<string, GraficoDimensaoMetric[]> = {
  Marca: [
    { rotulo: 'King & Joe', quantidade: 1654 },
    { rotulo: 'King & Joe Play', quantidade: 1195 },
    { rotulo: 'K&J Black', quantidade: 938 },
  ],
  Criador: [
    { rotulo: 'Mariana Barbosa', quantidade: 1127 },
    { rotulo: 'Ivonete Barbosa', quantidade: 876 },
    { rotulo: 'Fabiano', quantidade: 750 },
    { rotulo: 'Beatris Sgarioni', quantidade: 507 },
    { rotulo: 'Suporte', quantidade: 427 },
    { rotulo: 'Milena', quantidade: 56 },
  ],
  Campo: [
    { rotulo: 'Mariana Barbosa', quantidade: 1127 },
    { rotulo: 'Ivonete Barbosa', quantidade: 876 },
    { rotulo: 'Fabiano', quantidade: 750 },
  ],
  Estilista: [
    { rotulo: 'Mariana Barbosa', quantidade: 1704 },
    { rotulo: 'Ivonete Barbosa', quantidade: 1208 },
    { rotulo: 'Beatris Sgarioni', quantidade: 564 },
    { rotulo: 'Suporte', quantidade: 1 },
  ],
  Time: [
    { rotulo: 'Mariana Barbosa', quantidade: 1704 },
    { rotulo: 'Ivonete Barbosa', quantidade: 1208 },
  ],
  Fornecedor: [{ rotulo: 'Interno', quantidade: 2 }],
  Tipo: [
    { rotulo: 'Camisa', quantidade: 1250 },
    { rotulo: 'Calça', quantidade: 980 },
    { rotulo: 'Polo', quantidade: 840 },
    { rotulo: 'Bermuda', quantidade: 720 },
    { rotulo: 'Jaqueta', quantidade: 410 },
  ],
  Tag: [
    { rotulo: 'Camiseta', quantidade: 973 },
    { rotulo: 'Calça', quantidade: 789 },
    { rotulo: 'Camisa', quantidade: 483 },
    { rotulo: 'Bermuda', quantidade: 321 },
    { rotulo: 'Polo', quantidade: 257 },
    { rotulo: 'Short', quantidade: 219 },
    { rotulo: 'Conjunto', quantidade: 213 },
  ],
};
