/**
 * Driver de homologação opt-in. Não inicia servidores nem abre conexão SQL.
 *
 * Sem argumentos: dry-run, sem rede. Exemplos (sem credenciais):
 *   node tests/rascunho-servidor-homolog.e2e.mjs --dry-run
 *   node tests/rascunho-servidor-homolog.e2e.mjs --phase=write --run-id=...
 *     --marca-id=... --denied-marca-id=... --confirm-own-draft-write
 *   node tests/rascunho-servidor-homolog.e2e.mjs --phase=verify --run-id=...
 *     --marca-id=... --denied-marca-id=...
 *
 * write/verify recebem {email,senha} SOMENTE pelo stdin protegido do processo
 * chamador. Não usar argumentos, variáveis de ambiente ou arquivo de senha.
 * verify deve ser executado após reiniciar o backend isolado: faz novo login
 * e somente leituras do mesmo rascunho. Nenhuma operação de integração Linx.
 *
 * Carrega as fontes reais do cliente TS, compiladas apenas em memória. A URL
 * e a flag de teste são injetadas nessa compilação, sem editar .env/projeto.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const API_ORIGIN = 'http://127.0.0.1:18081';
const API_BASE = `${API_ORIGIN}/api/v1`;
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const observations = [];
const checks = {};
let stage = 'argumentos';

class VerificationError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
function requireCheck(condition, code) {
  if (!condition) throw new VerificationError(code);
}
function equal(actual, expected, code) {
  try {
    assert.deepEqual(actual, expected);
  } catch {
    throw new VerificationError(code);
  }
}
function validIdentity(value) {
  return (
    typeof value === 'string' && value.length > 0 && value.length <= 128 &&
    value === value.trim() && !/[\u0000-\u001f\u007f-\u009f]/u.test(value)
  );
}
function optionsFromArgs(args) {
  const options = { phase: 'dry-run', runId: 'dry-run', marcaId: '1' };
  const supplied = new Set();
  for (const arg of args) {
    if (arg === '--dry-run') {
      requireCheck(!supplied.has('phase'), 'DUPLICATE_PHASE');
      options.phase = 'dry-run';
      supplied.add('phase');
      continue;
    }
    if (arg === '--confirm-own-draft-write') {
      requireCheck(!options.confirmWrite, 'DUPLICATE_WRITE_CONFIRMATION');
      options.confirmWrite = true;
      continue;
    }
    const match = /^--(phase|run-id|marca-id|denied-marca-id)=(.*)$/u.exec(arg);
    requireCheck(match !== null, 'UNKNOWN_ARGUMENT');
    const key = { phase: 'phase', 'run-id': 'runId', 'marca-id': 'marcaId', 'denied-marca-id': 'deniedMarcaId' }[match[1]];
    requireCheck(!supplied.has(key), 'DUPLICATE_ARGUMENT');
    options[key] = match[2];
    supplied.add(key);
  }
  requireCheck(['dry-run', 'write', 'verify'].includes(options.phase), 'INVALID_PHASE');
  requireCheck(/^[a-zA-Z0-9_-]{1,48}$/u.test(options.runId), 'INVALID_SYNTHETIC_RUN_ID');
  requireCheck(validIdentity(options.marcaId), 'INVALID_BRAND_ID');
  if (options.phase !== 'dry-run') {
    requireCheck(['runId', 'marcaId', 'deniedMarcaId'].every((key) => supplied.has(key)), 'EXPLICIT_LIVE_IDS_REQUIRED');
    requireCheck(validIdentity(options.deniedMarcaId) && options.deniedMarcaId !== options.marcaId, 'INVALID_DENIED_BRAND_ID');
  }
  requireCheck(options.phase !== 'write' || options.confirmWrite === true, 'EXPLICIT_WRITE_CONFIRMATION_REQUIRED');
  return options;
}

function makeFixture(identity, variant = 'base') {
  const manualPrice = { base: '14,97990000', A: '14,11111111', B: '14,22222222' }[variant];
  const manualWeight = { base: '0,40000000', A: '0,41000001', B: '0,42000002' }[variant];
  return {
    id: identity.pecaId,
    marcaId: identity.marcaId,
    colecaoId: identity.colecaoId,
    codigo: '',
    nome: 'Teste de homologação de rascunho — não integrado',
    tipo: 'Teste de homologação',
    status: 'Em andamento',
    etapaAtual: '',
    tema: '',
    colecaoNome: 'Coleção sintética de teste — sem integração Linx',
    marcaNome: 'King & Joe',
    estilista: '',
    tecidos: ['Tecido sintético de homologação'],
    previsaoEntrega: '',
    imagemCroquiUrl: 'data:image/png;base64,c2ltdWxhY2FvLW5hby1lLXVwbG9hZA==',
    fichaTecnica: {
      nomeProduto: 'Teste de homologação de rascunho — não integrado',
      codigoReferencia: '',
      descricao: `Conteúdo manual de homologação ${variant}; não criar produto no Linx.`,
      tamanhos: ['P', 'M'],
      tecnica: '',
      observacoesGerais: 'Valores e consumos manuais; anexos permanecem somente no navegador.',
      observacoesCorte: '',
      simbologiaImagemUrl: 'blob:http://127.0.0.1/simbologia-local-simulada',
      simbologiaDescricao: 'Metadado manual preservado sem bytes de imagem.',
      variantes: [{
        id: `${identity.pecaId}-principal`,
        nome: 'Principal',
        imagemAnexoId: `${identity.pecaId}-imagem-principal`,
        imagemNome: 'imagem-principal-simulada.png',
        imagemUrl: 'data:image/png;base64,aW1hZ2VtLWxvY2Fs',
        tecidos: [{
          id: `${identity.pecaId}-tecido`,
          nome: 'Tecido sintético de homologação',
          codigo: '',
          temErp: false,
          fornecedores: '',
          custo: manualPrice,
          unidade: 'KG',
          precoOrigem: 'manual',
          consumo: '1,50000000',
          peso: manualWeight,
          uso: 'Uso sintético apenas para verificar persistência',
          consumoPorTamanho: {
            P: { valor: '0,30000001', naoSeAplica: false },
            M: { valor: '0,40000002', naoSeAplica: false },
            G: { valor: '', naoSeAplica: true },
          },
          imagemUrl: 'data:image/png;base64,dGVjaWRv',
        }],
        aviamentos: [{
          id: `${identity.pecaId}-aviamento`,
          nome: 'Aviamento sintético de homologação',
          codigo: '',
          temErp: false,
          fornecedores: '',
          custo: '0,36710000',
          unidade: 'UN',
          precoOrigem: 'manual',
          quantidade: '2,00000001',
          uso: '',
          consumoPorTamanho: { P: { valor: '2,00000001' }, M: { valor: '3,00000002' } },
        }],
      }],
      terceiros: [],
      tabelasMedidas: [],
      provaRoupa: {
        data: '2026-10-07',
        observacoes: 'Foto simulada local; não comprova upload real do navegador.',
        fotos: [{
          id: `${identity.pecaId}-foto-prova`,
          nome: 'prova-simulada.png',
          imagemUrl: 'blob:http://127.0.0.1/foto-prova-local-simulada',
        }],
      },
    },
  };
}

function sourceAsDataUrl(source, fileName, apiModuleUrl) {
  const tree = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const environment = {
    VITE_API_BASE_URL: API_BASE,
    VITE_FICHA_SERVER_DRAFT_ENABLED: 'true',
  };
  const transformed = (context) => {
    const visit = (node) => {
      if (ts.isImportDeclaration(node)) {
        const clause = node.importClause;
        if (clause?.isTypeOnly) return node;
        requireCheck(apiModuleUrl && node.moduleSpecifier.text === './api', 'UNEXPECTED_RUNTIME_SOURCE_IMPORT');
        return ts.factory.updateImportDeclaration(
          node, node.modifiers, clause, ts.factory.createStringLiteral(apiModuleUrl), node.attributes
        );
      }
      requireCheck(!(ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword), 'DYNAMIC_SOURCE_IMPORT_FORBIDDEN');
      if (
        ts.isPropertyAccessExpression(node) && node.name.text === 'env' &&
        ts.isMetaProperty(node.expression) && node.expression.keywordToken === ts.SyntaxKind.ImportKeyword
      ) {
        return ts.factory.createObjectLiteralExpression(Object.entries(environment).map(([key, value]) =>
          ts.factory.createPropertyAssignment(key, ts.factory.createStringLiteral(value))
        ));
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (node) => ts.visitNode(node, visit);
  };
  const output = ts.transpileModule(tree.text, {
    fileName,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    transformers: { before: [transformed] },
    reportDiagnostics: true,
  });
  requireCheck(!(output.diagnostics ?? []).some((entry) => entry.category === ts.DiagnosticCategory.Error), 'CLIENT_TRANSPILATION_FAILED');
  return `data:text/javascript;base64,${Buffer.from(output.outputText).toString('base64')}`;
}

async function loadActualClients() {
  const paths = ['api.ts', 'authService.ts', 'fichaRascunhoServidor.ts'];
  const sources = await Promise.all(paths.map((name) => readFile(resolve(REPO, 'src/services', name), 'utf8')));
  const apiUrl = sourceAsDataUrl(sources[0], paths[0]);
  const [apiClient, authClient, draftClient] = await Promise.all([
    import(apiUrl),
    import(sourceAsDataUrl(sources[1], paths[1], apiUrl)),
    import(sourceAsDataUrl(sources[2], paths[2], apiUrl)),
  ]);
  return { ...apiClient, ...authClient, ...draftClient };
}

function installMemoryBrowser() {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key),
    clear: () => memory.clear(),
  };
  globalThis.window = { dispatchEvent: () => true };
  if (typeof globalThis.CustomEvent !== 'function') globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
}

function installGuardedFetch(options, relativeDraftPath) {
  const nativeFetch = globalThis.fetch;
  requireCheck(typeof nativeFetch === 'function', 'NODE_FETCH_REQUIRED');
  globalThis.fetch = async (input, init = {}) => {
    requireCheck(options.phase !== 'dry-run', 'NETWORK_FORBIDDEN_DURING_DRY_RUN');
    requireCheck(typeof input === 'string', 'UNEXPECTED_FETCH_INPUT');
    const url = new URL(input);
    const method = init.method ?? 'GET';
    const draftPath = `/api/v1${relativeDraftPath}`;
    const authPath = ['/api/v1/auth/login', '/api/v1/auth/me'].includes(url.pathname);
    const ownDraft = url.pathname === draftPath;
    const ownHistory = url.pathname === `${draftPath}/historico`;
    requireCheck(url.origin === API_ORIGIN && !url.username && !url.password && !url.hash, 'NETWORK_TARGET_NOT_ISOLATED_LOOPBACK');
    requireCheck(
      (url.pathname === '/api/v1/auth/login' && method === 'POST' && !url.search) ||
      (url.pathname === '/api/v1/auth/me' && method === 'GET' && !url.search) ||
      (ownDraft && ['GET', 'PUT'].includes(method) && !url.search) ||
      (ownHistory && method === 'GET' && [...url.searchParams.keys()].every((key) => ['limit', 'afterEventoId'].includes(key))),
      'REQUEST_OUTSIDE_OWN_DRAFT_ALLOWLIST'
    );
    requireCheck(!(options.phase === 'verify' && method === 'PUT'), 'WRITES_FORBIDDEN_DURING_VERIFY');
    const headers = new Headers(init.headers);
    if (!authPath) {
      requireCheck([options.marcaId, options.deniedMarcaId].includes(headers.get('X-Marca-Id')), 'UNEXPECTED_BRAND_HEADER');
    }
    const response = await nativeFetch(input, { ...init, redirect: 'error', signal: AbortSignal.timeout(15000) });
    observations.push({ method, path: `${url.pathname}${url.search}`, status: response.status });
    return response;
  };
}

async function credentialsFromProtectedStdin() {
  requireCheck(!process.stdin.isTTY, 'PROTECTED_STDIN_REQUIRED_NO_VISIBLE_PASSWORD_PROMPT');
  const chunks = [];
  let length = 0;
  for await (const chunk of process.stdin) {
    length += chunk.length;
    requireCheck(length <= 16384, 'CREDENTIAL_INPUT_TOO_LARGE');
    chunks.push(chunk);
  }
  let credentials;
  try {
    credentials = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new VerificationError('INVALID_CREDENTIAL_STDIN_JSON');
  } finally {
    for (const chunk of chunks) chunk.fill(0);
  }
  requireCheck(
    credentials && typeof credentials.email === 'string' && credentials.email.trim() &&
    typeof credentials.senha === 'string' && credentials.senha.length > 0,
    'CREDENTIAL_EMAIL_PASSWORD_REQUIRED'
  );
  return credentials;
}

async function expectHttp(action, allowedStatuses, code) {
  try {
    await action();
  } catch (error) {
    requireCheck(allowedStatuses.includes(error?.status), code);
    return error.status;
  }
  throw new VerificationError(code);
}

function verifyProjection(client, fixture, identity) {
  const before = JSON.stringify(fixture);
  const projected = client.projetarPecaSemMidias(fixture);
  equal(JSON.stringify(fixture), before, 'PROJECTION_MUTATED_LOCAL_FIXTURE');
  equal(projected.id, identity.pecaId, 'PIECE_ID_NOT_PRESERVED');
  requireCheck(!('imagemCroquiUrl' in projected), 'CROQUI_BINARY_SENT');
  requireCheck(!('simbologiaImagemUrl' in projected.fichaTecnica), 'SYMBOL_BINARY_SENT');
  const variante = projected.fichaTecnica.variantes[0];
  requireCheck(!('imagemUrl' in variante) && !('imagemUrl' in variante.tecidos[0]), 'MATERIAL_VARIANT_BINARY_SENT');
  equal(variante.imagemAnexoId, `${identity.pecaId}-imagem-principal`, 'MEDIA_METADATA_ID_NOT_PRESERVED');
  equal(variante.imagemNome, 'imagem-principal-simulada.png', 'MEDIA_METADATA_NAME_NOT_PRESERVED');
  equal(projected.fichaTecnica.provaRoupa.fotos, [{ id: `${identity.pecaId}-foto-prova`, nome: 'prova-simulada.png' }], 'PHOTO_METADATA_NOT_PRESERVED');
  equal(variante.tecidos[0].custo, fixture.fichaTecnica.variantes[0].tecidos[0].custo, 'PRICE_STRING_CHANGED');
  equal(variante.tecidos[0].consumoPorTamanho, fixture.fichaTecnica.variantes[0].tecidos[0].consumoPorTamanho, 'SIZE_CONSUMPTION_CHANGED');
  equal(variante.aviamentos[0].quantidade, '2,00000001', 'QUANTITY_STRING_CHANGED');
  return projected;
}

async function verifyClientRejections(client, identity, base) {
  const count = observations.length;
  const invalidFixtures = [
    { ...base, id: `${base.id}-divergente` },
    { ...base, fichaTecnica: { ...base.fichaTecnica, observacoesGerais: 'data:text/plain;base64,bm90YQ==' } },
    { ...base, fichaTecnica: { ...base.fichaTecnica, observacoesGerais: new Blob(['teste']) } },
  ];
  for (const invalid of invalidFixtures) {
    let rejected = false;
    try {
      await client.salvarRascunhoServidor(identity, invalid, null);
    } catch (error) {
      requireCheck(!(error instanceof client.ApiError), 'LOCAL_VALIDATION_REACHED_HTTP');
      rejected = true;
    }
    requireCheck(rejected, 'LOCAL_INVALID_FIXTURE_ACCEPTED');
  }
  equal(observations.length, count, 'LOCAL_INVALID_FIXTURE_SENT_REQUEST');
  checks.clientInvalidIdentityAndUnexpectedBinary = 'rejeitados antes de HTTP, sem remover texto local';
}

function verifySnapshot(snapshot, identity, projected, usuarioId) {
  requireCheck(snapshot !== null, 'EXPECTED_PERSISTED_DRAFT');
  equal(snapshot.identity, identity, 'SNAPSHOT_IDENTITY_CHANGED');
  equal(snapshot.conteudo, projected, 'SERVER_CONTENT_NOT_FAITHFUL');
  equal(snapshot.anexos, [], 'SERVER_ANNEXES_NOT_EMPTY');
  for (const field of ['criadoPor', 'atualizadoPor']) {
    equal(snapshot[field].usuarioId, usuarioId, 'AUDIT_ACTOR_NOT_AUTHENTICATED_USER');
    requireCheck(typeof snapshot[field].nome === 'string' && snapshot[field].nome.trim(), 'AUDIT_ACTOR_NAME_MISSING');
  }
  for (const field of ['criadoEm', 'atualizadoEm']) {
    requireCheck(typeof snapshot[field] === 'string' && snapshot[field].endsWith('Z') && Number.isFinite(Date.parse(snapshot[field])), 'AUDIT_UTC_TIMESTAMP_INVALID');
  }
}

async function verifyHistory(client, identity, baseProjected, winnerProjected, winnerSnapshot, usuarioId) {
  const events = await client.consultarHistoricoRascunhoServidor(identity, { limit: 50 });
  equal(events.length, 2, 'EXPECTED_EXACTLY_TWO_AUDIT_EVENTS');
  equal(events.map((entry) => entry.operation), ['CRIAR', 'ATUALIZAR'], 'AUDIT_OPERATIONS_INVALID');
  requireCheck(events[0].eventoId !== events[1].eventoId, 'DUPLICATE_AUDIT_EVENT_ID');
  equal(events[0].antes, null, 'CREATE_BEFORE_NOT_NULL');
  verifySnapshot(events[0].depois, identity, baseProjected, usuarioId);
  verifySnapshot(events[1].antes, identity, baseProjected, usuarioId);
  verifySnapshot(events[1].depois, identity, winnerProjected, usuarioId);
  equal(events[1].antes, events[0].depois, 'UPDATE_BEFORE_NOT_CREATE_SNAPSHOT');
  equal(events[1].depois, winnerSnapshot, 'AUDIT_WINNER_NOT_CURRENT_SNAPSHOT');
  requireCheck(events[0].depois.revisao !== events[1].depois.revisao, 'UPDATE_REVISION_NOT_CHANGED');
  const after = await client.consultarHistoricoRascunhoServidor(identity, { limit: 50, afterEventoId: events[1].eventoId });
  equal(after, [], 'UNEXPECTED_ADDITIONAL_AUDIT_EVENTS');
  return events;
}

async function main() {
  const options = optionsFromArgs(process.argv.slice(2));
  const identity = {
    pecaId: `mf-homolog-peca-${options.runId}`,
    marcaId: options.marcaId,
    colecaoId: `mf-homolog-colecao-${options.runId}`,
  };
  const path = `/fichas/rascunhos/${encodeURIComponent(identity.colecaoId)}/pecas/${encodeURIComponent(identity.pecaId)}`;
  installMemoryBrowser();
  installGuardedFetch(options, path);
  stage = 'cliente TS real e projeção';
  const client = await loadActualClients();
  requireCheck(client.fichaServerDraftEnabled(), 'ISOLATED_FLAG_NOT_ENABLED');
  const fixtures = Object.fromEntries(['base', 'A', 'B'].map((key) => [key, makeFixture(identity, key)]));
  const originals = Object.fromEntries(Object.entries(fixtures).map(([key, value]) => [key, JSON.stringify(value)]));
  const projections = Object.fromEntries(Object.entries(fixtures).map(([key, value]) => [key, verifyProjection(client, value, identity)]));
  await verifyClientRejections(client, identity, fixtures.base);
  checks.projection = 'preços/quantidades/grade/IDs/metadados preservados; bytes conhecidos retirados somente da cópia';
  if (options.phase === 'dry-run') {
    equal(observations, [], 'DRY_RUN_NETWORK_OCCURRED');
    return { status: 'dry-run concluído; nenhuma rede ou gravação', phase: options.phase, identity, checks, requests: [] };
  }

  stage = 'bloqueio sem autenticação';
  const unauthenticatedGet = await expectHttp(() => client.api.get(path, identity.marcaId), [401, 403], 'UNAUTHENTICATED_READ_NOT_BLOCKED');
  checks.unauthenticatedRead = { observedStatus: unauthenticatedGet, accessBlocked: true, status401Observed: unauthenticatedGet === 401 };
  if (options.phase === 'write') {
    const unauthenticatedPut = await expectHttp(() => client.api.put(path, { schemaVersion: 1, expectedRevision: null, conteudo: projections.base, anexos: [] }, identity.marcaId), [401, 403], 'UNAUTHENTICATED_WRITE_NOT_BLOCKED');
    checks.unauthenticatedWrite = { observedStatus: unauthenticatedPut, accessBlocked: true, status401Observed: unauthenticatedPut === 401 };
  }

  stage = 'login isolado e autorização de marca';
  const credentials = await credentialsFromProtectedStdin();
  let auth;
  try {
    auth = await client.loginApi(credentials.email, credentials.senha);
  } finally {
    credentials.senha = '';
    credentials.email = '';
  }
  requireCheck(typeof auth?.token === 'string' && auth.token.length > 0, 'LOGIN_TOKEN_MISSING');
  localStorage.setItem('modaflow_token', auth.token);
  auth.token = '';
  const me = await client.getMeApi();
  requireCheck(Array.isArray(me?.marcasPermitidas), 'AUTHORIZED_BRANDS_NOT_PROVIDED');
  const brand = me.marcasPermitidas.find((entry) => String(entry.id) === identity.marcaId);
  requireCheck(brand, 'REQUESTED_BRAND_NOT_AUTHORIZED');
  const brandName = String(brand.nome).normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/[^a-z0-9]/giu, '').toLowerCase();
  requireCheck(['kingjoe', 'kingejoe', 'kingandjoe'].includes(brandName), 'ONLY_KING_JOE_BRAND_ALLOWED');
  requireCheck(!me.marcasPermitidas.some((entry) => String(entry.id) === options.deniedMarcaId), 'DENIED_BRAND_IS_ACTUALLY_AUTHORIZED');
  const usuarioId = String(me.id);
  requireCheck(validIdentity(usuarioId), 'AUTHENTICATED_USER_ID_INVALID');
  await expectHttp(() => client.api.get(path, options.deniedMarcaId), [403], 'UNAUTHORIZED_BRAND_READ_NOT_403');
  checks.unauthorizedBrandRead = 403;
  if (options.phase === 'write') {
    await expectHttp(() => client.api.put(path, { schemaVersion: 1, expectedRevision: null, conteudo: { ...projections.base, marcaId: options.deniedMarcaId }, anexos: [] }, options.deniedMarcaId), [403], 'UNAUTHORIZED_BRAND_WRITE_NOT_403');
    checks.unauthorizedBrandWrite = 403;
  }

  let winnerSnapshot;
  let winner;
  if (options.phase === 'write') {
    stage = 'criação exclusiva de rascunho sintético';
    equal(await client.consultarRascunhoServidor(identity), null, 'SYNTHETIC_DRAFT_ALREADY_EXISTS_STOP_NO_OVERWRITE');
    equal(await client.consultarHistoricoRascunhoServidor(identity, { limit: 50 }), [], 'PREEXISTING_SYNTHETIC_HISTORY_STOP');
    const created = await client.salvarRascunhoServidor(identity, fixtures.base, null);
    verifySnapshot(created, identity, projections.base, usuarioId);
    stage = 'duas atualizações concorrentes da mesma revisão';
    const results = await Promise.allSettled(['A', 'B'].map((key) => client.salvarRascunhoServidor(identity, fixtures[key], created.revisao)));
    const successes = results.filter((entry) => entry.status === 'fulfilled');
    const conflicts = results.filter((entry) => entry.status === 'rejected' && entry.reason instanceof client.ApiError && entry.reason.status === 409);
    equal(successes.length, 1, 'CONCURRENT_UPDATES_EXPECTED_ONE_SUCCESS');
    equal(conflicts.length, 1, 'CONCURRENT_UPDATES_EXPECTED_ONE_409');
    winner = results[0].status === 'fulfilled' ? 'A' : 'B';
    winnerSnapshot = successes[0].value;
    verifySnapshot(winnerSnapshot, identity, projections[winner], usuarioId);
    requireCheck(winnerSnapshot.revisao !== created.revisao, 'CONCURRENT_WINNER_REVISION_UNCHANGED');
    equal(await client.consultarRascunhoServidor(identity), winnerSnapshot, 'GET_NOT_CONCURRENT_WINNER');
    checks.concurrency = 'exatamente um sucesso e um HTTP 409 para a mesma revisão esperada';
    stage = 'revisão antiga e conteúdo inválido não criam eventos';
    await expectHttp(() => client.salvarRascunhoServidor(identity, fixtures.base, created.revisao), [409], 'STALE_REVISION_NOT_409');
    const request = { schemaVersion: 1, expectedRevision: winnerSnapshot.revisao, conteudo: projections[winner], anexos: [] };
    await expectHttp(() => client.api.put(path, { ...request, conteudo: { ...request.conteudo, id: `${identity.pecaId}-divergente` } }, identity.marcaId), [400], 'SERVER_INVALID_IDENTITY_NOT_400');
    await expectHttp(() => client.api.put(path, { ...request, conteudo: { ...request.conteudo, unexpectedBinary: 'data:image/png;base64,bmFvLWVudmlhcg==' } }, identity.marcaId), [400], 'SERVER_BINARY_URI_NOT_400');
    checks.serverInvalidIdentityAndBinary = 'HTTP 400; conteúdo original não sobrescrito';
    await expectHttp(() => client.api.put(path, { ...request, anexos: [{}] }, identity.marcaId), [400], 'SERVER_NONEMPTY_ANNEXES_NOT_400');
    // O limite de 1 MiB pertence ao perfil isolado deste teste, não ao ambiente normal.
    await expectHttp(() => client.api.put(path, {
      ...request,
      conteudo: {
        ...request.conteudo,
        fichaTecnica: { ...request.conteudo.fichaTecnica, observacoesGerais: 'x'.repeat(1024 * 1024) },
      },
    }, identity.marcaId), [413], 'ISOLATED_PROFILE_OVERSIZED_DRAFT_NOT_413');
    await expectHttp(() => client.api.get(
      `${path}/historico?limit=50&afterEventoId=00000000-0000-0000-0000-000000000001`, identity.marcaId
    ), [400], 'NONEXISTENT_HISTORY_CURSOR_NOT_400');
    await expectHttp(() => client.api.get(`${path}/historico?limit=0`, identity.marcaId), [400], 'INVALID_HISTORY_LIMIT_NOT_400');
    checks.serverPayloadAndHistoryLimits = 'anexos não vazios/cursor inexistente/limit=0: HTTP 400; payload maior que 1 MiB neste perfil: HTTP 413';
    equal(await client.consultarRascunhoServidor(identity), winnerSnapshot, 'INVALID_REQUEST_CHANGED_DRAFT');
  } else {
    stage = 'leitura após reinício, sem PUT';
    winnerSnapshot = await client.consultarRascunhoServidor(identity);
    requireCheck(winnerSnapshot !== null, 'PERSISTENCE_DRAFT_MISSING_AFTER_RESTART');
    winner = ['A', 'B'].find((key) => {
      try { assert.deepEqual(winnerSnapshot.conteudo, projections[key]); return true; } catch { return false; }
    });
    requireCheck(winner, 'PERSISTED_CONTENT_NOT_KNOWN_CONCURRENT_WINNER');
    verifySnapshot(winnerSnapshot, identity, projections[winner], usuarioId);
    checks.persistence = 'snapshot anterior retornado após novo login; nenhum PUT nesta fase';
  }

  stage = 'auditoria e preservação local';
  const events = await verifyHistory(client, identity, projections.base, projections[winner], winnerSnapshot, usuarioId);
  for (const [key, fixture] of Object.entries(fixtures)) equal(JSON.stringify(fixture), originals[key], 'LOCAL_FIXTURE_CHANGED_AFTER_HTTP');
  checks.audit = 'exatamente dois eventos: CRIAR e ATUALIZAR; antes/depois, UTC, autor e revisão conferidos';
  return {
    status: 'verificações HTTP concluídas', phase: options.phase, identity, winner,
    revisao: winnerSnapshot.revisao, eventoIds: events.map((entry) => entry.eventoId), checks,
    requests: observations,
    limitations: [
      'Não verifica telas do navegador, upload real de arquivos ou integração ERP.',
      'Este driver não conecta SQL nem comprova contagens globais de tabelas; a raiz confere essas evidências separadamente.',
      'O reinício do backend é feito externamente; verify apenas confere os mesmos dados após novo login.',
      'HTTP 403 sem token é registrado como bloqueio de acesso, não como conformidade com HTTP 401.',
      'Falha de gravação da auditoria é coberta apenas por testes unitários; este driver não altera permissões/triggers para provocá-la no SQL.',
    ],
  };
}

try {
  const result = await main();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  // Não imprimir mensagem/stack/body do cliente: podem conter fontes ou segredos.
  console.error(JSON.stringify({ status: 'falhou; não prosseguir além desta fronteira', stage, code: error instanceof VerificationError ? error.code : 'UNEXPECTED_FAILURE', httpStatus: Number.isInteger(error?.status) ? error.status : null, checks, requests: observations }, null, 2));
  process.exitCode = 1;
} finally {
  if (globalThis.localStorage) globalThis.localStorage.clear();
}
