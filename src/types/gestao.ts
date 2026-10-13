/**
 * ============================================================================
 * MÓDULO: Tipagem Centralizada de Gestão (Gestão & Cadastros Base)
 * ARQUIVO: src/types/gestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Centraliza todas as interfaces, tipos e constantes do módulo de Gestão.
 * ============================================================================
 */

import type { MarcaSummary } from './auth';

export type GestaoSubTab =
  | 'marcas'
  | 'usuarios'
  | 'times'
  | 'tecidos'
  | 'aviamentos'
  | 'caracteristicas'
  | 'custos_fixos'
  | 'precificacao'
  | 'tipos_peca'
  | 'fornecedores'
  | 'tags'
  | 'fluxos'
  | 'campos_custom';

export const CARGOS_OPCOES = [
  'Nenhum',
  'Administrador',
  'Assistente',
  'Coordenador',
  'Observador',
  'Estilista',
] as const;

export interface UserBrandRole {
  marcaId: string;
  marcaNome: string;
  logoUrl?: string;
  cargo: string;
  times: string[];
}

export interface UserRecord {
  id: string;
  email: string;
  nome: string;
  codigo?: string;
  marcas: string[];
  status: 'Ativo' | 'Inativo';
  acesso: 'Permitido' | 'Bloqueado';
  isFantasma?: boolean;
  brandRoles: UserBrandRole[];
}

export interface TeamItem {
  id: string;
  nome: string;
  descricao?: string;
  designadoProduto: boolean;
}

export interface TecidoFornecedorItem {
  id: string;
  fornecedor: string;
  codigo: string;
  /** Identifica seleções do catálogo vinculado, para não reaproveitar outro material. */
  materialLinxCodigo?: string;
}

export interface TecidoComposicaoItem {
  id: string;
  porcentagem: string | number;
  composicao: string;
}

export interface TecidoCorItem {
  id: string;
  nome: string;
  /** Catálogo de mostruário consultado; cores personalizadas continuam exclusivas do portal. */
  origemMostruario?: 'linx' | 'portal';
  codigo?: string;
  hex: string;
  pantone?: string;
  fornecedoresList?: TecidoFornecedorItem[];
  /** Vínculo exato quando esta cor pertence ao cadastro do material no Linx. */
  origemLinx?: InsumoCorLinx;
  /** Valores independentes desta cor na ficha, preservados mesmo com o menu fechado. */
  dadosInsumo?: InsumoInformacoesCor;
}

export interface InsumoInformacoesCor {
  custo: string;
  unidade: string;
  consumo?: string;
  peso?: string;
  quantidade?: string;
  observacoes?: string;
  fornecedorCodigo?: string;
  fornecedorNome?: string;
  precoLinx?: InsumoPrecoLinx;
  /** Impede que uma consulta ou reabertura substitua uma correção do usuário. */
  precoManual?: boolean;
}

export interface InsumoCorLinx {
  materialCodigo: string;
  corCodigo: string;
  corNome: string;
}

export interface InsumoPrecoLinx {
  materialCodigo: string;
  corCodigo?: string;
  fornecedorCodigo?: string;
  fonte:
    | 'MATERIAIS.CUSTO_A_VISTA'
    | 'MATERIAIS.CUSTO_REPOSICAO'
    | 'MATERIAIS_CORES.CUSTO_A_VISTA'
    | 'MATERIAIS_CORES.CUSTO_REPOSICAO'
    | 'MATERIAIS_FORNECEDOR.CUSTO_REPOSICAO';
  valor: string;
  unidade: string;
  fatorConversaoFornecedor?: number | string | null;
}

export interface TecidoPropriedades {
  gramatura: string;
  largura: string;
  rendimento1: string;
  rendimento2: string;
  encolhimento: string;
  construcao: string;
  /** Cor exata usada para preencher gramatura e encolhimento do Linx. */
  origemLinx?: InsumoCorLinx;
}

export interface TecidoInsumoItem {
  id: string;
  nome: string;
  codigo: string;
  temErp: boolean;
  imagemUrl?: string;
  fornecedores: string;
  custo: string;
  consumo?: string;
  peso?: string;
  quantidade?: string;
  /** Preserva também a unidade original do ERP, sem conversões implícitas. */
  unidade: string;
  fornecedoresList?: TecidoFornecedorItem[];
  imagensList?: string[];
  composicoesList?: TecidoComposicaoItem[];
  coresList?: TecidoCorItem[];
  /** Cor cujos valores estão em edição no formulário de insumo. */
  corEmEdicaoId?: string;
  /** Cor selecionada do cadastro Linx, tanto para tecidos quanto para aviamentos. */
  corLinx?: InsumoCorLinx;
  /** Referência do valor escolhido explicitamente. Ausente quando o preço é manual. */
  precoLinx?: InsumoPrecoLinx;
  propriedades?: TecidoPropriedades;
  observacoes?: string;
}

export interface CaracteristicaItem {
  id: string;
  nome: string;
  marcaNome: string;
  opcoesCount: number;
}

export interface GestaoPageProps {
  onOpenColecoes: (marca: MarcaSummary) => void;
}

export const INITIAL_TEAMS: TeamItem[] = [
  { id: 't-1', nome: 'Administrador', descricao: '--', designadoProduto: false },
  { id: 't-2', nome: 'Assistente', descricao: '--', designadoProduto: false },
  { id: 't-3', nome: 'Coordenador', descricao: '--', designadoProduto: false },
  { id: 't-4', nome: 'Espectador', descricao: '--', designadoProduto: false },
  { id: 't-5', nome: 'Estilista', descricao: '--', designadoProduto: false },
  { id: 't-6', nome: 'Modelista', descricao: '--', designadoProduto: false },
];

export const INITIAL_TECIDOS_DATA: TecidoInsumoItem[] = [];
export const INITIAL_USERS_DATA: UserRecord[] = [];
export const INITIAL_AVIAMENTOS_DATA: TecidoInsumoItem[] = [];
export const INITIAL_CARACTERISTICAS_DATA: CaracteristicaItem[] = [];
