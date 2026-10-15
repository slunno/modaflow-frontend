import type { LinxColecaoValida } from '../../../src/types/linx';

export class ApiError extends Error {}

export const api = {
  async get(path: string) {
    const url = new URL(path, 'http://preview.local');
    if (url.pathname === '/linx/colecoes-validas') {
      const griffe = url.searchParams.get('griffe') ?? 'KING&JOE';
      return Array.from({ length: 4 }, (_, index): LinxColecaoValida => ({
        codigo: `TESTE-${index + 1}`,
        nome: `${griffe} — Coleção finalizada ${index + 1}`,
        griffeProduto: griffe,
        griffeColecao: griffe,
        dataInicio: null,
        dataFinal: null,
        temporada: null,
        quantidadeProdutos: (index + 1) * 10,
      }));
    }
    return [];
  },
  async post() {
    throw new Error('Gravações externas desativadas no preview de marcas.');
  },
  async put() {
    throw new Error('Gravações externas desativadas no preview de marcas.');
  },
  async patch() {
    throw new Error('Gravações externas desativadas no preview de marcas.');
  },
  async delete() {
    throw new Error('Gravações externas desativadas no preview de marcas.');
  },
};
