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
  Sparkles,
  X,
  Building2,
  Check,
  Plus,
} from 'lucide-react';

import { CollectionDetailView } from './CollectionDetailView';
import { getBrands } from '../../../services/plmService';

interface BrandCollectionsViewProps {
  marca: MarcaSummary;
  onBack: () => void;
  onSelectMarca?: (marca: MarcaSummary) => void;
  onSelectColecao?: (colecao: ColecaoItem) => void;
}

export const BrandCollectionsView: React.FC<BrandCollectionsViewProps> = ({
  marca,
  onBack,
  onSelectMarca,
  onSelectColecao,
}) => {
  const { user, setActiveMarca } = useAuth();
  const [availableBrands, setAvailableBrands] = useState<MarcaSummary[]>([]);

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

  // Sub-aba interna da marca: [Coleções] ou [Cronograma]
  const [activeSubTab, setActiveSubTab] = useState<'colecoes' | 'cronograma'>('colecoes');

  // Filtro por Status [Todas | Em andamento | Completas | Arquivadas]
  const [statusFiltro, setStatusFiltro] = useState<
    'Todas' | 'Em andamento' | 'Completas' | 'Arquivadas'
  >('Todas');

  // Busca por texto
  const [searchQuery, setSearchQuery] = useState('');

  // Ordenação
  const [sortOrder] = useState<'progress_desc' | 'name_asc'>('name_asc');

  // Estado da Coleção Selecionada para abrir os detalhes
  const [selectedColecao, setSelectedColecao] = useState<ColecaoItem | null>(() => {
    const savedColecaoId = localStorage.getItem('modaflow_selected_colecao_id');
    if (savedColecaoId) {
      return allColecoes.find((c) => c.id === savedColecaoId) || null;
    }
    return null;
  });

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

  useEffect(() => {
    if (selectedColecao) {
      localStorage.setItem('modaflow_selected_colecao_id', selectedColecao.id);
    } else {
      localStorage.removeItem('modaflow_selected_colecao_id');
    }
  }, [selectedColecao]);

  // Filtra as coleções vinculadas à marca atual
  const colecoesDaMarca = useMemo(() => {
    return allColecoes.filter((c) => c.marcaId === currentMarca.id);
  }, [allColecoes, currentMarca.id]);

  // Filtra por status e termo de busca
  const colecoesFiltradas = useMemo(() => {
    let result = colecoesDaMarca.filter((c) => {
      const matchStatus = statusFiltro === 'Todas' || c.status === statusFiltro;
      const matchQuery =
        searchQuery === '' || c.nome.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });

    if (sortOrder === 'progress_desc') {
      result = [...result].sort((a, b) => b.progressoPercent - a.progressoPercent);
    } else {
      result = [...result].sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return result;
  }, [colecoesDaMarca, statusFiltro, searchQuery, sortOrder]);

  // Estatísticas dinâmicas
  const totalColecoes = colecoesDaMarca.length;
  const emAndamentoCount = colecoesDaMarca.filter((c) => c.status === 'Em andamento').length;
  const totalPecas = colecoesDaMarca.reduce((acc, c) => acc + (c.pecasTotal || 0), 0);
  const avgProgress =
    totalColecoes > 0
      ? Math.round(
          colecoesDaMarca.reduce((acc, c) => acc + (c.progressoPercent || 0), 0) / totalColecoes
        )
      : 0;

  // Handler para Criar Nova Coleção
  const handleSaveNovaColecao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      setFormError('O nome da coleção é obrigatório.');
      return;
    }

    const novaColecao: ColecaoItem = {
      id: `col-${Date.now()}`,
      marcaId: currentMarca.id,
      codigoPill: currentMarca.code || currentMarca.initials || 'BRAND',
      nome: formNome.trim(),
      marcaNome: currentMarca.nome,
      status: 'Em andamento',
      progressoPercent: 0,
      pecasConcluidas: 0,
      pecasTotal: 0,
      dataEntrega: formDataEntrega.trim() || 'A definir',
      diasAtraso: 0,
      ano: formAno.trim() || '2026-27',
      temporada: formTemporada || 'Verão',
      descricao: formDescricao.trim() || undefined,
      imagemReferencia: formImagemUrl.trim() || undefined,
    };

    setAllColecoes((prev) => [novaColecao, ...prev]);

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
      <div className="relative rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-neutral-800 transition-all duration-500">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-xs img-brand-treated transition-all duration-500"
          style={{ backgroundImage: `url(${currentMarca.heroImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/95 to-neutral-950" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Esquerda: Nome e Ações */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} />
              <span>{currentMarca.badgeTag || 'Linha Oficial'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-editorial tracking-wide text-white">
              {currentMarca.nome}
            </h1>

            {/* BOTÕES DE AÇÃO INTERNOS */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('colecoes')}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'colecoes'
                    ? 'bg-white text-primary shadow-md scale-[1.02]'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                }`}
              >
                <Layers className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                <span>Coleções</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('cronograma')}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'cronograma'
                    ? 'bg-white text-primary shadow-md scale-[1.02]'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                }`}
              >
                <Calendar className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
                <span>Cronograma</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCriarColecaoOpen(true)}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-accent-camel hover:bg-accent-camel/90 text-white shadow-md flex items-center gap-2 cursor-pointer transition-all duration-200"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Adicionar Coleção</span>
              </button>
            </div>
          </div>

          {/* Direita: BLOCO DE MÉTRICAS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/15 shrink-0 shadow-md">
            <div className="text-center px-3 py-1">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1">
                Coleções
              </span>
              <span className="text-2xl font-bold text-white">{totalColecoes}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1">
                Em Produção
              </span>
              <span className="text-2xl font-bold text-accent-camel">{emAndamentoCount}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1">
                Total Peças
              </span>
              <span className="text-2xl font-bold text-emerald-400">{totalPecas}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1">
                Progresso
              </span>
              <span className="text-2xl font-bold text-amber-400">{avgProgress}%</span>
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
                onClick={() => setStatusFiltro('Todas')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFiltro === 'Todas'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                }`}
              >
                Todas ({colecoesDaMarca.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFiltro('Em andamento')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFiltro === 'Em andamento'
                    ? 'bg-primary text-white shadow-2xs'
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
                    ? 'bg-primary text-white shadow-2xs'
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
                    ? 'bg-primary text-white shadow-2xs'
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
                className="px-4 py-2 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Coleção +</span>
              </button>
            </div>
          </div>

          {/* GRID DE CARDS DAS COLEÇÕES */}
          {colecoesFiltradas.length === 0 ? (
            <div className="bg-surface p-12 rounded-xl border border-border text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent-camel/10 border border-accent-camel/30 text-accent-camel flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary font-editorial">
                  Nenhuma coleção cadastrada para {currentMarca.nome}
                </h4>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Clique no botão abaixo para adicionar a primeira coleção desta marca.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCriarColecaoOpen(true)}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-neutral-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-2xs transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Primeira Coleção</span>
              </button>
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

                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                          {c.progressoPercent}%
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
                        <span className="font-bold text-primary">{c.progressoPercent}%</span>
                      </div>

                      <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isEntregue ? 'bg-emerald-500' : 'bg-accent-camel'
                          }`}
                          style={{ width: `${c.progressoPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* DETALHES DA COLEÇÃO */}
                    <div className="space-y-2 text-xs bg-surface-muted p-3.5 rounded-lg border border-border-muted">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Peças concluídas</span>
                        <strong className="text-primary font-bold">
                          {c.pecasConcluidas} de {c.pecasTotal}
                        </strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Data de Entrega</span>
                        <strong className="text-primary font-bold">
                          {c.dataEntrega || 'A definir'}
                        </strong>
                      </div>
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
                Acompanhamento temporal dos marcos de entrega de coleções
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
            <div className="space-y-6 pt-2">
              {colecoesDaMarca.map((c, index) => (
                <div
                  key={c.id}
                  className="p-5 rounded-lg bg-surface-muted border border-border-muted space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-muted pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-editorial text-primary uppercase">
                          {c.nome}
                        </h4>
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          {c.pecasTotal} peças • Entrega: {c.dataEntrega}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                      {c.progressoPercent}% Concluído
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CRIAR NOVA COLEÇÃO */}
      {isCriarColecaoOpen && (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-xl max-w-lg w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-camel/10 border border-accent-camel/30 text-accent-camel flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-editorial text-primary">
                    Adicionar Nova Coleção
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Marca: <strong>{currentMarca.nome}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCriarColecaoOpen(false)}
                className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveNovaColecao} className="space-y-4 text-xs">
              {/* Nome da Coleção (Obrigatório) */}
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted-foreground">
                  Nome da Coleção <span className="text-rose-600">*</span>
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
                    placeholder="Ex: 2026-27 ou 2028"
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
                  type="text"
                  value={formDataEntrega}
                  onChange={(e) => setFormDataEntrega(e.target.value)}
                  placeholder="Ex: 26/02/2027"
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
                  className="px-6 py-2.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white font-bold cursor-pointer shadow-2xs transition-all duration-200"
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
                            ? 'bg-primary text-white border-primary'
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
                        <div className="w-7 h-7 rounded-full bg-accent-camel text-white flex items-center justify-center font-bold text-xs shadow-2xs">
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
