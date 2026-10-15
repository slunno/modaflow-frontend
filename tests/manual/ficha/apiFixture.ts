export class ApiError extends Error {}
const opcoes = { subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] };
export const api = {
  async get(path: string) {
    if (path === '/linx/opcoes') return opcoes;
    return [];
  },
  async post(path: string) {
    if (path !== '/fichas/conferencia') throw new Error('Operação não permitida no teste isolado.');
    return { valida: true, pendencias: [] };
  },
  async put() {
    throw new Error('Gravações externas desativadas no teste.');
  },
  async patch() {
    throw new Error('Gravações externas desativadas no teste.');
  },
  async delete() {
    throw new Error('Gravações externas desativadas no teste.');
  },
};
