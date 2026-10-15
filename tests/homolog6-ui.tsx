import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { FichaRascunhoServidorPanel } from '../src/pages/Home/components/FichaRascunhoServidorPanel';
import { loginApi } from '../src/services/authService';
import type { MarcaResponseDTO, UsuarioResponseDTO } from '../src/types/dtos';
import type { PecaItem } from '../src/types/plm';
import '../src/index.css';

const API_BASE = 'http://127.0.0.1:18081/api/v1';
const UI_ORIGIN = 'http://localhost:5174';
const fixturePattern = /^mf-homolog-[a-z0-9-]{1,100}$/;
const query = new URLSearchParams(window.location.search);
const runId = crypto.randomUUID();
const collectionId = query.get('colecaoId') ?? `mf-homolog-ui-colecao-${runId}`;
const pieceId = query.get('pecaId') ?? `mf-homolog-ui-peca-${runId}`;
const requestedBrandId = query.get('marcaId');
const routeValid =
  import.meta.env.DEV &&
  import.meta.env.VITE_API_BASE_URL === API_BASE &&
  import.meta.env.VITE_FICHA_SERVER_DRAFT_ENABLED === 'true' &&
  window.location.origin === UI_ORIGIN &&
  window.location.pathname === '/tests/homolog6-ui.html' &&
  fixturePattern.test(collectionId) && fixturePattern.test(pieceId) &&
  (query.has('colecaoId') === query.has('pecaId'));

// Guarda exclusiva desta página. Não altera api.ts/App/configuração do portal.
const sessionGuard = { marcaId: '', writesAllowed: false };
const fixtureBase = `${API_BASE}/fichas/rascunhos/${encodeURIComponent(collectionId)}/pecas/${encodeURIComponent(pieceId)}`;
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  if (!routeValid) throw new Error('Configuração isolada inválida; nenhuma chamada foi autorizada.');
  const request = new Request(input, { ...init, redirect: 'error' });
  const url = new URL(request.url);
  const login = url.href === `${API_BASE}/auth/login` && request.method === 'POST';
  const draft = url.origin === 'http://127.0.0.1:18081' && url.pathname === new URL(fixtureBase).pathname && !url.search;
  const history = url.origin === 'http://127.0.0.1:18081' && url.pathname === new URL(`${fixtureBase}/historico`).pathname;
  const allowedHistoryQuery = Array.from(url.searchParams.keys()).every((key) => key === 'limit' || key === 'afterEventoId');
  const scoped = (draft || (history && allowedHistoryQuery)) &&
    sessionGuard.marcaId !== '' && request.headers.get('X-Marca-Id') === sessionGuard.marcaId;
  const read = scoped && request.method === 'GET';
  const write = scoped && draft && request.method === 'PUT' && sessionGuard.writesAllowed;
  if (url.username || url.password || !(login || read || write))
    throw new Error('Requisição bloqueada pelo teste isolado. Só login e esta ficha sintética na API local são permitidos; confirme separadamente uma gravação.');
  return originalFetch(request);
};

// Origem isolada: não reaproveitar token expirado ou tenant de um teste anterior.
for (const key of ['modaflow_token', 'modaflow_user', 'modaflow_active_marca']) localStorage.removeItem(key);

function initialPiece(marcaId: string): PecaItem {
  return {
    id: pieceId, marcaId, colecaoId: collectionId,
    codigo: 'FIXTURE-UI-SEM-ERP', nome: 'Teste sintético de rascunho', tipo: 'Teste',
    status: 'Em andamento', etapaAtual: '', tema: '', colecaoNome: 'Teste isolado de homologação',
    marcaNome: 'King & Joe', estilista: '', tecidos: [], aviamentos: [], previsaoEntrega: '',
    fichaTecnica: { observacoesGerais: '' },
  };
}

export function Harness() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<UsuarioResponseDTO | null>(null);
  const [brand, setBrand] = useState<MarcaResponseDTO | null>(null);
  const [piece, setPiece] = useState<PecaItem>(() => initialPiece(''));
  const [writesAllowed, setWritesAllowed] = useState(false);

  const clearSession = () => {
    for (const key of ['modaflow_token', 'modaflow_user', 'modaflow_active_marca']) localStorage.removeItem(key);
    sessionGuard.marcaId = '';
    sessionGuard.writesAllowed = false;
    setUser(null); setBrand(null); setWritesAllowed(false);
  };

  useEffect(() => {
    const expired = () => { clearSession(); setError('Sessão de teste expirou. Autentique novamente; nenhum dado central foi aplicado localmente.'); };
    window.addEventListener('modaflow_unauthorized', expired);
    return () => window.removeEventListener('modaflow_unauthorized', expired);
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !routeValid) return;
    setBusy(true); setError(''); clearSession();
    try {
      const result = await loginApi(email, password);
      const brands = result.usuario.marcasPermitidas;
      const kingJoe = Array.isArray(brands)
        ? brands.find((entry) => entry.code === 'KING_JOE' && entry.nome === 'King & Joe') : undefined;
      const marcaId = kingJoe ? String(kingJoe.id) : '';
      if (!kingJoe || !marcaId || marcaId.length > 128 || marcaId !== marcaId.trim() ||
          (requestedBrandId !== null && requestedBrandId !== marcaId) ||
          typeof result.token !== 'string' || !result.token)
        throw new Error('O usuário precisa ter acesso explícito à King & Joe e à marca solicitada. Nenhuma outra marca será usada.');
      // Somente tokens de fixtures digitadas manualmente, nesta origem de teste.
      localStorage.setItem('modaflow_token', result.token);
      localStorage.setItem('modaflow_active_marca', JSON.stringify({ id: marcaId }));
      sessionGuard.marcaId = marcaId;
      setUser(result.usuario); setBrand(kingJoe); setPiece(initialPiece(marcaId));
    } catch (failure) {
      clearSession();
      setError(failure instanceof Error ? failure.message : 'Login de teste falhou.');
    } finally { setPassword(''); setBusy(false); }
  };

  if (!routeValid) return <main className="max-w-3xl mx-auto p-6"><p role="alert">Teste bloqueado: use DEV, a configuração isolada, http://localhost:5174/tests/homolog6-ui.html e IDs sintéticos com prefixo mf-homolog-.</p></main>;

  return <main className="max-w-4xl mx-auto p-6 space-y-5">
    <header className="space-y-2">
      <h1 className="text-xl font-bold">Teste isolado — painel real de rascunho</h1>
      <p>Somente King & Joe, API local 18081 e tabelas próprias no .6. Esta página não abre o portal principal nem consulta/integra no Linx.</p>
      <p className="text-sm text-muted">Imagens/anexos não são transferidos. Apenas cliques explícitos no painel podem consultar ou gravar. Dados sintéticos não são produtos do ERP.</p>
      <dl className="text-xs space-y-1"><dt>Coleção</dt><dd><code>{collectionId}</code></dd><dt>Peça</dt><dd><code>{pieceId}</code></dd></dl>
    </header>
    {error ? <p role="alert" className="text-red-700">{error}</p> : null}
    {!user || !brand ? <form onSubmit={login} className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <h2 className="font-semibold">Login da fixture local de teste</h2>
      <p className="text-sm">Digite credenciais do H2 isolado. Não use a senha do SQL Server nem credenciais de produção.</p>
      <label className="block" htmlFor="h6-email">E-mail<input id="h6-email" type="email" autoComplete="off" required value={email} onChange={(event) => setEmail(event.target.value)} className="block w-full rounded border border-border p-2" /></label>
      <label className="block" htmlFor="h6-password">Senha<input id="h6-password" type="password" autoComplete="off" required value={password} onChange={(event) => setPassword(event.target.value)} className="block w-full rounded border border-border p-2" /></label>
      <button type="submit" disabled={busy} className="rounded bg-accent-camel text-on-camel px-4 py-2 disabled:opacity-60">{busy ? 'Autenticando…' : 'Entrar no teste'}</button>
    </form> : <>
      <div className="flex items-center justify-between"><p>Usuário: {user.nome} · Marca: {brand.nome} (<code>{String(brand.id)}</code>)</p><button type="button" onClick={clearSession} className="rounded border border-border px-3 py-2">Sair do teste</button></div>
      <section aria-label="Peça sintética local" className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <h2 className="font-semibold">Dados em memória desta página</h2>
        <p className="text-sm text-muted">Consultar o servidor não preenche estes campos. Ao salvar, o payload mínimo abaixo substitui a revisão consultada, incluindo campos ausentes; não habilite gravação para uma fixture Node rica que queira apenas conferir.</p>
        <label className="block" htmlFor="h6-name">Nome da peça<input id="h6-name" value={piece.nome} onChange={(event) => setPiece((previous) => ({ ...previous, nome: event.target.value }))} className="block w-full rounded border border-border p-2" /></label>
        <label className="block" htmlFor="h6-observation">Observação<textarea id="h6-observation" value={piece.fichaTecnica?.observacoesGerais ?? ''} onChange={(event) => setPiece((previous) => ({ ...previous, fichaTecnica: { ...previous.fichaTecnica, observacoesGerais: event.target.value } }))} className="block w-full rounded border border-border p-2" /></label>
        <label className="flex gap-2" htmlFor="h6-writes"><input id="h6-writes" type="checkbox" checked={writesAllowed} onChange={(event) => { setWritesAllowed(event.target.checked); sessionGuard.writesAllowed = event.target.checked; }} />Permito testar gravações desta peça sintética no .6, ciente da substituição pelo payload mínimo.</label>
      </section>
      <FichaRascunhoServidorPanel identity={{ marcaId: String(brand.id), colecaoId: collectionId, pecaId: pieceId }} peca={piece} />
    </>}
  </main>;
}

const root = document.getElementById('root');
if (!root) throw new Error('Elemento root do teste não encontrado.');
createRoot(root).render(<Harness />);
