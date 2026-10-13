/**
 * ============================================================================
 * HOOK: useUsuariosGestao
 * ARQUIVO: src/pages/Gestao/hooks/useUsuariosGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Usuários, sincronizando
 *            diretamente com a API REST do backend Spring Boot (/usuarios).
 *            Mudanças de status, bloqueio de acesso e perfil são persistidas no servidor.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserRecord } from '../../../types/gestao';
import {
  getUsuariosApi,
  toggleUserAccessApi,
  updateUsuarioApi,
  registerUserApi,
} from '../../../services/authService';
import { mapUsuarioDtoToRecord, normalizeId } from '../../../services/contractMappers';

export function useUsuariosGestao() {
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [userFilterMarca, setUserFilterMarca] = useState<string>('Todas');
  const [userFilterStatus, setUserFilterStatus] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');
  const [userFilterAcesso, setUserFilterAcesso] = useState<'Todos' | 'Permitido' | 'Bloqueado'>(
    'Todos'
  );
  const [searchUser, setSearchUser] = useState('');
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [editingUserProfile, setEditingUserProfile] = useState<UserRecord | null>(null);
  const [searchCargoQuery, setSearchCargoQuery] = useState('');
  const [filtrarCargosToggle, setFiltrarCargosToggle] = useState(false);

  /**
   * Carrega os usuários reais a partir do endpoint GET /usuarios
   */
  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const backendUsers = await getUsuariosApi();
      if (Array.isArray(backendUsers)) {
        setUsersList(backendUsers.map(mapUsuarioDtoToRecord));
      } else {
        setUsersList([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar usuários no backend.';
      setUsersError(msg);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Cadastra novo usuário na API e atualiza a lista após confirmação
   */
  const createUser = async (payload: {
    nome: string;
    email: string;
    senha: string;
    cargo?: string;
    empresa?: string;
  }): Promise<UserRecord> => {
    const createdDto = await registerUserApi(payload);
    const newRecord = mapUsuarioDtoToRecord(createdDto);
    setUsersList((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  /**
   * Atualiza dados de perfil do usuário no servidor (PUT /usuarios/{id})
   */
  const updateUser = async (user: UserRecord): Promise<void> => {
    const primaryCargo =
      user.brandRoles?.[0]?.cargo || (user.isFantasma ? 'Fantasma' : 'Estilista');
    const updatedDto = await updateUsuarioApi(user.id, {
      nome: user.nome,
      cargo: user.isFantasma ? 'Fantasma' : primaryCargo,
      brandRoles: user.brandRoles
        .filter((role) => role.cargo !== 'Nenhum')
        .map((role) => ({
          marcaId: Number(role.marcaId),
          cargo:
            (
              {
                Administrador: 'ADMIN',
                Assistente: 'ASSISTENTE',
                Coordenador: 'COORDENADOR',
                Observador: 'VISUALIZADOR',
                Estilista: 'ESTILISTA',
                Modelista: 'MODELISTA',
                Comprador: 'COMPRADOR',
              } as Record<string, string>
            )[role.cargo] ?? role.cargo.toUpperCase(),
        })),
    });
    const updatedRecord = mapUsuarioDtoToRecord(updatedDto);
    setUsersList((prev) =>
      prev.map((u) => (normalizeId(u.id) === normalizeId(user.id) ? updatedRecord : u))
    );
    window.dispatchEvent(
      new CustomEvent('modaflow_user_access_updated', { detail: updatedDto.id })
    );
  };

  /**
   * Bloqueia ou ativa acesso no servidor (PATCH /usuarios/{id}/acesso)
   */
  const toggleAccess = async (id: string): Promise<void> => {
    const target = usersList.find((u) => normalizeId(u.id) === normalizeId(id));
    if (!target) return;

    const willBeActive = target.acesso !== 'Permitido';
    await toggleUserAccessApi(id, willBeActive);

    setUsersList((prev) =>
      prev.map((u) =>
        normalizeId(u.id) === normalizeId(id)
          ? {
              ...u,
              acesso: willBeActive ? 'Permitido' : 'Bloqueado',
              status: willBeActive ? 'Ativo' : 'Inativo',
            }
          : u
      )
    );
  };

  return {
    usersList,
    setUsersList,
    isLoadingUsers,
    usersError,
    reloadUsers: loadUsers,
    userFilterMarca,
    setUserFilterMarca,
    userFilterStatus,
    setUserFilterStatus,
    userFilterAcesso,
    setUserFilterAcesso,
    searchUser,
    setSearchUser,
    openMenuUserId,
    setOpenMenuUserId,
    editingUserProfile,
    setEditingUserProfile,
    searchCargoQuery,
    setSearchCargoQuery,
    filtrarCargosToggle,
    setFiltrarCargosToggle,
    createUser,
    updateUser,
    toggleAccess,
  };
}
