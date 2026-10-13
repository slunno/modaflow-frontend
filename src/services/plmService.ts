/**
 * ============================================================================
 * SERVIÇO: PLM Service
 * ARQUIVO: src/services/plmService.ts
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Camada de serviço de domínio para dados de produtos (peças),
 *            coleções, métricas operacionais de dashboard, BI e notificações.
 *            Conecta aos endpoints reais do backend Spring Boot (/marcas,
 *            /colecoes, /pecas, /dashboard/metrics, /dashboard/graficos, /insumos, /kanban).
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
import type {
  MarcaResponseDTO,
  ColecaoResponseDTO,
  ColecaoDetalheResponseDTO,
  CriarColecaoRequestDTO,
  AtualizarColecaoRequestDTO,
  PecaResponseDTO,
  CriarPecaRequestDTO,
  AtualizarPecaRequestDTO,
  DashboardMetricsResponseDTO,
  GraficosBIResponseDTO,
  InsumoResponseDTO,
  CriarInsumoRequestDTO,
  AtualizarInsumoRequestDTO,
  PageResponseDTO,
  PecaKanbanResponseDTO,
  EtapaPecaEnum,
  StatusColecaoEnum,
} from '../types/dtos';
import { api, ApiError } from './api';
import {
  mapMarcaDtoToSummary,
  mapColecaoDtoToItem,
  mapPecaDtoToItem,
  mapDashboardMetricsDto,
  mapInsumoDtoToTecidoItem,
} from './contractMappers';
import type { TecidoInsumoItem } from '../types/gestao';

// Armazenamento em memória para notificações locais (quando backend não possui controlador)
let notificationsCache: NotificationItem[] = [];

// ── MARCAS ──

/**
 * Retorna as marcas cadastradas no sistema via API REST (/marcas).
 * Lança ApiError em caso de falha para a UI tratar os estados.
 */
export async function getBrands(): Promise<MarcaSummary[]> {
  const data = await api.get<MarcaResponseDTO[]>('/marcas');
  if (Array.isArray(data)) {
    return data.map(mapMarcaDtoToSummary);
  }
  return [];
}

/**
 * Cria uma nova marca no sistema (/marcas).
 */
export async function createBrand(brand: {
  nome: string;
  code: string;
  initials?: string;
  heroImageUrl?: string;
  logoUrl?: string;
  description?: string;
  badgeTag?: string;
}): Promise<MarcaSummary> {
  const data = await api.post<MarcaResponseDTO>('/marcas', brand);
  return mapMarcaDtoToSummary(data);
}

/**
 * Atualiza uma marca existente (/marcas/{id}).
 */
export async function updateBrand(
  id: string | number,
  brand: {
    nome?: string;
    code?: string;
    initials?: string;
    heroImageUrl?: string;
    logoUrl?: string;
    description?: string;
    badgeTag?: string;
  }
): Promise<MarcaSummary> {
  const data = await api.put<MarcaResponseDTO>(`/marcas/${id}`, brand);
  return mapMarcaDtoToSummary(data);
}

// ── COLEÇÕES ──

/**
 * Retorna as coleções da marca ativa via API REST (/colecoes).
 */
export async function getCollections(
  status?: StatusColecaoEnum,
  marcaId?: string
): Promise<ColecaoItem[]> {
  const query = status ? `?status=${status}` : '';
  const data = await api.get<ColecaoResponseDTO[]>(`/colecoes${query}`, marcaId);
  if (Array.isArray(data)) {
    return data.map((dto) => mapColecaoDtoToItem(dto));
  }
  return [];
}

/**
 * Busca detalhes completos de uma coleção com sua lista de peças (/colecoes/{id}).
 */
export async function getCollectionDetail(
  id: string | number,
  marcaId?: string
): Promise<{ colecao: ColecaoItem; pecas: PecaItem[] }> {
  const data = await api.get<ColecaoDetalheResponseDTO>(`/colecoes/${id}`, marcaId);
  const colecao = mapColecaoDtoToItem(data);
  const pecas = Array.isArray(data.pecas)
    ? data.pecas.map((p) => mapPecaDtoToItem(p, colecao.marcaNome))
    : [];
  return { colecao, pecas };
}

/**
 * Cadastra nova coleção no backend (/colecoes).
 */
export async function createCollection(
  request: CriarColecaoRequestDTO,
  marcaId?: string
): Promise<ColecaoItem> {
  const data = await api.post<ColecaoResponseDTO>('/colecoes', request, marcaId);
  return mapColecaoDtoToItem(data);
}

/**
 * Atualiza coleção existente (/colecoes/{id}).
 */
export async function updateCollection(
  id: string | number,
  request: AtualizarColecaoRequestDTO,
  marcaId?: string
): Promise<ColecaoItem> {
  const data = await api.put<ColecaoResponseDTO>(`/colecoes/${id}`, request, marcaId);
  return mapColecaoDtoToItem(data);
}

// ── PEÇAS (CONTRATO REAL /pecas) ──

/**
 * Retorna a lista de produtos (peças) aplicando filtros opcionais via API /pecas.
 */
export async function getProducts(filters?: ProductFilters, marcaId?: string): Promise<PecaItem[]> {
  const response = await api.get<PageResponseDTO<PecaResponseDTO> | PecaResponseDTO[]>(
    '/pecas?page=0&size=100',
    marcaId
  );

  let rawList: PecaResponseDTO[] = [];
  if (Array.isArray(response)) {
    rawList = response;
  } else if (response && Array.isArray(response.content)) {
    rawList = response.content;
  }

  let pecas = rawList.map((p) => mapPecaDtoToItem(p));

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

  return pecas;
}

/**
 * Busca uma peça específica por identificador (/pecas/{id}).
 */
export async function getProductById(id: string, marcaId?: string): Promise<PecaItem | null> {
  const data = await api.get<PecaResponseDTO>(`/pecas/${id}`, marcaId);
  return data ? mapPecaDtoToItem(data) : null;
}

/**
 * Cadastra nova peça no backend (/pecas).
 */
export async function createPeca(
  payload: CriarPecaRequestDTO,
  marcaId?: string
): Promise<PecaItem> {
  const data = await api.post<PecaResponseDTO>('/pecas', payload, marcaId);
  return mapPecaDtoToItem(data);
}

/**
 * Atualiza dados da peça (/pecas/{id}).
 */
export async function updatePeca(
  id: string | number,
  payload: AtualizarPecaRequestDTO,
  marcaId?: string
): Promise<PecaItem> {
  const data = await api.put<PecaResponseDTO>(`/pecas/${id}`, payload, marcaId);
  return mapPecaDtoToItem(data);
}

/**
 * Move a peça para uma nova etapa do fluxo (/pecas/{id}/etapa).
 */
export async function movePecaEtapa(
  id: string | number,
  novaEtapa: EtapaPecaEnum,
  marcaId?: string
): Promise<PecaItem> {
  const data = await api.patch<PecaResponseDTO>(
    `/pecas/${id}/etapa?novaEtapa=${novaEtapa}`,
    {},
    marcaId
  );
  return mapPecaDtoToItem(data);
}

// ── KANBAN ──

/**
 * Obtém as peças agrupadas para o quadro Kanban (/kanban).
 */
export async function getKanbanPecas(marcaId?: string): Promise<PecaKanbanResponseDTO[]> {
  const data = await api.get<PecaKanbanResponseDTO[]>('/kanban', marcaId);
  return Array.isArray(data) ? data : [];
}

/**
 * Move peça no Kanban (/kanban/pecas/{id}/etapa).
 */
export async function moveKanbanPeca(
  id: string | number,
  novaEtapa: EtapaPecaEnum,
  marcaId?: string
): Promise<void> {
  await api.patch<void>(`/kanban/pecas/${id}/etapa?novaEtapa=${novaEtapa}`, {}, marcaId);
}

// ── DASHBOARD & BI (CONTRATOS REAIS /dashboard/metrics e /dashboard/graficos) ──

/**
 * Retorna as métricas detalhadas de permanência por etapa via API /dashboard/metrics.
 */
export async function getDashboardMetrics(
  marcaId?: string
): Promise<Record<string, DashboardMetricDetail>> {
  const data = await api.get<DashboardMetricsResponseDTO>('/dashboard/metrics', marcaId);
  return mapDashboardMetricsDto(data);
}

/**
 * Retorna métricas analíticas agregadas via API /dashboard/graficos.
 */
export async function getBiMetrics(
  _agrupamento: string,
  marcaId?: string
): Promise<GraficoDimensaoMetric[]> {
  try {
    const data = await api.get<GraficosBIResponseDTO>('/dashboard/graficos', marcaId);
    if (!data) return [];

    if (
      data.distribuicaoCustoPorCategoria &&
      Object.keys(data.distribuicaoCustoPorCategoria).length > 0
    ) {
      return Object.entries(data.distribuicaoCustoPorCategoria).map(([categoria, valor]) => ({
        rotulo: categoria,
        quantidade: Math.round(valor),
      }));
    }

    if (data.evolucaoProducaoMensal && data.evolucaoProducaoMensal.length > 0) {
      return data.evolucaoProducaoMensal.map((item) => ({
        rotulo: String(item.mes || item.periodo || 'Mês'),
        quantidade: Number(item.total || item.quantidade || 0),
      }));
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      // Endpoint ainda não configurado para o agrupamento específico
      return [];
    }
    throw err;
  }
  return [];
}

// ── INSUMOS (TECIDOS E AVIAMENTOS) ──

/**
 * Retorna lista de insumos paginados por tipo (/insumos?tipo=TECIDO ou AVIAMENTO).
 */
export async function getInsumos(
  tipo: 'TECIDO' | 'AVIAMENTO',
  marcaId?: string
): Promise<TecidoInsumoItem[]> {
  const data = await api.get<PageResponseDTO<InsumoResponseDTO> | InsumoResponseDTO[]>(
    `/insumos?tipo=${tipo}&page=0&size=100`,
    marcaId
  );

  let list: InsumoResponseDTO[] = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && Array.isArray(data.content)) {
    list = data.content;
  }

  return list.map(mapInsumoDtoToTecidoItem);
}

/**
 * Cadastra novo insumo (/insumos).
 */
export async function createInsumo(
  payload: CriarInsumoRequestDTO,
  marcaId?: string
): Promise<TecidoInsumoItem> {
  const data = await api.post<InsumoResponseDTO>('/insumos', payload, marcaId);
  return mapInsumoDtoToTecidoItem(data);
}

/**
 * Atualiza insumo existente (/insumos/{id}).
 */
export async function updateInsumo(
  id: string | number,
  payload: AtualizarInsumoRequestDTO,
  marcaId?: string
): Promise<TecidoInsumoItem> {
  const data = await api.put<InsumoResponseDTO>(`/insumos/${id}`, payload, marcaId);
  return mapInsumoDtoToTecidoItem(data);
}

/**
 * Exclui um insumo (/insumos/{id}).
 */
export async function deleteInsumo(id: string | number, marcaId?: string): Promise<void> {
  await api.delete<void>(`/insumos/${id}`, marcaId);
}

// ── NOTIFICAÇÕES (Sinalização de recurso ainda não disponível no backend) ──

/**
 * Retorna a lista de notificações da central.
 * O backend modaflow-backend não expõe atualmente um controlador de notificações.
 * Lançamos estado claro ou mantemos fila local auditada para a sessão.
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const data = await api.get<NotificationItem[]>('/notifications');
    if (data && Array.isArray(data)) return data;
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) {
      // Controlador de notificações planejado no roadmap do backend
      return [...notificationsCache];
    }
    throw err;
  }
  return [...notificationsCache];
}

/**
 * Marca uma notificação individual como lida com rollback em caso de falha.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const previousState = [...notificationsCache];
  // Otimista
  notificationsCache = notificationsCache.map((item) =>
    item.id === id ? { ...item, lida: true } : item
  );

  try {
    await api.post(`/notifications/${id}/read`, {});
  } catch (err) {
    // Se a rota falhar (exceto 404 por indisponibilidade planejada), reverte
    if (err instanceof ApiError && err.status !== 404) {
      notificationsCache = previousState;
      throw err;
    }
  }
}

/**
 * Marca todas as notificações como lidas.
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const previousState = [...notificationsCache];
  notificationsCache = notificationsCache.map((item) => ({ ...item, lida: true }));

  try {
    await api.post('/notifications/read-all', {});
  } catch (err) {
    if (err instanceof ApiError && err.status !== 404) {
      notificationsCache = previousState;
      throw err;
    }
  }
}

export const plmService = {
  getBrands,
  createBrand,
  updateBrand,
  getProducts,
  getProductById,
  createPeca,
  updatePeca,
  movePecaEtapa,
  getCollections,
  getCollectionDetail,
  createCollection,
  updateCollection,
  getDashboardMetrics,
  getBiMetrics,
  getInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo,
  getKanbanPecas,
  moveKanbanPeca,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
