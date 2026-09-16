/**
 * ============================================================================
 * SERVIÇO: API Client
 * ARQUIVO: src/services/api.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Cliente HTTP centralizado para comunicação com o backend Spring Boot.
 *            Injeta automaticamente o token JWT e o header X-Marca-Id em todas as requisições.
 * ============================================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Retorna os headers padrão para todas as requisições à API.
 */
function getHeaders(marcaId?: string): Record<string, string> {
  const token = localStorage.getItem('modaflow_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const activeMarcaRaw = localStorage.getItem('modaflow_active_marca');
  const savedMarcaId = activeMarcaRaw
    ? (JSON.parse(activeMarcaRaw) as { id?: string }).id
    : undefined;
  const tenantId = marcaId ?? savedMarcaId;
  if (tenantId) {
    headers['X-Marca-Id'] = tenantId;
  }
  return headers;
}

/**
 * Realiza uma requisição POST genérica para a API.
 */
async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const errorData = data as { message?: string };
    throw new Error(errorData.message ?? `Erro ${response.status}: ${response.statusText}`);
  }

  return data as T;
}

/**
 * Realiza uma requisição GET genérica para a API.
 */
async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const errorData = data as { message?: string };
    throw new Error(errorData.message ?? `Erro ${response.status}: ${response.statusText}`);
  }

  return data as T;
}

export const api = { post, get };
