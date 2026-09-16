/**
 * ============================================================================
 * MÓDULO: Tipos e Interfaces do Domínio PLM (Peças, Coleções, Dashboard)
 * ARQUIVO: src/types/plm.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Define os contratos de dados para produtos (peças), coleções,
 *            filtros dinâmicos e métricas de dashboard/BI.
 * ============================================================================
 */

export interface PecaItem {
  id: string;
  colecaoId?: string;
  codigo: string;
  nome: string;
  tipo: string;
  status: 'Em andamento' | 'Completa' | 'A desenhar' | 'Cancelada';
  etapaAtual: string;
  tema: string;
  colecaoNome: string;
  marcaNome: string;
  estilista: string;
  modelista?: string;
  tecidos: string[];
  imagemCroquiUrl?: string;
  custo: number;
  preco: number;
  previsaoEntrega: string;
  diasAtraso?: number;
}

export interface ColecaoItem {
  id: string;
  marcaId?: string;
  codigoPill?: string;
  nome: string;
  marcaNome: string;
  status: 'Em andamento' | 'Completas' | 'Arquivadas';
  progressoPercent: number;
  pecasConcluidas: number;
  pecasTotal: number;
  concluidoEmDate?: string;
  dataEntrega: string;
  diasAtraso: number;
  ano?: string;
  temporada?: string;
  descricao?: string;
  imagemReferencia?: string;
}

export interface EtapaDashboardMetric {
  etapaNome: string;
  mediaMesAtual: string;
  mediaSemanaAtual: string;
  entradasSemana: number;
  saidasSemana: number;
  responsaveis: { id: string; iniciais: string; corBg: string }[];
  emDiaCount: number;
  entregaHojeCount: number;
  atrasadasCount: number;
}

export interface GraficoDimensaoMetric {
  rotulo: string;
  quantidade: number;
}

export interface NotificationItem {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'alerta' | 'sucesso' | 'urgente';
  data: string;
  lida: boolean;
  categoria?: string;
  link?: string;
}

export interface DashboardMetricDetail {
  mediaMes: string;
  mediaSemana: string;
  entradas: number;
  saidas: number;
  emDia: number;
  entregaHoje: number;
  atrasadas: number;
  responsaveis: string[];
}

export interface ProductFilters {
  searchTerm?: string;
  marca?: string;
  etapas?: string[];
  tipos?: string[];
  statusPeca?: string;
  statusColecao?: string;
  colecoes?: string[];
  estacoes?: string[];
  tecido?: string;
}
