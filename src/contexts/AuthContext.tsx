/**
 * ============================================================================
 * MÓDULO: Contexto de Autenticação & Estado Multi-Tenant
 * ARQUIVO: src/contexts/AuthContext.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Provedor React Context para controle da sessão de usuário e
 *            gerenciamento da Marca Ativa (King & Joe, K&J Black, King & Joe Play).
 * ----------------------------------------------------------------------------
 * PADRÃO DE EXTENSÃO:
 * - Quando integrar com a API REST em Java Spring Boot, substitua as funções
 *   MOCK pelo consumo das rotas `/api/v1/auth/login` e `/api/v1/marcas`.
 * ============================================================================
 */

import React, { useState } from 'react';
import type { User, MarcaSummary } from '../types/auth';
import { MOCK_MARCAS } from '../constants/mockData';
import { AuthContext } from './authContextInstance';

/**
 * Usuário mock de teste corporativo (Juliano / Estilista).
 */
const MOCK_USER: User = {
  id: 'usr_1',
  nome: 'Juliano',
  email: 'juliano@akrbrands.com.br',
  empresa: 'AKR BRANDS',
  cargo: 'Estilista',
  marcas: MOCK_MARCAS,
};

/**
 * Componente Provider que envolve a aplicação e fornece o estado global de login e marca ativa.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado do Usuário Autenticado (persisitido em LocalStorage para dev)
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('modaflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Estado da Marca Ativa no contexto Multi-Tenant
  const [activeMarca, setActiveMarcaState] = useState<MarcaSummary | null>(() => {
    const saved = localStorage.getItem('modaflow_active_marca');
    return saved ? JSON.parse(saved) : MOCK_MARCAS[0];
  });

  /**
   * Simula a autenticação de login do usuário.
   */
  const login = async (email: string): Promise<boolean> => {
    // Simula delay de rede (500ms)
    await new Promise((res) => setTimeout(res, 500));

    const loggedUser: User = {
      ...MOCK_USER,
      email: email || MOCK_USER.email,
    };

    setUser(loggedUser);
    setActiveMarcaState(loggedUser.marcas[0] ?? null);
    localStorage.setItem('modaflow_user', JSON.stringify(loggedUser));
    localStorage.setItem('modaflow_active_marca', JSON.stringify(loggedUser.marcas[0]));
    return true;
  };

  /**
   * Encerra a sessão do usuário e limpa o LocalStorage.
   */
  const logout = () => {
    setUser(null);
    setActiveMarcaState(null);
    localStorage.removeItem('modaflow_user');
    localStorage.removeItem('modaflow_active_marca');
  };

  /**
   * Atualiza a marca ativa e salva no LocalStorage.
   */
  const setActiveMarca = (marca: MarcaSummary) => {
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
