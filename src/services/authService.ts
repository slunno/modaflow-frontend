/**
 * ============================================================================
 * SERVIÇO: AuthService
 * ARQUIVO: src/services/authService.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Funções de chamada à API de autenticação e usuários do backend Spring Boot.
 * ============================================================================
 */

import { api } from './api';
import type {
  AuthResponseDTO,
  UsuarioResponseDTO,
  CriarUsuarioRequestDTO,
  AtualizarUsuarioRequestDTO,
} from '../types/dtos';

export type LoginResult = AuthResponseDTO;
export type RegisterUserPayload = CriarUsuarioRequestDTO;
export type BackendUserDTO = UsuarioResponseDTO;

/**
 * Realiza login na API real do backend e retorna token JWT + dados do usuário.
 */
export async function loginApi(email: string, senha: string): Promise<LoginResult> {
  return await api.post<AuthResponseDTO>('/auth/login', { email, senha });
}

/**
 * Obtém os dados do usuário atualmente autenticado a partir do token.
 */
export async function getMeApi(): Promise<UsuarioResponseDTO> {
  return await api.get<UsuarioResponseDTO>('/auth/me');
}

/**
 * Cadastra um novo usuário no backend em memória com Hash BCrypt.
 * Requer autenticação (deve ser executado por um usuário com acesso à Gestão).
 */
export async function registerUserApi(
  payload: CriarUsuarioRequestDTO
): Promise<UsuarioResponseDTO> {
  return await api.post<UsuarioResponseDTO>('/usuarios', payload);
}

/**
 * Busca a lista de todos os usuários cadastrados no backend.
 */
export async function getUsuariosApi(): Promise<UsuarioResponseDTO[]> {
  return await api.get<UsuarioResponseDTO[]>('/usuarios');
}

/**
 * Atualiza dados de perfil de um usuário existente.
 */
export async function updateUsuarioApi(
  id: string | number,
  payload: AtualizarUsuarioRequestDTO
): Promise<UsuarioResponseDTO> {
  return await api.put<UsuarioResponseDTO>(`/usuarios/${id}`, payload);
}

/**
 * Ativa ou bloqueia o acesso de um usuário no backend.
 */
export async function toggleUserAccessApi(id: string | number, ativo: boolean): Promise<void> {
  await api.patch<void>(`/usuarios/${id}/acesso?ativo=${ativo}`, {});
}
