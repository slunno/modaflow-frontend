/**
 * ============================================================================
 * MÓDULO: Tipos e Interfaces do Domínio PLM (Peças, Coleções, Dashboard)
 * ARQUIVO: src/types/plm.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Define os contratos de dados para produtos (peças), coleções,
 *            filtros dinâmicos e métricas de dashboard/BI.
 * ----------------------------------------------------------------------------
 * PADRÃO DE EXTENSÃO:
 * - Utilize estas interfaces para tipar as respostas JSON do backend em Java
 *   Spring Boot quando a integração via API REST for ativada.
 * ============================================================================
 */

export interface PecaItem {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'Calça' | 'Camisa' | 'Polo' | 'Bermuda' | 'Jaqueta' | 'Blazer' | 'Acessórios';
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
  nome: string;
  marcaNome: string;
  status: 'Em andamento' | 'Completas' | 'Arquivadas';
  progressoPercent: number;
  pecasConcluidas: number;
  pecasTotal: number;
  concluidoEmDate?: string;
  dataEntrega: string;
  diasAtraso: number;
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
