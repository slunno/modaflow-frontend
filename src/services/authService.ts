/**
 * ============================================================================
 * SERVIÇO: AuthService
 * ARQUIVO: src/services/authService.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Funções de chamada à API de autenticação e usuários do backend Spring Boot.
 * ============================================================================
 */

import { api } from './api';
import type { MarcaSummary } from '../types/auth';

/** Shape do response de login vinda do backend */
interface AuthApiResponse {
  token: string;
  type: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    empresa: string | null;
    cargo: string | null;
    avatarUrl: string | null;
    ativo: boolean;
    marcasPermitidas: MarcaSummary[];
  };
}

export interface LoginResult {
  token: string;
  usuario: AuthApiResponse['usuario'];
}

export interface RegisterUserPayload {
  nome: string;
  email: string;
  senha: string;
  cargo?: string;
  empresa?: string;
}

export interface BackendUserDTO {
  id: number;
  nome: string;
  email: string;
  empresa: string | null;
  cargo: string | null;
  ativo: boolean;
}

/**
 * Realiza login na API real do backend e retorna token JWT + dados do usuário.
 */
export async function loginApi(email: string, senha: string): Promise<LoginResult> {
  const response = await api.post<AuthApiResponse>('/auth/login', { email, senha });
  return {
    token: response.token,
    usuario: response.usuario,
  };
}

/**
 * Cadastra um novo usuário no backend em memória com Hash BCrypt.
 */
export async function registerUserApi(payload: RegisterUserPayload): Promise<BackendUserDTO> {
  return await api.post<BackendUserDTO>('/usuarios', payload);
}

/**
 * Busca a lista de usuários cadastrados no backend.
 */
export async function getUsuariosApi(): Promise<BackendUserDTO[]> {
  return await api.get<BackendUserDTO[]>('/usuarios');
}
