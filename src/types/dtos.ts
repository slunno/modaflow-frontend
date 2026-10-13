/**
 * ============================================================================
 * MÓDULO: DTOs de Rede (Contratos do Backend Spring Boot)
 * ARQUIVO: src/types/dtos.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Define os tipos exatos retornados e aceitos pelos endpoints REST
 *            do backend modaflow-backend, separando o modelo de transporte
 *            dos modelos de apresentação (UI).
 * ============================================================================
 */

// ── ENUMS DO BACKEND ──

export type StatusPecaEnum =
  'A_DESENHAR' | 'COMPLETA' | 'EM_DESENVOLVIMENTO' | 'APROVADO' | 'CANCELADO' | 'EM_PRODUCAO';

export type EtapaPecaEnum =
  | 'GERACAO_FICHA'
  | 'ENGENHARIA_RECEBIMENTO'
  | 'MODELAGEM'
  | 'MINI_RISCO_CONSUMO'
  | 'CHECAGEM_MP_LINX'
  | 'AGUARDANDO_TECIDO_FORNECEDOR'
  | 'ESTOQUE_TECIDOS_MATRIZ'
  | 'REVISAO_INTEGRACAO_GERACAO_OP'
  | 'ENCAIXE_RISCO'
  | 'CORTE'
  | 'ESTAMPARIA'
  | 'BORDADO'
  | 'ESTOQUE_AVIAMENTOS'
  | 'CD_LAVANDERIA'
  | 'LAVANDERIA'
  | 'ACABAMENTO'
  | 'PRE_CUSTO_SEQUENCIA_OPERACIONAL'
  | 'APROVACAO_PILOTO_CM'
  | 'FINAL'
  | 'INICIAL'
  | 'INTEGRACAO_LINX'
  | 'REVISAR_FICHA_TECNICA_LIBERAR_MOSTRUARIO'
  | 'BRIEFING'
  | 'DESENHO_TECNICO'
  | 'APROVACAO_ESTILO'
  | 'CAD_MODELAGEM'
  | 'PILOTAGEM_CORTE'
  | 'PILOTAGEM_COSTURA'
  | 'PROVA_ROUPA_1'
  | 'AJUSTE_MODELAGEM'
  | 'PROVA_ROUPA_2'
  | 'APROVACAO_PILOTO'
  | 'FICHA_TECNICA_FINAL'
  | 'PRECO_CUSTO'
  | 'COMPRA_INSUMOS'
  | 'RECEBIMENTO_TECIDO'
  | 'CORTE_PRODUCAO'
  | 'BORDADO_ESTAMPA'
  | 'COSTURA_PRODUCAO'
  | 'PASSADORIA'
  | 'REVISAO_QUALIDADE'
  | 'EMBALAGEM'
  | 'LOGISTICA'
  | 'EXPEDICAO_LOJAS'
  | 'DISPONIVEL_VENDA';

export type StatusColecaoEnum = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ARQUIVADO';

export type TipoInsumoEnum = 'TECIDO' | 'AVIAMENTO';

// ── DTOs DE AUTENTICAÇÃO E USUÁRIOS ──

export interface MarcaResponseDTO {
  id: number;
  nome: string;
  code: string;
  initials?: string | null;
  heroImageUrl?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  badgeTag?: string | null;
  colecoesCount?: number;
  pecasCount?: number;
}

export interface UsuarioResponseDTO {
  id: number;
  nome: string;
  email: string;
  empresa?: string | null;
  cargo?: string | null;
  avatarUrl?: string | null;
  ativo?: boolean;
  marcasPermitidas?: MarcaResponseDTO[];
  brandRoles?: { marcaId: number; cargo: string }[];
}

export interface AuthResponseDTO {
  token: string;
  type: string;
  usuario: UsuarioResponseDTO;
}

export interface CriarUsuarioRequestDTO {
  nome: string;
  email: string;
  senha: string;
  empresa?: string;
  cargo?: string;
}

export interface AtualizarUsuarioRequestDTO {
  nome: string;
  empresa?: string;
  cargo?: string;
  brandRoles?: { marcaId: number; cargo: string }[];
}

// ── DTOs DE MARCA ──

export interface CriarMarcaRequestDTO {
  nome: string;
  code: string;
  initials?: string;
  heroImageUrl?: string;
  logoUrl?: string;
  description?: string;
  badgeTag?: string;
}

export interface AtualizarMarcaRequestDTO {
  nome?: string;
  code?: string;
  initials?: string;
  heroImageUrl?: string;
  logoUrl?: string;
  description?: string;
  badgeTag?: string;
}

// ── DTOs DE COLEÇÃO ──

export interface ColecaoResponseDTO {
  id: number;
  nome: string;
  status: StatusColecaoEnum;
  progressoPercent?: number;
  pecasConcluidas?: number;
  pecasTotal?: number;
  concluidoEmDate?: string | null;
  dataEntrega?: string | null;
  diasAtraso?: number;
}

export interface ColecaoDetalheResponseDTO extends ColecaoResponseDTO {
  pecas: PecaResponseDTO[];
}

export interface CriarColecaoRequestDTO {
  nome: string;
  status: StatusColecaoEnum;
  dataEntrega?: string | null;
}

export interface AtualizarColecaoRequestDTO {
  nome?: string;
  status?: StatusColecaoEnum;
  dataEntrega?: string | null;
}

// ── DTOs DE PEÇA ──

export interface PecaResponseDTO {
  id: number;
  codigo: string;
  nome: string;
  tipo?: string | null;
  status: StatusPecaEnum;
  etapaAtual: EtapaPecaEnum;
  tema?: string | null;
  estilista?: string | null;
  modelista?: string | null;
  imagemCroquiUrl?: string | null;
  custo?: number | null;
  preco?: number | null;
  previsaoEntrega?: string | null;
  diasAtraso?: number | null;
  colecaoId: number;
  colecaoNome?: string | null;
}

export interface CriarPecaRequestDTO {
  codigo: string;
  nome: string;
  tipo?: string;
  status: StatusPecaEnum;
  etapaAtual: EtapaPecaEnum;
  tema?: string;
  estilista?: string;
  modelista?: string;
  imagemCroquiUrl?: string;
  custo?: number;
  preco?: number;
  previsaoEntrega?: string;
  colecaoId: number;
}

export interface AtualizarPecaRequestDTO {
  nome?: string;
  tipo?: string;
  status?: StatusPecaEnum;
  tema?: string;
  estilista?: string;
  modelista?: string;
  imagemCroquiUrl?: string;
  custo?: number;
  preco?: number;
  previsaoEntrega?: string;
}

export interface PecaKanbanResponseDTO {
  id: number;
  codigo: string;
  nome: string;
  imagemCroquiUrl?: string | null;
  etapaAtual: EtapaPecaEnum;
  estilista?: string | null;
  diasAtraso?: number | null;
}

// ── DTOs DE DASHBOARD & BI ──

export interface DashboardMetricsResponseDTO {
  totalPecas: number;
  totalColecoes: number;
  pecasAtrasadas: number;
  pecasPorEtapa: Record<string, number>;
}

export interface GraficosBIResponseDTO {
  evolucaoProducaoMensal: Array<Record<string, unknown>>;
  distribuicaoCustoPorCategoria: Record<string, number>;
}

// ── DTOs DE INSUMO (TECIDOS E AVIAMENTOS) ──

export interface InsumoResponseDTO {
  id: number;
  nome: string;
  codigo: string;
  tipo: TipoInsumoEnum;
  custo?: number | null;
  unidadeMedida?: string | null;
  fornecedorNome?: string | null;
  temErp?: boolean;
  imagemUrl?: string | null;
  observacoes?: string | null;
}

export interface CriarInsumoRequestDTO {
  nome: string;
  codigo: string;
  tipo: TipoInsumoEnum;
  custo?: number;
  unidadeMedida?: string;
  fornecedorNome?: string;
  temErp?: boolean;
  imagemUrl?: string;
  observacoes?: string;
}

export interface AtualizarInsumoRequestDTO {
  nome?: string;
  codigo?: string;
  tipo?: TipoInsumoEnum;
  custo?: number;
  unidadeMedida?: string;
  fornecedorNome?: string;
  temErp?: boolean;
  imagemUrl?: string;
  observacoes?: string;
}

export interface PageResponseDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
