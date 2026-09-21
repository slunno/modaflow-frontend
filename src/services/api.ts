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

async function readResponseBody(response: Response): Promise<unknown> {
  const rawBody = await response.text();
  if (!rawBody) return null;

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

function getHttpErrorMessage(response: Response, data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof data === 'string' && data.trim()) return data;
  if (response.status === 401 || response.status === 403) {
    return 'Sessão não autenticada ou sem permissão para consultar este recurso.';
  }
  return 'Erro ' + response.status + ': ' + response.statusText;
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

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(getHttpErrorMessage(response, data));
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

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(getHttpErrorMessage(response, data));
  }

  return data as T;
}

export const api = { post, get };
