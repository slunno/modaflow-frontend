/**
 * ============================================================================
 * MÓDULO: Visão Re-imaginada de Coleções da Marca (BrandCollectionsView)
 * ARQUIVO: src/pages/Home/components/BrandCollectionsView.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe a interface de coleções da marca inspirada no layout da
 *            imagem de referência (Hero dark glassmorphic com estatísticas
 *            integradas no topo direito, botões de ação [Coleções] e [Cronograma],
 *            filtros por status, busca por coleção e grid de cards com badges % em destaque).
 * ============================================================================
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { MarcaSummary } from '../../../types/auth';
import type { ColecaoItem } from '../../../types/plm';
import { MOCK_MARCAS } from '../../../contexts/AuthContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ChevronRight, 
  ArrowLeft, 
  ArrowUpDown, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles,
  ChevronDown,
  X,
  Building2,
  Check
} from 'lucide-react';

import { CollectionDetailView } from './CollectionDetailView';

interface BrandCollectionsViewProps {
  marca: MarcaSummary;
  onBack: () => void;
  onSelectMarca?: (marca: MarcaSummary) => void;
  onSelectColecao?: (colecao: ColecaoItem) => void;
}

// MOCK COMPLETO E EXTRAÍDO DO DESIGN DA IMAGEM DE REFERÊNCIA
const ALL_MOCK_COLECOES: (ColecaoItem & { marcaId: string; codigoPill: string })[] = [
  // K&J BLACK (ID: '2')
  {
    id: 'kb-1',
    marcaId: '2',
    codigoPill: 'KB',
    nome: 'PL - SARTORIAL PREMIUM BLACK',
    marcaNome: 'K&J Black',
    status: 'Em andamento',
    progressoPercent: 20,
    pecasConcluidas: 2,
    pecasTotal: 10,
    concluidoEmDate: undefined,
    dataEntrega: '15/12/2026',
    diasAtraso: 102
  },
  {
    id: 'kb-2',
    marcaId: '2',
    codigoPill: 'KB',
    nome: 'TESTES VERÃO 28 - K&J BLACK',
    marcaNome: 'K&J Black',
    status: 'Em andamento',
    progressoPercent: 20,
    pecasConcluidas: 4,
    pecasTotal: 18,
    concluidoEmDate: undefined,
    dataEntrega: '29/01/2027',
    diasAtraso: 148
  },
  {
    id: 'kb-3',
    marcaId: '2',
    codigoPill: 'KB',
    nome: 'VERÃO 28 - K&J BLACK CAPSULA NOBRE',
    marcaNome: 'K&J Black',
    status: 'Em andamento',
    progressoPercent: 20,
    pecasConcluidas: 1,
    pecasTotal: 4,
    concluidoEmDate: undefined,
    dataEntrega: '26/02/2027',
    diasAtraso: 176
  },
  {
    id: 'kb-4',
    marcaId: '2',
    codigoPill: 'KB',
    nome: 'INVERNO 26 - LUXURY SUITING',
    marcaNome: 'K&J Black',
    status: 'Completas',
    progressoPercent: 100,
    pecasConcluidas: 24,
    pecasTotal: 24,
    concluidoEmDate: '15/05/2026',
    dataEntrega: '20/05/2026',
    diasAtraso: 0
  },

  // KING & JOE (ID: '1')
  {
    id: 'kj-1',
    marcaId: '1',
    codigoPill: 'KJ',
    nome: 'TESTES VERÃO 28 - KING&JOE',
    marcaNome: 'King & Joe',
    status: 'Em andamento',
    progressoPercent: 35,
    pecasConcluidas: 12,
    pecasTotal: 34,
    concluidoEmDate: undefined,
    dataEntrega: '10/01/2027',
    diasAtraso: 120
  },
  {
    id: 'kj-2',
    marcaId: '1',
    codigoPill: 'KJ',
    nome: 'INVERNO 26 - KING&JOE CLASSIC',
    marcaNome: 'King & Joe',
    status: 'Completas',
    progressoPercent: 100,
    pecasConcluidas: 85,
    pecasTotal: 85,
    concluidoEmDate: '10/04/2026',
    dataEntrega: '15/04/2026',
    diasAtraso: 0
  },

  // KING & JOE PLAY (ID: '3')
  {
    id: 'p-1',
    marcaId: '3',
    codigoPill: 'KP',
    nome: 'INVERNO 26 - KING&JOE PLAY COLLECTION',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 100,
    pecasConcluidas: 214,
    pecasTotal: 214,
    concluidoEmDate: '22/07/2025',
    dataEntrega: '23/07/2025',
    diasAtraso: 0
  },
  {
    id: 'p-2',
    marcaId: '3',
    codigoPill: 'KP',
    nome: 'INVERNO 26 - KING&JOE PLAY PERENES',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 100,
    pecasConcluidas: 28,
    pecasTotal: 28,
    concluidoEmDate: '18/07/2025',
    dataEntrega: '18/07/2025',
    diasAtraso: 0
  },
  {
    id: 'p-3',
    marcaId: '3',
    codigoPill: 'KP',
    nome: 'INVERNO 27 - KING&JOE PLAY',
    marcaNome: 'King & Joe Play',
    status: 'Em andamento',
    progressoPercent: 12,
    pecasConcluidas: 30,
    pecasTotal: 259,
    concluidoEmDate: undefined,
    dataEntrega: '26/08/2026',
    diasAtraso: 45
  },
  {
    id: 'p-4',
    marcaId: '3',
    codigoPill: 'KP',
    nome: 'VERÃO 26 - King&Joe Play Collection',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 100,
    pecasConcluidas: 151,
    pecasTotal: 151,
    concluidoEmDate: '07/07/2025',
    dataEntrega: '10/01/2025',
    diasAtraso: 0
  },
  {
    id: 'p-5',
    marcaId: '3',
    codigoPill: 'KP',
    nome: 'VERÃO 26 - King&Joe Play Perenes',
    marcaNome: 'King & Joe Play',
    status: 'Em andamento',
    progressoPercent: 50,
    pecasConcluidas: 17,
    pecasTotal: 34,
    concluidoEmDate: undefined,
    dataEntrega: '10/01/2027',
    diasAtraso: 90
  },
  {
    id: 'p-6',
    marcaId: '3',
    codigoPill: 'KP',
    nome: 'VERÃO 27 - KING & JOE PLAY',
    marcaNome: 'King & Joe Play',
    status: 'Em andamento',
    progressoPercent: 5,
    pecasConcluidas: 1,
    pecasTotal: 228,
    concluidoEmDate: undefined,
    dataEntrega: '26/08/2027',
    diasAtraso: 310
  }
];

export const BrandCollectionsView: React.FC<BrandCollectionsViewProps> = ({
  marca,
  onBack,
  onSelectMarca,
  onSelectColecao
}) => {
  const { setActiveMarca } = useAuth();
  
  // Estado local para a marca ativa caso o usuário altere no modal do quadro
  const [currentMarca, setCurrentMarca] = useState<MarcaSummary>(marca);
  
  // Sincroniza marca inicial quando a prop muda
  useEffect(() => {
    setCurrentMarca(marca);
  }, [marca]);

  // Sub-aba interna da marca: [Coleções] ou [Cronograma]
  const [activeSubTab, setActiveSubTab] = useState<'colecoes' | 'cronograma'>('colecoes');

  // Filtro por Status [Em andamento | Completas | Arquivadas]
  const [statusFiltro, setStatusFiltro] = useState<'Em andamento' | 'Completas' | 'Arquivadas'>('Em andamento');

  // Busca por texto da coleção
  const [searchQuery, setSearchQuery] = useState('');

  // Ordenação das coleções
  const [sortOrder, setSortOrder] = useState<'progress_desc' | 'name_asc'>('progress_desc');

  // Estado da Coleção selecionada
  const [selectedColecao, setSelectedColecao] = useState<ColecaoItem | null>(() => {
    const savedColecaoId = localStorage.getItem('modaflow_selected_colecao_id');
    if (savedColecaoId) {
      return ALL_MOCK_COLECOES.find(c => c.id === savedColecaoId) || null;
    }
    return null;
  });

  // Salva no localStorage quando a coleção é selecionada
  useEffect(() => {
    if (selectedColecao) {
      localStorage.setItem('modaflow_selected_colecao_id', selectedColecao.id);
    } else {
      localStorage.removeItem('modaflow_selected_colecao_id');
    }
  }, [selectedColecao]);

  // Modal do Quadro de Linhas & Marcas
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Filtra as coleções pela marca atual
  const colecoesDaMarca = useMemo(() => {
    return ALL_MOCK_COLECOES.filter(c => c.marcaId === currentMarca.id);
  }, [currentMarca.id]);

  // Filtra por status e termo de busca
  const colecoesFiltradas = useMemo(() => {
    let result = colecoesDaMarca.filter(c => {
      const matchStatus = c.status === statusFiltro;
      const matchQuery = searchQuery === '' || c.nome.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });

    if (sortOrder === 'progress_desc') {
      result = [...result].sort((a, b) => b.progressoPercent - a.progressoPercent);
    } else {
      result = [...result].sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return result;
  }, [colecoesDaMarca, statusFiltro, searchQuery, sortOrder]);

  // Cálculos dinâmicos das estatísticas da marca
  const totalColecoes = colecoesDaMarca.length;
  const emAndamentoCount = colecoesDaMarca.filter(c => c.status === 'Em andamento').length;
  const totalPecas = colecoesDaMarca.reduce((acc, c) => acc + c.pecasTotal, 0);
  const avgProgress = totalColecoes > 0 
    ? Math.round(colecoesDaMarca.reduce((acc, c) => acc + c.progressoPercent, 0) / totalColecoes)
    : 0;

  // Troca de marca através do quadro interativo
  const handleSwitchBrand = (newMarca: MarcaSummary) => {
    setCurrentMarca(newMarca);
    setActiveMarca(newMarca);
    if (onSelectMarca) onSelectMarca(newMarca);
    setIsBrandModalOpen(false);
  };

  // Se houver uma coleção selecionada, renderiza o componente detalhado
  if (selectedColecao) {
    return (
      <CollectionDetailView 
        colecao={selectedColecao} 
        marca={currentMarca} 
        onBackToBrand={() => setSelectedColecao(null)} 
        onBackToHome={onBack}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-200">
      
      {/* 1. BREADCRUMBS NO ESTILO DO MOCKUP */}
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

      {/* 2. CARD HERO DARK GLASSMORPHIC (HERO NÍVEL 1: ROUNDED-3XL + SHADOW-XL) */}
      <div className="relative rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-neutral-800 transition-all duration-500">
        
        {/* Fundo com degradê escuro e luz sutil */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-xs img-brand-treated transition-all duration-500"
          style={{ backgroundImage: `url(${marca.heroImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/95 to-neutral-950" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Esquerda: Badge, Título, Descrição e Botões de Ação */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} />
              <span>{marca.badgeTag || 'Linha Premium'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-editorial tracking-wide text-white">
              {marca.nome}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
              {marca.description}
            </p>

            {/* BOTÕES DE AÇÃO INTERNOS DO BANNER [COLEÇÕES] E [CRONOGRAMA] */}
            <div className="flex items-center gap-3 pt-2">
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
          
          {/* BARRA DE FILTROS (CARD NÍVEL 2) */}
          <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all duration-300">
            
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFiltro('Em andamento')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  statusFiltro === 'Em andamento'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-surface-muted text-muted-foreground hover:bg-border-muted'
                }`}
              >
                Em andamento ({colecoesDaMarca.filter(c => c.status === 'Em andamento').length})
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
                Completas ({colecoesDaMarca.filter(c => c.status === 'Completas').length})
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
                Arquivadas ({colecoesDaMarca.filter(c => c.status === 'Arquivadas').length})
              </button>
            </div>

            {/* Ações Direita: Buscar Coleção, Contador & Ordenação */}
            <div className="flex items-center gap-3">
              
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
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
                onClick={() => setSortOrder(prev => prev === 'progress_desc' ? 'name_asc' : 'progress_desc')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-muted-foreground bg-surface-muted hover:bg-border-muted text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                <span>{sortOrder === 'progress_desc' ? 'Progresso' : 'Nome'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </button>

            </div>

          </div>

          {/* GRID DE CARDS (CARD NÍVEL 2) */}
          {colecoesFiltradas.length === 0 ? (
            <div className="bg-surface p-12 rounded-xl border border-border text-center space-y-3">
              <Layers className="w-10 h-10 text-muted mx-auto" strokeWidth={1.5} />
              <h4 className="text-sm font-bold text-muted-foreground font-editorial">Nenhuma coleção encontrada</h4>
              <p className="text-xs text-muted">Tente alternar o filtro de status ou limpar o campo de busca.</p>
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
                      {/* Topo do Card: Badge de Código (KB, KJ, KP) */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-md bg-surface-muted border border-border text-primary font-bold text-[11px] tracking-wider uppercase">
                          {c.codigoPill}
                        </span>

                        {/* BADGE DE PROGRESSO % DOURADO */}
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                          {c.progressoPercent}%
                        </span>
                      </div>

                      {/* Título da Coleção com fonte editorial */}
                      <h3 className="text-sm font-bold font-editorial text-primary uppercase tracking-wide leading-snug group-hover:text-accent-camel transition-colors duration-200 min-h-[40px]">
                        {c.nome}
                      </h3>
                    </div>

                    {/* BARRA DE PROGRESSO SLIM */}
                    <div className="space-y-1.5 pt-2 border-t border-border-muted">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-muted-foreground">Progresso da coleção</span>
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

                    {/* DETALHES DE PEÇAS E PRAZOS */}
                    <div className="space-y-2 text-xs bg-surface-muted p-3.5 rounded-lg border border-border-muted">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Peças concluídas</span>
                        <strong className="text-primary font-bold">{c.pecasConcluidas} de {c.pecasTotal}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Entrega em</span>
                        <strong className="text-primary font-bold">{c.diasAtraso} dias</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Data de Entrega</span>
                        <strong className="text-primary font-bold">{c.dataEntrega}</strong>
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
                <span>Cronograma & Marcos de Produção — {marca.nome}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Acompanhamento temporal dos marcos de entrega de coleções</p>
            </div>

            <span className="text-xs font-bold text-accent-camel bg-accent-camel/10 px-3 py-1.5 rounded-lg border border-accent-camel/30">
              Visão Cronológica PLM
            </span>
          </div>

          <div className="space-y-6 pt-2">
            {colecoesDaMarca.map((c, index) => (
              <div key={c.id} className="p-5 rounded-lg bg-surface-muted border border-border-muted space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-muted pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-editorial text-primary uppercase">{c.nome}</h4>
                      <span className="text-[11px] text-muted-foreground font-semibold">{c.pecasTotal} peças • Entrega: {c.dataEntrega}</span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    c.progressoPercent === 100 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.progressoPercent}% Concluído
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] font-bold uppercase text-muted block">1. Design & Estilo</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Concluído
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] font-bold uppercase text-muted block">2. Modelagem & Ficha</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Concluído
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] font-bold uppercase text-muted block">3. Pilotagem & Corte</span>
                    <span className={`font-bold flex items-center gap-1 mt-0.5 ${c.progressoPercent > 50 ? 'text-emerald-600' : 'text-accent-camel'}`}>
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} /> {c.progressoPercent > 50 ? 'Concluído' : 'Em andamento'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface rounded-lg border border-border">
                    <span className="text-[10px] font-bold uppercase text-muted block">4. Produção & ERP</span>
                    <span className={`font-bold flex items-center gap-1 mt-0.5 ${c.progressoPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {c.progressoPercent === 100 ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />}
                      {c.progressoPercent === 100 ? 'Entregue' : 'Aguardando'}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 5. QUADRO DE ALTERNAR LINHA / MARCA (MODAL INTERATIVO NÍVEL 2) */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl p-6 sm:p-8 border border-border shadow-xl max-w-xl w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header do Quadro */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-camel/10 border border-accent-camel/30 text-accent-camel flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-editorial text-primary">Linhas & Marcas da Organização</h3>
                  <p className="text-xs text-muted-foreground">Selecione para alternar a visão instantaneamente</p>
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

            {/* Lista das Marcas / Linhas da Organização */}
            <div className="space-y-3">
              {MOCK_MARCAS.map((m) => {
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
                      <div className={`px-3 py-2.5 rounded-lg font-extrabold text-xs tracking-wider border shrink-0 ${
                        isSelected 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-surface-muted text-primary border-border'
                      }`}>
                        {m.initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-primary">{m.nome}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-muted text-muted-foreground border border-border">
                            {m.badgeTag}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-muted block mt-0.5">
                          {m.colecoesCount} Coleções • {m.pecasCount} Peças
                        </span>
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

            {/* Rodapé do Quadro */}
            <div className="pt-3 border-t border-border-muted flex justify-end">
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="px-4 py-2 bg-surface-muted hover:bg-border-muted text-primary text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer"
              >
                Fechar Quadro
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
