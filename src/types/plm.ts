/**
 * ============================================================================
 * MÓDULO: Tipos e Interfaces do Domínio PLM (Peças, Coleções, Dashboard)
 * ARQUIVO: src/types/plm.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Define os contratos de dados para produtos (peças), coleções,
 *            filtros dinâmicos e métricas de dashboard/BI.
 * ============================================================================
 */

import type {
  FichaVariante,
  FichaTerceiro,
  FichaProvaRoupa,
  FichaCorte,
  FichaTabelaMedidas,
} from './ficha';
import type { TecidoCorItem } from './gestao';
import type { LinxFichaResumo, LinxGriffe } from './linx';
import type { FichaHistoricoVersao, FichaAlteracaoEvento } from './fichaHistorico';
import type { FichaConferencia, FichaProcesso } from './fichaProcesso';
import type { LinxGradeDetalhe } from './fichaLinxMapeamento';
import type { LinxWriteIdentity, LinxWriteReceipt } from './linxGravacao';

export interface CollectionPrintItem {
  id: string;
  collectionId: string;
  image?: string;
  type: string;
  reference: string;
  notes: string;
  fabrics: { id: string; name: string; code: string }[];
}

export interface PecaItem {
  id: string;
  colecaoId?: string;
  marcaId?: string;
  codigo: string;
  nome: string;
  tipo: string;
  status:
    'Em andamento' | 'Completa' | 'A desenhar' | 'Cancelada' | 'Status não identificado' | string;
  etapaAtual: string;
  tema: string;
  colecaoNome: string;
  marcaNome: string;
  statusColecao?: string;
  estacao?: string;
  estilista: string;
  modelista?: string;
  tecidos: string[];
  aviamentos?: string[];
  /** Identidade oficial preservada mesmo se o código do rascunho for editado. */
  linxOrigem?: { codigoProduto: string; colecaoCodigo: string; griffe: LinxGriffe };
  /** Fonte de cópia, não propriedade da versão. Nunca autoriza atualizar a origem. */
  linxReferenciaCopia?: LinxWriteIdentity;
  linxFichaResumo?: LinxFichaResumo;
  linxCadastro?: { linha: string | null; grade: string | null; subgrupo: string | null };
  historicoIntegracoes?: FichaHistoricoVersao[];
  /** Confirmação parcial do gravador; não representa versão ou envio integral da ficha. */
  linxUltimaGravacao?: LinxWriteReceipt;
  historicoAlteracoes?: FichaAlteracaoEvento[];
  imagemCroquiUrl?: string;
  custo?: number;
  preco?: number;
  previsaoEntrega: string;
  /** Fluxo operacional interno selecionado para a peça. */
  fluxo?: string;
  /** Usuário responsável pela etapa atual, validado pelo cadastro de usuários. */
  responsavel?: string;
  responsavelId?: string;
  /** Registro livre da última movimentação de etapa. */
  observacaoEtapa?: string;
  diasAtraso?: number;
  fichaTecnica?: {
    conferencia?: FichaConferencia;
    processo?: FichaProcesso;
    linxVersaoImportada?: string;
    linxColecaoOrigem?: string | null;
    /** Snapshot local das posições reais, sem substituir a validação no servidor/ERP. */
    gradeLinx?: LinxGradeDetalhe;
    /** Metadados editados na aba Integração Linx, usados também nos cards e filtros. */
    integracao?: {
      subgrupo?: string;
      linha?: string;
      grade?: string;
      griffe?: string;
      tipoMateriaPrima?: string;
      categoria?: string;
      subcategoria?: string;
    };
    nomeProduto?: string;
    codigoReferencia?: string;
    variantes?: FichaVariante[];
    terceiros?: FichaTerceiro[];
    provaRoupa?: FichaProvaRoupa;
    descricao?: string;
    tamanhos?: string[];
    tecnica?: string;
    corMostruario?: string;
    coresMostruario?: TecidoCorItem[];
    estampa?: string;
    /** Estampa cadastrada no submenu da própria coleção. */
    estampaId?: string;
    corte?: FichaCorte;
    observacoesGerais?: string;
    observacoesCorte?: string;
    simbologiaImagemUrl?: string | null;
    simbologiaDescricao?: string;
    modelagem?: string;
    observacoesModelagem?: string;
    tabelasMedidas?: FichaTabelaMedidas[];
  };
}

export interface ColecaoItem {
  id: string;
  marcaId?: string;
  /** Identidade da marca no Linx, independente do nome exibido no portal. */
  griffe?: LinxGriffe;
  codigoPill?: string;
  nome: string;
  marcaNome: string;
  status:
    | 'Em andamento'
    | 'Completas'
    | 'Arquivadas'
    | 'Não categorizada'
    | 'Status não identificado'
    | string;
  progressoPercent?: number;
  pecasConcluidas?: number;
  pecasTotal?: number;
  concluidoEmDate?: string;
  dataEntrega: string;
  /** Diferença em dias entre hoje e a data de entrega (negativo quando vencida). */
  diasParaEntrega?: number;
  diasAtraso: number;
  ano?: string;
  temporada?: string;
  descricao?: string;
  imagemReferencia?: string;
  /** Só as novas coleções do portal iniciam a nova base de versões. */
  regraFicha?: 'legado' | 'integracao-colecao-v1';
  criadaEm?: string;
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
