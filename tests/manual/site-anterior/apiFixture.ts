import { brands } from './AuthFixture';

export class ApiError extends Error {}
export const getHeaders = () => ({ 'Content-Type': 'application/json' });
const blocked = async () => {
  throw new Error('Gravação desativada na prévia isolada.');
};
export const api = {
  async get(path: string) {
    const url = new URL(path, 'http://preview.invalid');
    if (url.pathname === '/marcas') return brands;
    if (url.pathname === '/linx/conexao')
      return {
        servidor: 'Simulado',
        banco: 'FIXTURE',
        bancoEsperado: 'FIXTURE',
        bancoEsperadoConfirmado: true,
        credencialSomenteLeitura: true,
        integracaoSomenteLeitura: true,
        permissoesEscritaDetectadas: [],
      };
    if (url.pathname === '/linx/produtos-validos')
      return {
        items: [],
        page: 0,
        size: 50,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        sourceDatabase: 'FIXTURE',
        readOnly: true,
      };
    if (url.pathname === '/linx/colecoes-validas')
      return [
        {
          codigo: 'TESTE-01',
          nome: 'Coleção de demonstração',
          griffeProduto: url.searchParams.get('griffe'),
          griffeColecao: url.searchParams.get('griffe'),
          dataInicio: '2026-01-01',
          dataFinal: '2026-12-31',
          temporada: 'Teste',
          quantidadeProdutos: 0,
        },
      ];
    if (url.pathname === '/dashboard/metrics' || url.pathname === '/dashboard/graficos') return {};
    return [];
  },
  post: blocked,
  put: blocked,
  patch: blocked,
  delete: blocked,
};
