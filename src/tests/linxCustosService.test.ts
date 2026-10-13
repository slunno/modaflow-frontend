import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../services/api';
import { getLinxFichaCustos } from '../services/linxService';
import type { LinxFichaCustos } from '../types/linx';
vi.mock('../services/api', () => ({ api: { get: vi.fn() } }));
const dados: LinxFichaCustos = {
  versaoIntegracao: 'custos-v2',
  versao: {
    produto: 'BM28007',
    versao: '00001',
    descricao: null,
    dataCriacao: null,
    responsavel: null,
    status: null,
    colecaoCodigo: null,
    colecaoNome: null,
  },
  bancoOrigem: 'HOMOLOG_COBRANCA',
  tamanhos: [],
  materiais: [],
  fornecedores: [],
  operacoes: [],
  outrosCustos: [],
  precosProduto: [],
  diagnostico: [],
  avisos: [],
};
const consultar = () =>
  getLinxFichaCustos('BM28007', '00001', 'KING&JOE', '028', '28 - INVERNO 2027', true);
describe('Contrato da consulta de custos', () => {
  beforeEach(() => vi.clearAllMocks());
  it('envia GET com versão e identidade explícita da coleção e griffe', async () => {
    vi.mocked(api.get).mockResolvedValue(dados);
    expect(await consultar()).toBe(dados);
    const url = new URL(vi.mocked(api.get).mock.calls[0]![0], 'http://localhost');
    expect(url.pathname).toBe('/linx/produtos/BM28007/fichas/00001/custos/v2');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      griffe: 'KING&JOE',
      colecao: '028',
      descColecao: '28 - INVERNO 2027',
      legado: 'true',
    });
  });
  it('resposta de backend incompatível não vira dados vazios silenciosos', async () => {
    vi.mocked(api.get).mockResolvedValue({ materiais: [] });
    await expect(consultar()).rejects.toThrow('Resposta de custos incompatível');
  });
  it('não aceita uma resposta parcial da integração antiga', async () => {
    vi.mocked(api.get).mockResolvedValue({ ...dados, versaoIntegracao: 'custos-v1' });
    await expect(consultar()).rejects.toThrow('Resposta de custos incompatível');
  });
  it('rejeita dados de outra peça ou versão', async () => {
    vi.mocked(api.get).mockResolvedValue({
      ...dados,
      versao: { ...dados.versao, produto: 'OUTRA' },
    });
    await expect(consultar()).rejects.toThrow('não pertencem à peça e versão');
    vi.mocked(api.get).mockResolvedValue({
      ...dados,
      versao: { ...dados.versao, versao: '00002' },
    });
    await expect(consultar()).rejects.toThrow('não pertencem à peça e versão');
  });
});
