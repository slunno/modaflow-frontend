import { createRoot } from 'react-dom/client';
import { PecaFichaTecnicaView } from '../../../src/pages/Home/components/PecaFichaTecnicaView';
import { usePersistedState } from '../../../src/hooks/usePersistedState';
import { saveLocalState } from '../../../src/services/localStateStorage';
import { marca, colecao, peca as inicial } from './fixtures';
import '../../../src/index.css';

// Servir com tests/manual/ficha/vite.config.ts; a API e os dados são isolados.
const originalFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
  if (url.origin !== location.origin || url.pathname.startsWith('/api'))
    throw new Error('API externa bloqueada no preview.');
  return originalFetch(input, init);
};

export function Preview() {
  const [peca] = usePersistedState('fixture_precificacao_local', inicial);
  return (
    <main className="min-h-screen bg-bg p-6 text-primary">
      <p className="mb-4 text-xs">
        Preview com dados de teste — tecidos e aviamentos somam R$ 110,0000 na Principal.
      </p>
      <PecaFichaTecnicaView
        peca={peca}
        marca={marca}
        colecao={colecao}
        onBack={() => {}}
        onUpdatePeca={(value) => saveLocalState('fixture_precificacao_local', value)}
      />
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
