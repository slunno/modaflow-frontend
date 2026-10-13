/**
 * ============================================================================
 * MÓDULO: Visão de Coleções da Marca (BrandCollectionsView)
 * ARQUIVO: src/pages/Home/components/BrandCollectionsView.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe a interface de coleções da marca com criação de novas coleções,
 *            sem dados mockados por padrão, com suporte a persistência e visualização.
 * ============================================================================
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { MarcaSummary } from '../../../types/auth';
import type { ColecaoItem } from '../../../types/plm';
import { useAuth } from '../../../hooks/useAuth';
import { usePersistedState } from '../../../hooks/usePersistedState';
import {
  ChevronRight,
  ArrowLeft,
  Search,
  Calendar,
  Layers,
  X,
  Building2,
  Check,
  Plus,
} from 'lucide-react';

import { CollectionDetailView } from './CollectionDetailView';
import { getBrands } from '../../../services/plmService';
import { getLinxColecoesValidas, resolveLinxGriffe } from '../../../services/linxService';
import { mapLinxColecaoToItem } from '../../../services/contractMappers';

function isoDatePart(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function formatLinxDate(value: string | null): string {
  const date = isoDatePart(value);
  if (!date) return 'A definir';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function daysUntil(value: string | null): number | undefined {
  const date = isoDatePart(value);
  if (!date) return undefined;
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const deliveryUtc = Date.UTC(year, month - 1, day);
  return Math.ceil((deliveryUtc - todayUtc) / 86_400_000);
}

function deliveryCountdownLabel(days: number): string {
  if (days === 0) return 'Hoje';
  if (days === 1) return '1 dia';
  if (days === -1) return '-1 dia';
  return `${days} dias`;
}

interface BrandCollectionsViewProps {
  marca: MarcaSummary;
  selectedColecaoId?: string | null;
  onBack: () => void;
  onSelectMarca?: (marca: MarcaSummary) => void;
  onSelectColecao?: (colecao: ColecaoItem) => void;
  onClearColecao?: () => void;
}

export const BrandCollectionsView: React.FC<BrandCollectionsViewProps> = ({
  marca,
  selectedColecaoId,
  onBack,
  onSelectMarca,
  onSelectColecao,
  onClearColecao,
}) => {
  const { user, setActiveMarca } = useAuth();
  const [availableBrands, setAvailableBrands] = useState<MarcaSummary[]>([]);
  const [linxColecoes, setLinxColecoes] = useState<ColecaoItem[]>([]);
  const [isLoadingLinx, setIsLoadingLinx] = useState(false);
  const [linxError, setLinxError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getBrands()
      .then((b) => {
        if (isMounted && b.length > 0) setAvailableBrands(b);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const brandListModal = useMemo(() => {
    if (availableBrands.length > 0) return availableBrands;
    if (user?.marcas && user.marcas.length > 0) return user.marcas;
    return [marca];
  }, [availableBrands, user, marca]);

  // Lista de Coleções Persistida no LocalStorage
  const [allColecoes, setAllColecoes] = usePersistedState<ColecaoItem[]>(
    'modaflow_user_colecoes',
    []
  );

  // Estado local da marca selecionada
  const [currentMarca, setCurrentMarca] = useState<MarcaSummary>(marca);
  const [prevMarca, setPrevMarca] = useState<MarcaSummary>(marca);
  if (marca !== prevMarca) {
    setPrevMarca(marca);
    setCurrentMarca(marca);
  }

  useEffect(() => {
    let isMounted = true;
    const griffe = resolveLinxGriffe(currentMarca);

    if (!griffe) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setLinxColecoes([]);
        setIsLoadingLinx(false);
        setLinxError('Esta marca não possui uma grife correspondente configurada no Linx.');
      });
      return () => {
        isMounted = false;
      };
    }

    void (async () => {
      await Promise.resolve();
      if (!isMounted) return;
      setIsLoadingLinx(true);
      setLinxError('');

      try {
        const collections = await getLinxColecoesValidas({ griffe: [griffe] });
        if (!isMounted) return;
        setLinxColecoes(
          collections.map((collection) => mapLinxColecaoToItem(collection, currentMarca, griffe))
        );
      } catch {
        if (!isMounted) return;
        setLinxColecoes([]);
        setLinxError('Não foi possível carregar as coleções completas do Linx.');
      } finally {
        if (isMounted) setIsLoadingLinx(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentMarca]);

  // Sub-aba interna da marca: [Coleções] ou [Cronograma]
  const [activeSubTab, setActiveSubTab] = useState<'colecoes' | 'cronograma'>('colecoes');

  // Filtro por Status [Em andamento | Completas | Arquivadas]
  const [statusFiltro, setStatusFiltro] = useState<'Em andamento' | 'Completas' | 'Arquivadas'>(
    'Em andamento'
  );

  // Busca por texto
  const [searchQuery, setSearchQuery] = useState('');

  // Ordenação
  const [sortOrder] = useState<'progress_desc' | 'name_asc'>('name_asc');

  // A coleção é escolhida durante a sessão atual; não restauramos a última tela ao iniciar.
  const [selectedColecao, setSelectedColecao] = useState<ColecaoItem | null>(null);

  // Modal de Criar Nova Coleção
  const [isCriarColecaoOpen, setIsCriarColecaoOpen] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formAno, setFormAno] = useState('');
  const [formTemporada, setFormTemporada] = useState('Verão');
  const [formDataEntrega, setFormDataEntrega] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formImagemUrl, setFormImagemUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Modal de Alternar Marca
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Filtra as coleções vinculadas à marca atual
  const colecoesDaMarca = useMemo(() => {
    const localCollections = allColecoes.filter((c) => c.marcaId === currentMarca.id);
    const linxKeys = new Set(
      linxColecoes.map((c) => `${c.nome.trim().toLocaleUpperCase('pt-BR')}|${c.codigoPill ?? ''}`)
    );
    const uniqueLocalCollections = localCollections.filter(
      (c) =>
        c.regraFicha === 'integracao-colecao-v1' ||
        !linxKeys.has(`${c.nome.trim().toLocaleUpperCase('pt-BR')}|${c.codigoPill ?? ''}`)
    );
    // Compatibilidade com coleções locais salvas antes da classificação das finalizadas.
    return [...linxColecoes, ...uniqueLocalCollections].map((colecao) =>
      colecao.status === 'Não categorizada' ? { ...colecao, status: 'Completas' } : colecao
    );
  }, [allColecoes, currentMarca.id, linxColecoes]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!selectedColecaoId) {
        setSelectedColecao(null);
        return;
      }
      const found = colecoesDaMarca.find((colecao) => colecao.id === selectedColecaoId);
      if (found) setSelectedColecao(found);
    });
  }, [colecoesDaMarca, selectedColecaoId]);

  // Filtra por status e termo de busca
  const colecoesFiltradas = useMemo(() => {
    let result = colecoesDaMarca.filter((c) => {
      const matchStatus = c.status === statusFiltro;
      const matchQuery =
        searchQuery === '' || c.nome.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });

    if (sortOrder === 'progress_desc') {
      result = [...result].sort((a, b) => (b.progressoPercent ?? 0) - (a.progressoPercent ?? 0));
    } else {
      result = [...result].sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return result;
  }, [colecoesDaMarca, statusFiltro, searchQuery, sortOrder]);

  // Estatísticas dinâmicas
  const totalColecoes = colecoesDaMarca.length;
  const emAndamentoCount = colecoesDaMarca.filter((c) => c.status === 'Em andamento').length;
  const totalPecas = colecoesDaMarca.reduce((acc, c) => acc + (c.pecasTotal || 0), 0);

  // Handler para Criar Nova Coleção
  const currentYear = new Date().getFullYear();
  const defaultAno = `${currentYear}-${String(currentYear + 1).slice(2)}`;

  const handleSaveNovaColecao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      setFormError('O nome da coleção é obrigatório.');
      return;
    }

    const dataEntregaFormatada = formDataEntrega.trim()
      ? formatLinxDate(formDataEntrega.trim())
      : 'A definir';

    const novaColecao: ColecaoItem = {
      id: `col-${crypto.randomUUID()}`,
      marcaId: currentMarca.id,
      griffe: resolveLinxGriffe(currentMarca) ?? undefined,
      codigoPill: currentMarca.code || currentMarca.initials || 'BRAND',
      nome: formNome.trim(),
      marcaNome: currentMarca.nome,
      status: 'Em andamento',
      regraFicha: 'integracao-colecao-v1',
      criadaEm: new Date().toISOString(),
      progressoPercent: 0,
      pecasConcluidas: 0,
      pecasTotal: 0,
      dataEntrega: dataEntregaFormatada,
      diasParaEntrega: formDataEntrega.trim() ? daysUntil(formDataEntrega.trim()) : undefined,
      diasAtraso: 0,
      ano: formAno.trim() || defaultAno,
      temporada: formTemporada || 'Verão',
      descricao: formDescricao.trim() || undefined,
      imagemReferencia: formImagemUrl.trim() || undefined,
    };

    setAllColecoes((prev) => [novaColecao, ...prev]);
    setStatusFiltro('Em andamento');

    // Reseta form e fecha modal
    setIsCriarColecaoOpen(false);
    setFormNome('');
    setFormAno('');
    setFormTemporada('Verão');
    setFormDataEntrega('');
    setFormDescricao('');
    setFormImagemUrl('');
    setFormError('');
  };

  // Troca de marca através do quadro interativo
  const handleSwitchBrand = (newMarca: MarcaSummary) => {
    setCurrentMarca(newMarca);
    setActiveMarca(newMarca);
    if (onSelectMarca) onSelectMarca(newMarca);
    setIsBrandModalOpen(false);
  };

  // Se houver uma coleção selecionada, exibe os detalhes
  if (selectedColecao) {
    return (
      <CollectionDetailView
        colecao={selectedColecao}
        marca={currentMarca}
        onBackToBrand={() => {
          setSelectedColecao(null);
          onClearColecao?.();
        }}
        onBackToHome={onBack}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-200">
      {/* 1. BREADCRUMBS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 hover:text-accent-camel transition-all duration-200 cursor-pointer font-bold text-primary bg-surface px-3 py-1.5 rounded-lg border border-border shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Início</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <span className="text-primary font-bold px-2.5 py-1 bg-surface-muted rounded-lg border border-border-muted">
            {currentMarca.nome}
          </span>
        </div>

        {/* BOTÃO ALTERNAR MARCA */}
        <button
          type="button"
          onClick={() => setIsBrandModalOpen(true)}
          className="text-xs font-bold px-4 py-2 rounded-lg border border-accent-camel/30 bg-accent-camel/10 text-accent-camel hover:bg-accent-camel/20 transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-2"
        >
          <Building2 className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
          <span>Alternar Marca</span>
        </button>
      </div>

      {/* 2. CARD HERO DARK GLASSMORPHIC */}
      <div className="relative rounded-xl bg-neutral-950 text-white p-4 sm:p-5 shadow-md overflow-hidden border border-neutral-800 transition-all duration-500">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-xs img-brand-treated transition-all duration-500"
          style={{ backgroundImage: `url(${currentMarca.heroImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/95 to-neutral-950" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Esquerda: Nome e Ações */}
          <div className="space-y-3 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial tracking-wide text-white">
              {currentMarca.nome}
            </h1>

            {/* BOTÕES DE AÇÃO INTERNOS */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('colecoes')}
                className={`px-3 py-2 rounded-md text-[11px] font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'colecoes'
                    ? 'bg-surface text-primary shadow-2xs'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} />
                <span>Coleções</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('cronograma')}
                className={`px-3 py-2 rounded-md text-[11px] font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'cronograma'
                    ? 'bg-surface text-primary shadow-2xs'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} />
                <span>Cronograma</span>
              </button>
            </div>
          </div>

          {/* Direita: BLOCO DE MÉTRICAS */}
          <div className="grid grid-cols-3 bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/15 shrink-0 lg:min-w-80">
            <div className="text-center px-2 py-1">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1">
                Coleções
              </span>
              <span className="text-xl font-bold text-white">{totalColecoes}</span>
            </div>

            <div className="text-center px-2 py-1 border-l border-white/10">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1">
                Em Produção
              </span>
              <span className="text-xl font-bold text-accent-camel">{emAndamentoCount}</span>
            </div>

            <div className="text-center px-2 py-1 border-l border-white/10">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1">
                Total Peças
              </span>
              <span className="text-xl font-bold text-emerald-400">{totalPecas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTEÚDO DA ABA SELECIONADA */}
      {activeSubTab === 'colecoes' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* BARRA DE FILTROS E BUSCA */}
          <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all duration-300">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFiltro('Em andamento')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFiltro === 'Em andamento'
                    ? 'bg-action text-action-foreground shadow-2xs'
                    : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                }`}
              >
                Em andamento ({colecoesDaMarca.filter((c) => c.status === 'Em andamento').length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFiltro('Completas')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFiltro === 'Completas'
                    ? 'bg-action text-action-foreground shadow-2xs'
                    : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                }`}
              >
                Completas ({colecoesDaMarca.filter((c) => c.status === 'Completas').length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFiltro('Arquivadas')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFiltro === 'Arquivadas'
                    ? 'bg-action text-action-foreground shadow-2xs'
                    : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                }`}
              >
                Arquivadas ({colecoesDaMarca.filter((c) => c.status === 'Arquivadas').length})
              </button>
            </div>

            {/* Ações Direita: Buscar Coleção & Adicionar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  placeholder="Buscar coleção..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsCriarColecaoOpen(true)}
                className="px-4 py-2 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-on-camel font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Coleção +</span>
              </button>
            </div>
          </div>

          {/* GRID DE CARDS DAS COLEÇÕES */}
          {isLoadingLinx ? (
            <div className="bg-surface p-12 rounded-xl border border-border text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-border border-t-accent-camel animate-spin mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">
                Carregando coleções do Linx...
              </p>
            </div>
          ) : linxError && colecoesFiltradas.length === 0 ? (
            <div className="bg-surface p-12 rounded-xl border border-red-200 dark:border-red-900/60 text-center space-y-2">
              <h4 className="text-sm font-bold text-primary">Coleções do Linx indisponíveis</h4>
              <p className="text-xs text-red-600 dark:text-red-400">{linxError}</p>
            </div>
          ) : colecoesFiltradas.length === 0 ? (
            <div className="bg-surface p-12 rounded-xl border border-border text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent-camel/10 border border-accent-camel/30 text-accent-camel flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary font-editorial">
                  {colecoesDaMarca.length === 0
                    ? `Nenhuma coleção cadastrada para ${currentMarca.nome}`
                    : 'Nenhuma coleção corresponde aos filtros selecionados'}
                </h4>
                <p className="text-xs text-muted max-w-md mx-auto">
                  {colecoesDaMarca.length === 0
                    ? 'Use o botão Coleção + ao lado da busca para adicionar a primeira coleção desta marca.'
                    : 'Escolha outra aba, ajuste a busca ou crie uma nova coleção.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {colecoesFiltradas.map((c) => {
                const isEntregue = c.progressoPercent === 100;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectColecao) onSelectColecao(c);
                      setSelectedColecao(c);
                    }}
                    className="bg-surface border border-border rounded-xl p-6 shadow-2xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 space-y-5 flex flex-col justify-between relative group cursor-pointer"
                  >
                    <div>
                      {/* Topo do Card: Badge da Marca */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-md bg-surface-muted border border-border text-primary font-bold text-[11px] tracking-wider uppercase">
                          {c.codigoPill || currentMarca.code}
                        </span>

                        <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-xs font-bold">
                          {c.progressoPercent !== undefined ? `${c.progressoPercent}%` : c.status}
                        </span>
                      </div>

                      {/* Título da Coleção */}
                      <h3 className="text-sm font-bold font-editorial text-primary uppercase tracking-wide leading-snug group-hover:text-accent-camel transition-colors duration-200 min-h-[38px]">
                        {c.nome}
                      </h3>
                    </div>

                    {/* BARRA DE PROGRESSO */}
                    <div className="space-y-1.5 pt-2 border-t border-border-muted">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-muted-foreground">
                          Progresso da coleção
                        </span>
                        <span className="font-bold text-primary">
                          {c.progressoPercent !== undefined
                            ? `${c.progressoPercent}%`
                            : 'Não mensurado'}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isEntregue ? 'bg-emerald-500' : 'bg-accent-camel'
                          }`}
                          style={{ width: `${c.progressoPercent ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* DETALHES DA COLEÇÃO */}
                    <div className="space-y-2 text-xs bg-surface-muted p-3.5 rounded-lg border border-border-muted">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Peças concluídas</span>
                        <strong className="text-primary font-bold">
                          {c.pecasConcluidas === undefined
                            ? 'Não informado'
                            : c.status === 'Completas' || c.pecasTotal === undefined
                              ? c.pecasConcluidas
                              : `${c.pecasConcluidas} de ${c.pecasTotal}`}
                        </strong>
                      </div>

                      {c.concluidoEmDate && c.concluidoEmDate !== 'A definir' && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium">Concluído em</span>
                          <strong className="text-primary font-bold">{c.concluidoEmDate}</strong>
                        </div>
                      )}

                      {c.diasParaEntrega !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium">Entrega em</span>
                          <strong
                            className={`rounded-md px-2 py-0.5 font-bold ${
                              c.diasParaEntrega < 0
                                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60'
                                : 'text-primary'
                            }`}
                          >
                            {deliveryCountdownLabel(c.diasParaEntrega)}
                          </strong>
                        </div>
                      )}

                      {c.dataEntrega && c.dataEntrega !== 'A definir' && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium">Data de Entrega</span>
                          <strong className="text-primary font-bold">{c.dataEntrega}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. ABA CRONOGRAMA */}
      {activeSubTab === 'cronograma' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border-muted pb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-camel" strokeWidth={1.5} />
                <span>Cronograma & Marcos de Produção — {currentMarca.nome}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Acompanhamento temporal dos marcos de entrega de coleções ordenado por prazos
              </p>
            </div>

            <span className="text-xs font-bold text-accent-camel bg-accent-camel/10 px-3 py-1.5 rounded-lg border border-accent-camel/30">
              Visão Cronológica PLM
            </span>
          </div>

          {colecoesDaMarca.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              Nenhuma coleção disponível para o cronograma.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {[...colecoesDaMarca]
                .sort((a, b) => {
                  const diasA = a.diasParaEntrega ?? 99999;
                  const diasB = b.diasParaEntrega ?? 99999;
                  return diasA - diasB;
                })
                .map((c, index) => {
                  const isAtrasada =
                    (c.diasParaEntrega !== undefined && c.diasParaEntrega < 0) ||
                    (c.diasAtraso !== undefined && c.diasAtraso > 0);

                  return (
                    <div
                      key={c.id}
                      className={`p-5 rounded-lg border space-y-3 transition-colors ${
                        isAtrasada
                          ? 'bg-rose-50/40 border-rose-300 dark:bg-rose-950/20 dark:border-rose-800'
                          : 'bg-surface-muted border-border-muted'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-muted pb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                              isAtrasada
                                ? 'bg-rose-600 text-white'
                                : 'bg-action text-action-foreground'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold font-editorial text-primary uppercase">
                                {c.nome}
                              </h4>
                              {isAtrasada && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60">
                                  Atrasada
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground font-semibold">
                              {c.pecasTotal} peças • Entrega: {c.dataEntrega}
                              {c.diasParaEntrega !== undefined && (
                                <> ({deliveryCountdownLabel(c.diasParaEntrega)})</>
                              )}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            isAtrasada
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {c.progressoPercent !== undefined
                            ? `${c.progressoPercent}% Concluído`
                            : c.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CRIAR NOVA COLEÇÃO */}
      {isCriarColecaoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-criar-colecao-title"
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-xl max-w-lg w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-camel/10 border border-accent-camel/30 text-accent-camel flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3
                    id="modal-criar-colecao-title"
                    className="text-base font-bold font-editorial text-primary"
                  >
                    Adicionar Nova Coleção
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Marca: <strong>{currentMarca.nome}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Fechar modal"
                onClick={() => setIsCriarColecaoOpen(false)}
                className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveNovaColecao} className="space-y-4 text-xs">
              {/* Nome da Coleção (Obrigatório) */}
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
                  Nome da Coleção <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: VERÃO 28 - K&J BLACK CAPSULA NOBRE"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none transition-all duration-200"
                  required
                />
              </div>

              {/* Grid 2 colunas: Temporada & Ano */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
                    Temporada
                  </label>
                  <select
                    value={formTemporada}
                    onChange={(e) => setFormTemporada(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none cursor-pointer"
                  >
                    <option value="Verão">Verão</option>
                    <option value="Inverno">Inverno</option>
                    <option value="Atemporal">Atemporal</option>
                    <option value="Primavera">Primavera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
                    Ano
                  </label>
                  <input
                    type="text"
                    value={formAno}
                    onChange={(e) => setFormAno(e.target.value)}
                    placeholder={`Ex: ${defaultAno}`}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                  />
                </div>
              </div>

              {/* Data de Entrega */}
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
                  Data de Entrega
                </label>
                <input
                  type="date"
                  value={formDataEntrega}
                  onChange={(e) => setFormDataEntrega(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Breve conceito ou detalhes da coleção..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                />
              </div>

              {/* Imagem de Referência */}
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
                  URL da Imagem de Referência (Opcional)
                </label>
                <input
                  type="url"
                  value={formImagemUrl}
                  onChange={(e) => setFormImagemUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-muted border border-border text-primary font-medium focus:bg-surface focus:border-accent-camel focus:outline-none"
                />
              </div>

              {/* Botões do Modal */}
              <div className="pt-4 border-t border-border-muted flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCriarColecaoOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-border text-muted-foreground font-bold hover:bg-surface-muted cursor-pointer transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-on-camel font-bold cursor-pointer shadow-2xs transition-all duration-200"
                >
                  Criar Coleção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUADRO DE ALTERNAR MARCA */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl p-6 sm:p-8 border border-border shadow-xl max-w-xl w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-camel/10 border border-accent-camel/30 text-accent-camel flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-editorial text-primary">
                    Linhas & Marcas da Organização
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Selecione para alternar a visão instantaneamente
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors duration-200 cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-3">
              {brandListModal.map((m) => {
                const isSelected = m.id === currentMarca.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSwitchBrand(m)}
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-accent-camel/10 border-accent-camel shadow-2xs ring-1 ring-accent-camel/30'
                        : 'bg-surface border-border hover:border-accent-camel/50 hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`px-3 py-2.5 rounded-lg font-extrabold text-xs tracking-wider border shrink-0 ${
                          isSelected
                            ? 'bg-action text-action-foreground border-action'
                            : 'bg-surface-muted text-primary border-border'
                        }`}
                      >
                        {m.initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-primary">{m.nome}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-accent-camel text-on-camel flex items-center justify-center font-bold text-xs shadow-2xs">
                          <Check className="w-4 h-4" strokeWidth={2} />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-accent-camel hover:underline">
                          Selecionar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
