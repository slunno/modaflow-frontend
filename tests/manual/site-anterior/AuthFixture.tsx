import { useState, type ReactNode } from 'react';
import { AuthContext } from '../../../src/contexts/authContextInstance';
import type { MarcaSummary } from '../../../src/types/auth';

export const brands: MarcaSummary[] = [
  {
    id: 'preview-kj',
    nome: 'King & Joe',
    code: 'KJ',
    heroImageUrl: '/tests/manual/site-anterior/capa.svg',
  },
  {
    id: 'preview-black',
    nome: 'K&J Black',
    code: 'KJB',
    heroImageUrl: '/tests/manual/site-anterior/capa.svg',
  },
  {
    id: 'preview-play',
    nome: 'King & Joe Play',
    code: 'KJP',
    heroImageUrl: '/tests/manual/site-anterior/capa.svg',
  },
];

// Exclusivo da prévia em 5193: não restaura nem grava uma sessão real.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [activeMarca, setActiveMarca] = useState<MarcaSummary | null>(brands[0]!);
  return (
    <AuthContext
      value={{
        user: {
          id: 'preview-user',
          nome: 'Usuário de teste',
          email: 'preview@example.invalid',
          empresa: 'Teste isolado',
          cargo: 'Administrador',
          marcas: brands,
        },
        isAuthenticated: true,
        activeMarca,
        setActiveMarca,
        login: async () => false,
        logout: () => {},
      }}
    >
      <div
        role="status"
        style={{
          position: 'fixed',
          right: 12,
          bottom: 8,
          zIndex: 100,
          background: '#fff5e7',
          color: '#714723',
          padding: '4px 8px',
          fontSize: 11,
        }}
      >
        Prévia isolada · dados simulados · sem backend/SQL/Linx
      </div>
      {children}
    </AuthContext>
  );
}
