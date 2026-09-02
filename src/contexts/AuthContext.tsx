import React, { createContext, useContext, useState } from 'react';
import type { User, MarcaSummary, AuthContextType } from '../types/auth';

export const MOCK_MARCAS: MarcaSummary[] = [
  { 
    id: '1', 
    nome: 'King & Joe', 
    code: 'KJ',
    initials: 'KING&JOE', 
    colecoesCount: 4,
    pecasCount: 48,
    heroImageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1600&auto=format&fit=crop',
    description: 'Moda masculina contemporânea com foco em conforto, estilo casual sofisticado e alfaiataria desconstruída.',
    badgeTag: 'Linha Principal'
  },
  { 
    id: '2', 
    nome: 'K&J Black', 
    code: 'KJB',
    initials: 'KB', 
    colecoesCount: 2,
    pecasCount: 24,
    heroImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
    description: 'Coleção premium e sartorial. Peças exclusivas em tecidos nobres, blazers estruturados e linhas noitivas.',
    badgeTag: 'Linha Premium'
  },
  { 
    id: '3', 
    nome: 'King & Joe Play', 
    code: 'KJP',
    initials: 'K&', 
    colecoesCount: 3,
    pecasCount: 32,
    heroImageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1600&auto=format&fit=crop',
    description: 'Estilo urbano, esportivo e jovem. Camisetas exclusivas, bermudas funcionais e moda casual dinâmica.',
    badgeTag: 'Linha Sportwear'
  },
];

const MOCK_USER: User = {
  id: 'usr_1',
  nome: 'Juliano',
  email: 'juliano@akrbrands.com.br',
  empresa: 'AKR BRANDS',
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
    await new Promise((res) => setTimeout(res, 500));

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
