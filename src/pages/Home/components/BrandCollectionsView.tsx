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
    nome: 'INVERNO 26 - KING & JOE MAIN COLLECTION',
    marcaNome: 'King & Joe',
    status: 'Em andamento',
    progressoPercent: 68,
    pecasConcluidas: 145,
    pecasTotal: 214,
    concluidoEmDate: '22/07/2026',
    dataEntrega: '15/09/2026',
    diasAtraso: 12
  },
  {
    id: 'kj-2',
    marcaId: '1',
    codigoPill: 'KJ',
    nome: 'VERÃO 27 - ALFAIATARIA DESCONSTRUÍDA',
    marcaNome: 'King & Joe',
    status: 'Em andamento',
    progressoPercent: 42,
    pecasConcluidas: 88,
    pecasTotal: 210,
    concluidoEmDate: '10/08/2026',
    dataEntrega: '20/11/2026',
    diasAtraso: 78
  },
  {
    id: 'kj-3',
    marcaId: '1',
    codigoPill: 'KJ',
    nome: 'BÁSICOS PERENES KING & JOE',
    marcaNome: 'King & Joe',
    status: 'Completas',
    progressoPercent: 100,
    pecasConcluidas: 180,
    pecasTotal: 180,
    concluidoEmDate: '01/06/2026',
    dataEntrega: '05/06/2026',
    diasAtraso: 0
  },

  // KING & JOE PLAY (ID: '3')
  {
    id: 'kjp-1',
    marcaId: '3',
    codigoPill: 'K&',
    nome: 'INVERNO 26 - KING&JOE PLAY COLLECTION',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 30,
    pecasConcluidas: 64,
    pecasTotal: 214,
    concluidoEmDate: '22/07/2025',
    dataEntrega: '23/07/2025',
    diasAtraso: -406
  },
  {
    id: 'kjp-2',
    marcaId: '3',
    codigoPill: 'K&',
    nome: 'INVERNO 26 - KING&JOE PLAY PERENES',
    marcaNome: 'King & Joe Play',
    status: 'Completas',
    progressoPercent: 86,
    pecasConcluidas: 24,
    pecasTotal: 28,
    concluidoEmDate: '18/07/2025',
    dataEntrega: '18/07/2025',
    diasAtraso: -411
  },
  {
    id: 'kjp-3',
    marcaId: '3',
    codigoPill: 'K&',
    nome: 'VERÃO 27 - KING & JOE PLAY SPORT',
    marcaNome: 'King & Joe Play',
    status: 'Em andamento',
    progressoPercent: 12,
    pecasConcluidas: 30,
    pecasTotal: 259,
    concluidoEmDate: undefined,
    dataEntrega: '26/08/2026',
    diasAtraso: 0
  }
];

export const BrandCollectionsView: React.FC<BrandCollectionsViewProps> = ({ marca, onBack, onSelectMarca, onSelectColecao }) => {
  const { setActiveMarca } = useAuth();
  
  // Estado da marca exibida nesta tela
  const [currentMarca, setCurrentMarca] = useState<MarcaSummary>(marca);

  // Coleção selecionada para abrir o detalhamento (Com persistência no localStorage para F5 / Refresh)
  const [selectedColecao, setSelectedColecao] = useState<ColecaoItem | null>(() => {
    const savedColecaoId = localStorage.getItem('modaflow_selected_colecao_id');
    if (savedColecaoId) {
      return ALL_MOCK_COLECOES.find(c => c.id === savedColecaoId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (selectedColecao) {
      localStorage.setItem('modaflow_selected_colecao_id', selectedColecao.id);
    } else {
      localStorage.removeItem('modaflow_selected_colecao_id');
    }
  }, [selectedColecao]);

  // Estado do Quadro/Modal de alternar linhas
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Aba ativa interna: 'colecoes' | 'cronograma'
  const [activeSubTab, setActiveSubTab] = useState<'colecoes' | 'cronograma'>('colecoes');
  
  // Filtro de status: 'Em andamento' | 'Completas' | 'Arquivadas'
  const [statusFiltro, setStatusFiltro] = useState<'Em andamento' | 'Completas' | 'Arquivadas'>('Em andamento');

  // Busca e Ordenação
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'progress_desc' | 'name_asc'>('progress_desc');

  // Selecionar uma nova marca sem voltar para a home
  const handleSwitchBrand = (novaMarca: MarcaSummary) => {
    setCurrentMarca(novaMarca);
    setActiveMarca(novaMarca);
    if (onSelectMarca) {
      onSelectMarca(novaMarca);
    }
    setIsBrandModalOpen(false);
  };

  // Filtrar coleções pertencentes a esta marca
  const colecoesDaMarca = useMemo(() => {
    return ALL_MOCK_COLECOES.filter(c => c.marcaId === currentMarca.id || c.marcaNome.toLowerCase() === currentMarca.nome.toLowerCase());
  }, [currentMarca]);

  // Aplicar filtro de status e busca
  const colecoesFiltradas = useMemo(() => {
    let result = colecoesDaMarca.filter(c => c.status === statusFiltro);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.nome.toLowerCase().includes(q) || c.codigoPill.toLowerCase().includes(q));
    }

    if (sortOrder === 'progress_desc') {
      result.sort((a, b) => b.progressoPercent - a.progressoPercent);
    } else {
      result.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return result;
  }, [colecoesDaMarca, statusFiltro, searchQuery, sortOrder]);

  // Estatísticas Rápidas da Marca
  const totalColecoes = colecoesDaMarca.length;
  const emAndamentoCount = colecoesDaMarca.filter(c => c.status === 'Em andamento').length;
  const totalPecas = colecoesDaMarca.reduce((acc, c) => acc + c.pecasTotal, 0);
  const avgProgress = Math.round(
    colecoesDaMarca.reduce((acc, c) => acc + c.progressoPercent, 0) / (totalColecoes || 1)
  );

  // Se uma coleção foi selecionada, exibe a tela detalhada da coleção (10 abas)
  if (selectedColecao) {
    return (
      <CollectionDetailView
        marca={currentMarca}
        colecao={selectedColecao}
        onBackToBrand={() => setSelectedColecao(null)}
        onBackToHome={onBack}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* 1. BREADCRUMBS NO ESTILO DO MOCKUP (Ex: Início > King & Joe) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Início</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-extrabold px-2.5 py-1 bg-slate-100 rounded-lg">
            {currentMarca.nome}
          </span>
        </div>

        {/* BOTÃO ALTERNAR MARCA (ABRE QUADRO DE LINHAS SEM VOLTAR PARA A HOME) */}
        <button 
          type="button"
          onClick={() => setIsBrandModalOpen(true)}
          className="text-xs font-bold px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer shadow-2xs flex items-center gap-2"
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Alternar Marca</span>
        </button>
      </div>

      {/* 2. CARD HERO DARK GLASSMORPHIC FIEL AO MOCKUP DA IMAGEM DE REFERÊNCIA */}
      <div className="relative rounded-3xl bg-slate-950 text-white p-6 sm:p-8 shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Fundo com degradê escuro e luz sutil */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-xs"
          style={{ backgroundImage: `url(${marca.heroImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Esquerda: Badge, Título, Descrição e Botões de Ação [Coleções] [Cronograma] */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{marca.badgeTag || 'Linha Premium'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-editorial tracking-wide text-white">
              {marca.nome}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {marca.description}
            </p>

            {/* BOTÕES DE AÇÃO INTERNOS DO BANNER [COLEÇÕES] E [CRONOGRAMA] */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('colecoes')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'colecoes'
                    ? 'bg-white text-slate-950 shadow-lg scale-[1.02]'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                }`}
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Coleções</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('cronograma')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'cronograma'
                    ? 'bg-white text-slate-950 shadow-lg scale-[1.02]'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Cronograma</span>
              </button>
            </div>
          </div>

          {/* Direita: BL OCO DE MÉT RICAS PARECIDO COM O DA IMAGEM DE REFERÊNCIA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shrink-0 shadow-lg">
            <div className="text-center px-3 py-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                Coleções
              </span>
              <span className="text-2xl font-black text-white">{totalColecoes}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                Em Produção
              </span>
              <span className="text-2xl font-black text-blue-400">{emAndamentoCount}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                Total Peças
              </span>
              <span className="text-2xl font-black text-emerald-400">{totalPecas}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                Progresso
              </span>
              <span className="text-2xl font-black text-amber-400">{avgProgress}%</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. CONTEÚDO DA ABA SELECIONADA */}
      {activeSubTab === 'colecoes' && (
        <div className="space-y-5">
          
          {/* BARRA DE FILTROS, PESQUISA E ORDENAÇÃO NO ESTILO DA IMAGEM DE REFERÊNCIA */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFiltro('Em andamento')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFiltro === 'Em andamento'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Em andamento ({colecoesDaMarca.filter(c => c.status === 'Em andamento').length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFiltro('Completas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFiltro === 'Completas'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Completas ({colecoesDaMarca.filter(c => c.status === 'Completas').length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFiltro('Arquivadas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFiltro === 'Arquivadas'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Arquivadas ({colecoesDaMarca.filter(c => c.status === 'Arquivadas').length})
              </button>
            </div>

            {/* Ações Direita: Buscar Coleção, Contador & Ordenação */}
            <div className="flex items-center gap-3">
              
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar coleção..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'progress_desc' ? 'name_asc' : 'progress_desc')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{sortOrder === 'progress_desc' ? 'Progresso' : 'Nome'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

            </div>

          </div>

          {/* GRID DE CARDS FIEL AO DESIGN DA IMAGEM DE REFERÊNCIA (3 COLUNAS) */}
          {colecoesFiltradas.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Nenhuma coleção encontrada</h4>
              <p className="text-xs text-slate-400">Tente alternar o filtro de status ou limpar o campo de busca.</p>
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
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between relative group cursor-pointer"
                  >
                    <div>
                      {/* Topo do Card: Badge de Código (KB, KJ, K&) à Esquerda e Badge % Dourado à Direita */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-[11px] tracking-wider uppercase">
                          {c.codigoPill}
                        </span>

                        {/* BADGE DE PROGRESSO % DOURADO (FIEL À IMAGEM DE REFERÊNCIA: 20%, 210%, ETC) */}
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black">
                          {c.progressoPercent}%
                        </span>
                      </div>

                      {/* Título da Coleção */}
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-snug group-hover:text-blue-600 transition min-h-[40px]">
                        {c.nome}
                      </h3>
                    </div>

                    {/* BARRA DE PROGRESSO SLIM RE-IMAGINADA */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500">Progresso da coleção</span>
                        <span className="font-bold text-slate-900">{c.progressoPercent}%</span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isEntregue ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${c.progressoPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* DETALHES DE PEÇAS E PRAZOS (PEÇAS CONCLUÍDAS, ENTREGA EM, DATA DE ENTREGA) */}
                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Peças concluídas</span>
                        <strong className="text-slate-900 font-bold">{c.pecasConcluidas} de {c.pecasTotal}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Entrega em</span>
                        <strong className="text-slate-900 font-bold">{c.diasAtraso} dias</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Data de Entrega</span>
                        <strong className="text-slate-900 font-bold">{c.dataEntrega}</strong>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 4. ABA CRONOGRAMA DA IMAGEM DE REFERÊNCIA */}
      {activeSubTab === 'cronograma' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>Cronograma & Marcos de Produção — {marca.nome}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Acompanhamento temporal dos marcos de entrega de coleções</p>
            </div>

            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              Visão Cronológica PLM
            </span>
          </div>

          <div className="space-y-6 pt-2">
            {colecoesDaMarca.map((c, index) => (
              <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-950 uppercase">{c.nome}</h4>
                      <span className="text-[11px] text-slate-500 font-semibold">{c.pecasTotal} peças • Entrega: {c.dataEntrega}</span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    c.progressoPercent === 100 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {c.progressoPercent}% Concluído
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">1. Design & Estilo</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">2. Modelagem & Ficha</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">3. Pilotagem & Corte</span>
                    <span className={`font-bold flex items-center gap-1 mt-0.5 ${c.progressoPercent > 50 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      <Clock className="w-3.5 h-3.5" /> {c.progressoPercent > 50 ? 'Concluído' : 'Em andamento'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">4. Produção & ERP</span>
                    <span className={`font-bold flex items-center gap-1 mt-0.5 ${c.progressoPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {c.progressoPercent === 100 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {c.progressoPercent === 100 ? 'Entregue' : 'Aguardando'}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 5. QUADRO DE ALTERNAR LINHA / MARCA (MODAL INTERATIVO SEM IR PARA A HOME) */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl max-w-xl w-full space-y-6 animate-in fade-in zoom-in-95">
            
            {/* Header do Quadro */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Linhas & Marcas da Organização</h3>
                  <p className="text-xs text-slate-500">Selecione para alternar a visão instantaneamente</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
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
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`px-3 py-2.5 rounded-xl font-black text-xs tracking-wider border shrink-0 ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {m.initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{m.nome}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {m.badgeTag}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                          {m.colecoesCount} Coleções • {m.pecasCount} Peças
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-blue-600 hover:underline">
                          Selecionar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé do Quadro */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
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
