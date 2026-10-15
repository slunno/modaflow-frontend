import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrandCollectionsView } from '../../../src/pages/Home/components/BrandCollectionsView';
import { AuthContext } from '../../../src/contexts/authContextInstance';
import { MOCK_MARCAS } from '../../../src/constants/mockData';
import '../../../src/index.css';

// Preview com dados de teste; servir com tests/manual/marcas/vite.config.ts (API isolada).
const marcas = MOCK_MARCAS.map((marca) => ({ ...marca, heroImageUrl: '' }));

export function Preview() {
  const [marca, setMarca] = useState(marcas[1]!);
  return (
    <AuthContext
      value={{
        user: null,
        isAuthenticated: false,
        activeMarca: marca,
        login: async () => false,
        logout: () => {},
        setActiveMarca: setMarca,
      }}
    >
      <main className="min-h-screen bg-bg p-6 text-primary">
        <p className="mb-3 text-xs text-muted-foreground">
          Preview com coleções finalizadas de teste.
        </p>
        <nav aria-label="Marcas de teste" className="mb-6 flex flex-wrap gap-2 text-xs">
          {marcas.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === marca.id}
              className="rounded-md border border-border bg-surface px-3 py-2"
              onClick={() => setMarca(item)}
            >
              {item.nome}
            </button>
          ))}
        </nav>
        <BrandCollectionsView marca={marca} onBack={() => {}} />
      </main>
    </AuthContext>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
