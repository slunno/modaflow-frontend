import { createRoot } from 'react-dom/client';
import { CollectionDetailView } from '../../../src/pages/Home/components/CollectionDetailView';
import { LOCAL_PECAS_KEY, savePecaLocal } from '../../../src/services/localPecasStorage';
import { getLocalStateSnapshot, parseLocalState } from '../../../src/services/localStateStorage';
import type { PecaItem } from '../../../src/types/plm';
import { marca, colecao, peca } from '../precificacao/fixtures';
import '../../../src/index.css';
import { applyTheme } from '../../../src/lib/theme';

applyTheme('light');
const localFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
  if (url.origin !== location.origin || url.pathname.startsWith('/api'))
    throw new Error('API externa bloqueada no teste de fotos.');
  return localFetch(input, init);
};
if (
  !parseLocalState<PecaItem[]>(getLocalStateSnapshot(LOCAL_PECAS_KEY), []).some(
    (item) => item.id === peca.id
  )
) {
  savePecaLocal({
    ...structuredClone(peca),
    nome: 'Peça de validação das fotos',
    tipo: 'CAMISETA',
    codigo: 'FOTO-01',
    fichaTecnica: {
      variantes: [
        { id: 'principal', nome: 'Principal', tecidos: [], aviamentos: [] },
        { id: 'azul', nome: 'Azul', tecidos: [], aviamentos: [] },
      ],
    },
  });
}
createRoot(document.getElementById('root')!).render(
  <main className="min-h-screen bg-bg p-5 text-primary">
    <p className="mb-5 rounded border border-border bg-surface p-3 text-sm">
      TESTE ISOLADO — arquivos e cadastros salvos de verdade neste navegador. API externa bloqueada.
    </p>
    <CollectionDetailView
      marca={marca}
      colecao={colecao}
      onBackToBrand={() => {}}
      onBackToHome={() => {}}
    />
  </main>
);
