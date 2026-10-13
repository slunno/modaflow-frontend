import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, ApiError, getHeaders } from '../services/api';
import { loginApi } from '../services/authService';

describe('Auth Service & API Client Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getHeaders', () => {
    it('returns application/json header when unauthenticated', () => {
      const headers = getHeaders();
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBeUndefined();
      expect(headers['X-Marca-Id']).toBeUndefined();
    });

    it('injects Bearer token and active tenant brand header', () => {
      localStorage.setItem('modaflow_token', 'jwt-token-xyz');
      localStorage.setItem('modaflow_active_marca', JSON.stringify({ id: 'marca-99' }));

      const headers = getHeaders();
      expect(headers['Authorization']).toBe('Bearer jwt-token-xyz');
      expect(headers['X-Marca-Id']).toBe('marca-99');
    });

    it('allows overriding marcaId via parameter', () => {
      localStorage.setItem('modaflow_token', 'jwt-token-xyz');
      localStorage.setItem('modaflow_active_marca', JSON.stringify({ id: 'marca-99' }));

      const headers = getHeaders('marca-123');
      expect(headers['X-Marca-Id']).toBe('marca-123');
    });
  });

  describe('loginApi failure handling (No Mock Fallback)', () => {
    it('throws ApiError on 401 invalid credentials without falling back to mock user', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Credenciais inválidas' }), {
          status: 401,
          statusText: 'Unauthorized',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const unauthorizedSpy = vi.fn();
      window.addEventListener('modaflow_unauthorized', unauthorizedSpy);

      await expect(loginApi('invalido@teste.com', 'senhaerrada')).rejects.toThrow(ApiError);

      // Asserts that tokens were cleared and unauthorized event was fired
      expect(localStorage.getItem('modaflow_token')).toBeNull();
      expect(unauthorizedSpy).toHaveBeenCalled();

      window.removeEventListener('modaflow_unauthorized', unauthorizedSpy);
    });

    it('throws ApiError on 500 server error without mocking login', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Internal Server Error' }), {
          status: 500,
          statusText: 'Server Error',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(loginApi('admin@modaflow.com', 'admin123')).rejects.toThrow(
        'Internal Server Error'
      );
    });
  });

  describe('Network error handling', () => {
    it('creates an ApiError with isNetworkError = true when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      try {
        await api.get('/auth/me');
        expect.unreachable('Should have thrown an error');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.isNetworkError).toBe(true);
        expect(apiError.status).toBe(0);
        expect(apiError.message).toContain('Falha de conexão com a API');
      }
    });
  });
});
