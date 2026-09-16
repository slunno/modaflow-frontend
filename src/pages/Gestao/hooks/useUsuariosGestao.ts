/**
 * ============================================================================
 * HOOK: useUsuariosGestao
 * ARQUIVO: src/pages/Gestao/hooks/useUsuariosGestao.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Encapsula o estado e operações da aba de Usuários, sincronizando com a API do backend.
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { usePersistedState } from '../../../hooks/usePersistedState';
import type { UserRecord } from '../../../types/gestao';
import { getUsuariosApi } from '../../../services/authService';

export function useUsuariosGestao() {
  const [usersList, setUsersList] = usePersistedState<UserRecord[]>('modaflow_users_data', []);
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

  // Busca lista de usuários cadastrados no backend ao carregar
  useEffect(() => {
    getUsuariosApi()
      .then((backendUsers) => {
        if (backendUsers && backendUsers.length > 0) {
          const mapped: UserRecord[] = backendUsers.map((b) => ({
            id: String(b.id),
            nome: b.nome,
            email: b.email,
            codigo: `usr-${b.id}`,
            marcas: b.marcasPermitidas?.map((m) => m.nome) || [],
            status: b.ativo ? 'Ativo' : 'Inativo',
            acesso: b.ativo ? 'Permitido' : 'Bloqueado',
            brandRoles: [],
          }));
          setUsersList(mapped);
        }
      })
      .catch(() => {
        // Ignora erros de conexão ao carregar
      });
  }, [setUsersList]);

  const addUser = (user: UserRecord) => {
    setUsersList((prev) => [user, ...prev]);
  };

  const updateUser = (user: UserRecord) => {
    setUsersList((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  };

  const toggleAccess = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, acesso: u.acesso === 'Permitido' ? 'Bloqueado' : 'Permitido' } : u
      )
    );
  };

  return {
    usersList,
    setUsersList,
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
    addUser,
    updateUser,
    toggleAccess,
  };
}
