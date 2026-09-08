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

export interface TecidoInsumoItem {
  id: string;
  nome: string;
  codigo: string;
  temErp: boolean;
  imagemUrl?: string;
  fornecedores: string;
  custo: string;
  unidade: 'M' | 'Kg' | 'Metros' | 'Unidade';
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
