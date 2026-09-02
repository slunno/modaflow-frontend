import React, { createContext, useContext, useState } from 'react';
import type { User, MarcaSummary, AuthContextType } from '../types/auth';

const MOCK_MARCAS: MarcaSummary[] = [
  { id: '1', nome: 'King & Joe', code: 'KJ', colecoesCount: 4 },
  { id: '2', nome: 'K&J Black', code: 'KJB', colecoesCount: 2 },
  { id: '3', nome: 'King & Joe Play', code: 'KJP', colecoesCount: 3 },
];

const MOCK_USER: User = {
  id: 'usr_1',
  nome: 'Nathan Henrique',
  email: 'nathan@kingjoe.com.br',
  cargo: 'Estilista',
  marcas: MOCK_MARCAS,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('modaflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeMarca, setActiveMarcaState] = useState<MarcaSummary | null>(() => {
    const saved = localStorage.getItem('modaflow_active_marca');
    return saved ? JSON.parse(saved) : MOCK_MARCAS[0];
  });

  const login = async (email: string): Promise<boolean> => {
    // Simula autenticação com delay de rede
    await new Promise((res) => setTimeout(res, 600));

    const loggedUser: User = {
      ...MOCK_USER,
      email: email || MOCK_USER.email,
    };

    setUser(loggedUser);
    setActiveMarcaState(loggedUser.marcas[0]);
    localStorage.setItem('modaflow_user', JSON.stringify(loggedUser));
    localStorage.setItem('modaflow_active_marca', JSON.stringify(loggedUser.marcas[0]));
    return true;
  };

  const logout = () => {
    setUser(null);
    setActiveMarcaState(null);
    localStorage.removeItem('modaflow_user');
    localStorage.removeItem('modaflow_active_marca');
  };

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
