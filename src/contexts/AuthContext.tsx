/**
 * ============================================================================
 * MÓDULO: Contexto de Autenticação & Estado Multi-Tenant
 * ARQUIVO: src/contexts/AuthContext.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Provedor React Context para controle da sessão de usuário e
 *            gerenciamento da Marca Ativa (King & Joe, K&J Black, King & Joe Play).
 *            Integrado com a API REST do backend Spring Boot via authService.
 *            Nenhum erro de login cria sessão fictícia. Marcas e cargos respeitam
 *            rigorosamente as autorizações emitidas pelo backend.
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { User, MarcaSummary } from '../types/auth';
import { AuthContext } from './authContextInstance';
import { getMeApi, loginApi } from '../services/authService';
import {
  mapMarcaDtoToSummary,
  mapUsuarioDtoToUser,
  normalizeId,
} from '../services/contractMappers';

interface StoredSession {
  user: User | null;
  activeMarca: MarcaSummary | null;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const decoded = JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      )
    ) as { exp?: number };
    return typeof decoded.exp === 'number' && decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function readStoredSession(): StoredSession {
  if (typeof window === 'undefined') return { user: null, activeMarca: null };

  const token = localStorage.getItem('modaflow_token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('modaflow_token');
    localStorage.removeItem('modaflow_user');
    localStorage.removeItem('modaflow_active_marca');
    return { user: null, activeMarca: null };
  }

  try {
    const user = JSON.parse(localStorage.getItem('modaflow_user') ?? 'null') as User | null;
    const storedMarca = JSON.parse(
      localStorage.getItem('modaflow_active_marca') ?? 'null'
    ) as MarcaSummary | null;
    if (!user?.id || !Array.isArray(user.marcas)) {
      return { user: null, activeMarca: null };
    }

    const activeMarca =
      user.marcas.find((marca) => normalizeId(marca.id) === normalizeId(storedMarca?.id)) ??
      user.marcas[0] ??
      null;
    return { user, activeMarca };
  } catch {
    localStorage.removeItem('modaflow_user');
    localStorage.removeItem('modaflow_active_marca');
    return { user: null, activeMarca: null };
  }
}

/**
 * Componente Provider que envolve a aplicação e fornece o estado global de login e marca ativa.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storedSession] = useState<StoredSession>(readStoredSession);
  const [user, setUser] = useState<User | null>(storedSession.user);
  const [activeMarca, setActiveMarcaState] = useState<MarcaSummary | null>(
    storedSession.activeMarca
  );

  /**
   * Encerra a sessão do usuário e limpa as credenciais salvas no LocalStorage.
   */
  const logout = useCallback(() => {
    setUser(null);
    setActiveMarcaState(null);
    localStorage.removeItem('modaflow_user');
    localStorage.removeItem('modaflow_active_marca');
    localStorage.removeItem('modaflow_token');
    localStorage.removeItem('modaflow_selected_marca_id');
    localStorage.removeItem('modaflow_selected_colecao_id');
  }, []);

  // Escuta 401 vindo de requisições do client HTTP para forçar logout imediato
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('modaflow_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('modaflow_unauthorized', handleUnauthorized);
  }, [logout]);

  // Reconsulta as permissões salvas ao restaurar a sessão e após alterar cargos.
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const refreshAccess = async (event?: Event) => {
      if (event instanceof CustomEvent && normalizeId(event.detail) !== normalizeId(user.id))
        return;
      try {
        const currentUser = mapUsuarioDtoToUser(await getMeApi());
        if (!mounted) return;
        setUser(currentUser);
        setActiveMarcaState((previous) => {
          const selected =
            currentUser.marcas.find(
              (marca) => normalizeId(marca.id) === normalizeId(previous?.id)
            ) ??
            currentUser.marcas[0] ??
            null;
          if (selected) localStorage.setItem('modaflow_active_marca', JSON.stringify(selected));
          else localStorage.removeItem('modaflow_active_marca');
          return selected;
        });
        localStorage.setItem('modaflow_user', JSON.stringify(currentUser));
      } catch {
        // O cache da sessão permanece disponível durante uma falha temporária da API.
      }
    };
    void refreshAccess();
    window.addEventListener('modaflow_user_access_updated', refreshAccess);
    return () => {
      mounted = false;
      window.removeEventListener('modaflow_user_access_updated', refreshAccess);
    };
  }, [user?.id]);

  /**
   * Autentica o usuário chamando o endpoint real POST /auth/login do backend.
   * Nenhum fallback local ou perfil fictício é gerado em caso de erro.
   */
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const { token, usuario } = await loginApi(email, senha);

      // Salva o token JWT apenas mediante resposta 200 bem-sucedida do servidor
      localStorage.setItem('modaflow_token', token);

      // Marcas permitidas: se vazias, o array permanece vazio (modelagem explícita de usuário sem marca)
      const userMarcas: MarcaSummary[] = Array.isArray(usuario.marcasPermitidas)
        ? usuario.marcasPermitidas.map(mapMarcaDtoToSummary)
        : [];

      // Mapeia o DTO do backend sem substituir cargo ausente por 'Administrador'
      const loggedUser: User = {
        id: normalizeId(usuario.id),
        nome: usuario.nome,
        email: usuario.email,
        empresa: usuario.empresa ?? 'AKR BRANDS',
        cargo: usuario.cargo || 'Sem cargo definido',
        avatarUrl: usuario.avatarUrl ?? undefined,
        marcas: userMarcas,
      };

      const initialMarca = userMarcas[0] ?? null;

      localStorage.removeItem('modaflow_selected_marca_id');
      localStorage.removeItem('modaflow_selected_colecao_id');
      setUser(loggedUser);
      setActiveMarcaState(initialMarca);
      localStorage.setItem('modaflow_user', JSON.stringify(loggedUser));
      if (initialMarca) {
        localStorage.setItem('modaflow_active_marca', JSON.stringify(initialMarca));
      } else {
        localStorage.removeItem('modaflow_active_marca');
      }

      return true;
    } catch (err: unknown) {
      // Garante que nenhuma sessão resídua seja mantida em caso de credenciais inválidas ou API offline
      logout();
      throw err;
    }
  };

  /**
   * Atualiza a marca ativa verificando se o usuário possui permissão concedida pelo backend.
   */
  const setActiveMarca = (marca: MarcaSummary) => {
    if (!user) return;
    const isPermitted = user.marcas.some((m) => normalizeId(m.id) === normalizeId(marca.id));
    if (!isPermitted) {
      console.warn(
        `Acesso negado: a marca ${marca.nome} (ID: ${marca.id}) não está entre as marcas permitidas ao usuário.`
      );
      return;
    }

    setActiveMarcaState(marca);
    localStorage.setItem('modaflow_active_marca', JSON.stringify(marca));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        activeMarca,
        login,
        logout,
        setActiveMarca,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
