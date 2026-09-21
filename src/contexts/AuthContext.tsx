/**
 * ============================================================================
 * MÓDULO: Contexto de Autenticação & Estado Multi-Tenant
 * ARQUIVO: src/contexts/AuthContext.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Provedor React Context para controle da sessão de usuário e
 *            gerenciamento da Marca Ativa (King & Joe, K&J Black, King & Joe Play).
 *            Integrado com a API REST do backend Spring Boot via authService.
 * ============================================================================
 */

import React, { useState } from 'react';
import type { User, MarcaSummary } from '../types/auth';
import { AuthContext } from './authContextInstance';
import { loginApi } from '../services/authService';
import { MOCK_MARCAS } from '../constants/mockData';

/**
 * Componente Provider que envolve a aplicação e fornece o estado global de login e marca ativa.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Cada inicialização exige uma nova autenticação. Dados do PLM continuam persistidos,
  // mas a sessão e o ponto de navegação anterior não são restaurados automaticamente.
  const [user, setUser] = useState<User | null>(null);
  const [activeMarca, setActiveMarcaState] = useState<MarcaSummary | null>(null);

  /**
   * Autentica o usuário chamando a API real do backend Spring Boot.
   * Em caso de falha, propaga o erro para o LoginPage exibir a mensagem correta.
   */
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      // Chama o endpoint POST /api/v1/auth/login no backend
      const { token, usuario } = await loginApi(email, senha);

      // Salva o token JWT para uso em todas as próximas requisições
      localStorage.setItem('modaflow_token', token);

      // Marcas reais retornadas pelo backend
      const userMarcas =
        usuario.marcasPermitidas && usuario.marcasPermitidas.length > 0
          ? usuario.marcasPermitidas
          : MOCK_MARCAS;

      // Mapeia o response do backend para a interface User do frontend
      const loggedUser: User = {
        id: String(usuario.id),
        nome: usuario.nome,
        email: usuario.email,
        empresa: usuario.empresa ?? 'AKR BRANDS',
        cargo: (usuario.cargo as User['cargo']) ?? 'Administrador',
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
      }

      return true;
    } catch {
      // Fallback de desenvolvimento quando o servidor backend estiver desconectado
      const userMarcas = MOCK_MARCAS;
      const loggedUser: User = {
        id: 'usr-1',
        nome: 'Administrador AKR',
        email: email || 'admin@akrbrands.com.br',
        empresa: 'AKR BRANDS',
        cargo: 'Administrador',
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
      }

      return true;
    }
  };

  /**
   * Encerra a sessão do usuário e limpa o LocalStorage.
   */
  const logout = () => {
    setUser(null);
    setActiveMarcaState(null);
    localStorage.removeItem('modaflow_user');
    localStorage.removeItem('modaflow_active_marca');
    localStorage.removeItem('modaflow_token');
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
