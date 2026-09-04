/**
 * ============================================================================
 * MÓDULO: Autenticação & Multi-Tenant (Tipos TypeScript)
 * ARQUIVO: src/types/auth.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Define as interfaces e tipos fundamentais para gerenciamento de
 *            usuários, autenticação e marcas (tenants) da AKR BRANDS.
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - Ao adicionar novos perfis ou atributos de marca/usuário, certifique-se de
 *   documentar cada campo com comentários JSDoc e atualizar as mocks correspondentes.
 * ============================================================================
 */

/**
 * Representa o resumo de uma Marca (Tenant) vinculada à organização AKR BRANDS.
 * Ex: King & Joe, K&J Black, King & Joe Play.
 */
export interface MarcaSummary {
  /** Identificador único da marca */
  id: string;
  /** Nome de exibição da marca */
  nome: string;
  /** Código de referência curto (ex: 'KJ', 'KJB') */
  code: string;
  /** Iniciais para ícone em botões (ex: 'KING&JOE', 'KB') */
  initials: string;
  /** Quantidade total de coleções vinculadas a esta marca */
  colecoesCount: number;
  /** Quantidade total de peças em desenvolvimento */
  pecasCount: number;
  /** URL da imagem editorial de fundo do carrossel da home */
  heroImageUrl: string;
  /** URL opcional do logotipo da marca */
  logoUrl?: string;
  /** Quantidade de usuários associados */
  totalUsuarios?: number;
  /** Alias para total de coleções */
  totalColecoes?: number;
  /** Descrição resumida do conceito da marca */
  description: string;
  /** Tag de classificação (ex: 'Linha Principal', 'Linha Premium') */
  badgeTag: string;
}

/**
 * Representa um usuário autenticado na plataforma AKR BRANDS.
 */
export interface User {
  /** Identificador único do usuário */
  id: string;
  /** Nome completo do funcionário */
  nome: string;
  /** E-mail corporativo utilizado no acesso */
  email: string;
  /** Nome da organização corporativa (ex: 'AKR BRANDS') */
  empresa: string;
  /** Cargo do funcionário dentro do fluxo de confecção */
  cargo: 'Estilista' | 'Modelista' | 'Gerente de Produção' | 'Administrador' | 'Engenharia';
  /** URL opcional da foto de perfil */
  avatarUrl?: string;
  /** Lista de marcas às quais o usuário tem permissão de acesso */
  marcas: MarcaSummary[];
}

/**
 * Contrato de dados e métodos expostos pelo Contexto de Autenticação (AuthContext).
 */
export interface AuthContextType {
  /** Dados do usuário atualmente logado ou null caso deslogado */
  user: User | null;
  /** Flag indicando se existe uma sessão ativa */
  isAuthenticated: boolean;
  /** Marca (tenant) atualmente selecionada no contexto do sistema */
  activeMarca: MarcaSummary | null;
  /** Método de autenticação por e-mail e senha */
  login: (email: string, pass: string) => Promise<boolean>;
  /** Método para encerrar a sessão ativa */
  logout: () => void;
  /** Método para alterar a marca ativa no contexto global */
  setActiveMarca: (marca: MarcaSummary) => void;
}
