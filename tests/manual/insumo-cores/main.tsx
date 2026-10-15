import { createRoot } from 'react-dom/client';
import { Preview } from './Preview';
import '../../../src/index.css';
import { applyTheme } from '../../../src/lib/theme';
applyTheme(new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light');

// Origem exclusiva de teste: sem sessão real, API/backend ou catálogo de produção.
const fetchLocal = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
  if (url.origin !== location.origin || url.pathname.startsWith('/api')) {
    throw new Error('API real/rede externa bloqueada no teste isolado de cores.');
  }
  return fetchLocal(input, init);
};

createRoot(document.getElementById('root')!).render(<Preview />);
