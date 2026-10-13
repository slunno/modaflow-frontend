/**
 * ============================================================================
 * SERVIÇO: API Client
 * ARQUIVO: src/services/api.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Cliente HTTP centralizado para comunicação com o backend Spring Boot.
 *            Injeta automaticamente o token JWT e o header X-Marca-Id em todas
 *            as requisições. Tipifica erros preservando status HTTP e mensagem,
 *            trata 401 invalidando a sessão e expõe métodos REST completos.
 * ============================================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Erro centralizado de comunicação com a API REST.
 * Preserva o status HTTP, texto de status e corpo estruturado de resposta.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: unknown;
  public readonly isNetworkError: boolean;

  constructor(
    message: string,
    status = 0,
    statusText = '',
    data: unknown = null,
    isNetworkError = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.isNetworkError = isNetworkError;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Retorna os headers padrão para todas as requisições à API.
 */
export function getHeaders(marcaId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window === 'undefined') return headers;

  const token = localStorage.getItem('modaflow_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const activeMarcaRaw = localStorage.getItem('modaflow_active_marca');
  const savedMarcaId = activeMarcaRaw
    ? (JSON.parse(activeMarcaRaw) as { id?: string | number }).id
    : undefined;

  const tenantId = marcaId ?? (savedMarcaId != null ? String(savedMarcaId) : undefined);
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

  if (response.status === 401) {
    return 'Sessão expirada ou não autenticada. Faça login novamente.';
  }
  if (response.status === 403) {
    return 'Acesso negado: seu perfil não tem permissão para esta marca ou operação.';
  }
  if (response.status === 404) {
    return 'Recurso não encontrado no servidor (404).';
  }
  if (response.status === 502 || response.status === 503) {
    return 'Backend indisponível. Verifique se o modaflow-backend está ativo na porta 8080.';
  }
  return `Erro ${response.status}: ${response.statusText || 'Falha na requisição'}`;
}

async function executeRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  marcaId?: string,
  binary = false
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let response: Response;

  try {
    const headers = getHeaders(marcaId);
    if (body instanceof FormData) delete headers['Content-Type'];
    response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Falha na conexão de rede com o servidor.';
    throw new ApiError(`Falha de conexão com a API: ${errorMsg}`, 0, 'NETWORK_ERROR', null, true);
  }

  if (response.ok && binary) return (await response.blob()) as T;
  const data = await readResponseBody(response);

  if (!response.ok) {
    // 401 Unauthorized encerra a sessão ativa e notifica a aplicação
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('modaflow_token');
      localStorage.removeItem('modaflow_user');
      localStorage.removeItem('modaflow_active_marca');
      window.dispatchEvent(new CustomEvent('modaflow_unauthorized'));
    }

    const message = getHttpErrorMessage(response, data);
    throw new ApiError(message, response.status, response.statusText, data);
  }

  return data as T;
}

export const api = {
  download: (path: string, marcaId: string) =>
    executeRequest<Blob>(path, 'GET', undefined, marcaId, true),
  get: <T>(path: string, marcaId?: string) => executeRequest<T>(path, 'GET', undefined, marcaId),
  post: <T>(path: string, body?: unknown, marcaId?: string) =>
    executeRequest<T>(path, 'POST', body, marcaId),
  put: <T>(path: string, body?: unknown, marcaId?: string) =>
    executeRequest<T>(path, 'PUT', body, marcaId),
  patch: <T>(path: string, body?: unknown, marcaId?: string) =>
    executeRequest<T>(path, 'PATCH', body, marcaId),
  delete: <T>(path: string, marcaId?: string) =>
    executeRequest<T>(path, 'DELETE', undefined, marcaId),
};
