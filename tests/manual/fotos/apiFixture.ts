export class ApiError extends Error {}
const blocked = async () => {
  throw new Error('API externa bloqueada no teste de fotos.');
};
export const api = {
  async get(path: string) {
    return path === '/linx/opcoes'
      ? { subgrupos: [], linhas: [], grades: [], griffes: [], categorias: [] }
      : [];
  },
  post: blocked,
  put: blocked,
  patch: blocked,
  delete: blocked,
  download: blocked,
};
