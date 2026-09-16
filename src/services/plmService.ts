/**
 * ============================================================================
 * SERVIÇO: PLM Service
 * ARQUIVO: src/services/plmService.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Camada de serviço de domínio para dados de produtos (peças),
 *            coleções, métricas operacionais de dashboard, BI e notificações.
 *            Isola componentes da UI do consumo direto de dados em memória / mock,
 *            preparado para integração transparente com endpoints REST reais.
 * ============================================================================
 */

import type {
  PecaItem,
  ColecaoItem,
  NotificationItem,
  DashboardMetricDetail,
  GraficoDimensaoMetric,
  ProductFilters,
} from '../types/plm';
import type { MarcaSummary } from '../types/auth';
import { api } from './api';

import { MOCK_NOTIFICACOES, MOCK_ETAPAS_METRICS, MOCK_BI_DATA } from '../constants/mockData';

// Cache em memória para permitir mutações controladas de notificações na sessão
let notificationsCache: NotificationItem[] = [...MOCK_NOTIFICACOES];

/**
 * Retorna as marcas cadastradas no sistema via API REST.
 */
export async function getBrands(): Promise<MarcaSummary[]> {
  try {
    const data = await api.get<MarcaSummary[]>('/marcas');
    if (data && Array.isArray(data)) {
      return data;
    }
  } catch {
    // API endpoint indisponível
  }
  return [];
}

/**
 * Retorna a lista de produtos (peças) aplicando filtros opcionais via API.
 */
export async function getProducts(filters?: ProductFilters): Promise<PecaItem[]> {
  let pecas: PecaItem[] = [];
  try {
    const data = await api.get<PecaItem[]>('/products');
    if (data && Array.isArray(data)) {
      pecas = data;
    }
  } catch {
    pecas = [];
  }

  if (!filters) return pecas;

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    pecas = pecas.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term) ||
        p.etapaAtual.toLowerCase().includes(term)
    );
  }

  if (filters.marca) {
    pecas = pecas.filter((p) => p.marcaNome === filters.marca);
  }

  if (filters.etapas && filters.etapas.length > 0) {
    const etapasLower = filters.etapas.map((e) => e.toLowerCase());
    pecas = pecas.filter((p) => etapasLower.includes(p.etapaAtual.toLowerCase()));
  }

  if (filters.tipos && filters.tipos.length > 0) {
    const tiposLower = filters.tipos.map((t) => t.toLowerCase());
    pecas = pecas.filter((p) => tiposLower.includes(p.tipo.toLowerCase()));
  }

  if (filters.statusPeca) {
    pecas = pecas.filter((p) => p.status === filters.statusPeca);
  }

  if (filters.colecoes && filters.colecoes.length > 0) {
    pecas = pecas.filter((p) => filters.colecoes!.includes(p.colecaoNome));
  }

  if (filters.tecido) {
    const tecidoTerm = filters.tecido.toLowerCase();
    pecas = pecas.filter((p) => p.tecidos.some((t) => t.toLowerCase().includes(tecidoTerm)));
  }

  return pecas;
}

/**
 * Busca uma peça específica por identificador.
 */
export async function getProductById(id: string): Promise<PecaItem | null> {
  try {
    const peca = await api.get<PecaItem>(`/products/${id}`);
    if (peca) return peca;
  } catch {
    // API endpoint indisponível
  }
  return null;
}

/**
 * Retorna as coleções da marca ou de todas as marcas via API.
 */
export async function getCollections(marcaId?: string): Promise<ColecaoItem[]> {
  try {
    const endpoint = marcaId ? `/colecoes?marcaId=${marcaId}` : '/colecoes';
    const data = await api.get<ColecaoItem[]>(endpoint);
    if (data && Array.isArray(data)) {
      return data;
    }
  } catch {
    // API endpoint indisponível
  }
  return [];
}

/**
 * Retorna as métricas detalhadas de permanência por etapa da produção.
 */
export async function getDashboardMetrics(): Promise<Record<string, DashboardMetricDetail>> {
  try {
    const data = await api.get<Record<string, DashboardMetricDetail>>('/dashboard/metrics');
    if (data) return data;
  } catch {
    // Fallback
  }
  return { ...MOCK_ETAPAS_METRICS };
}

/**
 * Retorna métricas analíticas agregadas por dimensão (BI).
 */
export async function getBiMetrics(agrupamento: string): Promise<GraficoDimensaoMetric[]> {
  try {
    const data = await api.get<GraficoDimensaoMetric[]>(`/bi/metrics?agrupamento=${agrupamento}`);
    if (data && Array.isArray(data)) return data;
  } catch {
    // Fallback
  }
  return MOCK_BI_DATA[agrupamento] || MOCK_BI_DATA['Marca'] || [];
}

/**
 * Retorna a lista de notificações da central.
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const data = await api.get<NotificationItem[]>('/notifications');
    if (data && Array.isArray(data)) return data;
  } catch {
    // Fallback
  }
  return [...notificationsCache];
}

/**
 * Marca uma notificação individual como lida.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await api.post(`/notifications/${id}/read`, {});
  } catch {
    // Fallback
  }
  notificationsCache = notificationsCache.map((item) =>
    item.id === id ? { ...item, lida: true } : item
  );
}

/**
 * Marca todas as notificações como lidas.
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.post('/notifications/read-all', {});
  } catch {
    // Fallback
  }
  notificationsCache = notificationsCache.map((item) => ({ ...item, lida: true }));
}

export const plmService = {
  getBrands,
  getProducts,
  getProductById,
  getCollections,
  getDashboardMetrics,
  getBiMetrics,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
