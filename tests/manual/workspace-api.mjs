/** Fixture and API smoke checks for the isolated QA backend only (port 18080, Linx disabled). */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const base = 'http://127.0.0.1:18080/api/v1';
if (!process.env.AKR_QA_PASSWORD) throw new Error('Set AKR_QA_PASSWORD to the isolated dev account password.');
const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@akrbrands.com.br', senha: process.env.AKR_QA_PASSWORD }) }).then(r => r.json());
assert.ok(login.token);
const headers = { Authorization: 'Bearer ' + login.token, 'X-Marca-Id': '1', 'Content-Type': 'application/json' };
async function request(path, method = 'GET', body) {
  const response = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(data)}`);
  return data;
}
async function save(kind, id, data) {
  const previous = (await request('/workspace/' + kind)).find(r => r.id === id);
  return request(`/workspace/${kind}/${id}`, 'PUT', { expectedRevision: previous?.revision ?? null, data });
}
const rows = await request('/workspace/products');
const original = rows.find(r => r.data.codigo === 'QA-001');
assert.ok(original, 'Create QA-001 in the isolated UI first.');
assert.match(original.data.colecaoNome, /Validação isolada/);
await save('teams', 'qa-team', { nome: 'Ateliê de teste', designadoProduto: true });
await save('piece-types', 'qa-bata', { nome: 'Bata', categoria: 'Vestuário', grade: 'P,M,G', medidas: 'Busto\nComprimento' });
await save('tags', 'qa-capsula', { nome: 'Cápsula · teste', grupo: 'Tema' });
await save('fixed-costs', 'qa-rateio', { nome: 'Estrutura · teste', categoria: 'Operação', valor: 500, periodicidade: 'Por lote', criterio: 'Unidades do lote', unidadesBase: 100 });
await save('pricing', 'qa-markup', { nome: 'Markup 2,5 · teste', modo: 'markup', fator: 2.5, prioridade: 10, escopo: 'Marca' });
await save('flows', 'qa-fluxo', { nome: 'Conferência isolada', etapas: '03 modelagem\n10 corte\n20 Final', inicial: '03 modelagem', final: '20 Final', prazoDias: 3, exigirPrazo: true, exigirResponsavel: true, teamId: 'qa-team', time: 'Ateliê de teste' });
const data = { ...original.data, tipo: 'Bata', typeId: 'qa-bata', team: 'Ateliê de teste', teamId: 'qa-team', flowId: 'qa-fluxo', fluxo: 'Conferência isolada', etapaAtual: '03 modelagem', responsavel: 'Administrador AKR', responsavelId: '1', previsaoEntrega: '2026-10-30', status: 'Em andamento', tagIds: [...new Set([...(original.data.tagIds ?? []), 'qa-capsula'])], fichaTecnica: { ...original.data.fichaTecnica, nomeProduto: original.data.nome, variantes: [{ id: 'principal', nome: 'Natural', tecidos: [{ id: 'qa-tecido', nome: 'Linho de conferência', codigo: 'T-QA', temErp: false, fornecedores: '', custo: '40', unidade: 'Metros', consumo: '1,5' }], aviamentos: [{ id: 'qa-aviamento', nome: 'Botão de conferência', codigo: 'A-QA', temErp: false, fornecedores: '', custo: '5', unidade: 'Unidade', quantidade: '1' }], custos: { quantidadeProducao: '100' }, precificacao: { modo: 'markup', markup: '2,5', margemLucro: '', precoAprovado: '190', baseCusto: 'producao' } }], terceiros: [{ id: 'qa-servico', tipo: 'Costura', fornecedor: '', codigoFornecedor: '', observacoes: '', tela: '', traducao: '', tecnicas: '', variantes: ['principal'], custosProcesso: [{ id: 'qa-custo', valor: '10', observacao: 'Por unidade' }] }] } };
const saved = await save('products', original.id, data);
const conflict = await fetch(base + `/workspace/products/${saved.id}`, { method: 'PUT', headers, body: JSON.stringify({ expectedRevision: saved.revision - 1, data: { ...saved.data, nome: 'Não deve sobrescrever' } }) });
assert.equal(conflict.status, 409);
const foreign = await fetch(base + `/workspace/products/${saved.id}/attachments`, { headers: { ...headers, 'X-Marca-Id': '2' } });
assert.equal(foreign.status, 404);
const form = new FormData(); form.set('category', 'outros'); form.set('file', new Blob(['Arquivo de conferência isolada.'], { type: 'text/plain' }), 'conferencia.txt');
const binaryHeaders = { Authorization: headers.Authorization, 'X-Marca-Id': '1' };
const uploaded = await fetch(base + `/workspace/products/${saved.id}/attachments/qa-file`, { method: 'PUT', headers: binaryHeaders, body: form });
assert.equal(uploaded.status, 200);
const download = await fetch(base + `/workspace/products/${saved.id}/attachments/qa-file`, { headers: binaryHeaders });
assert.equal(await download.text(), 'Arquivo de conferência isolada.');
await writeFile('docs/akr-api-validation.json', JSON.stringify({ checkedAt: new Date().toISOString(), environment: base, product: saved.id, checks: { realPersistence: true, revisionConflict409: true, crossBrandNotFound404: true, attachmentRoundTrip: true }, note: 'Apply the fixed-cost and pricing rules in the UI to complete the 80/200/8000 scenario.' }, null, 2));
console.log('QA fixture ready; persistence, conflict, brand isolation and attachment round-trip passed.');
