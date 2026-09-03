/**
 * ============================================================================
 * MÓDULO: Visão Detalhada da Coleção (CollectionDetailView)
 * ARQUIVO: src/pages/Home/components/CollectionDetailView.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Tela detalhada da coleção selecionada com as 10 abas fiéis aos
 *            prints enviados: Peças, Temas, Cores, Painéis, Estampas, Reserva
 *            de Tecidos, Reserva de Aviamentos, Mix, Metas e Cronograma.
 * ============================================================================
 */

import React, { useState } from 'react';
import type { MarcaSummary } from '../../../types/auth';
import type { ColecaoItem, PecaItem } from '../../../types/plm';
import { 
  ChevronRight, 
  ArrowLeft, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Sun, 
  Filter, 
  Grid, 
  Download, 
  Image as ImageIcon, 
  ChevronDown,
  X,
  Target,
  Edit2,
  FileSpreadsheet
} from 'lucide-react';

interface CollectionDetailViewProps {
  marca: MarcaSummary;
  colecao: ColecaoItem & { codigoPill?: string; temporada?: string; ano?: string };
  onBackToBrand: () => void;
  onBackToHome: () => void;
}

// MOCK DE PEÇAS DA COLEÇÃO SELECIONADA
const MOCK_PECAS_COLECAO: PecaItem[] = [
  {
    id: 'p1',
    codigo: 'CSPL006J',
    nome: 'Camisa CSPL006J',
    tipo: 'Camisa',
    status: 'Em andamento',
    etapaAtual: 'Costura Piloto',
    tema: 'Base',
    colecaoNome: 'PL',
    marcaNome: 'K&J Black',
    estilista: 'Mariana Barbosa',
    tecidos: ['Tricoline Hi Flex', 'Entrela Rolo'],
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop',
    custo: 120.00,
    preco: 349.90,
    previsaoEntrega: '15/09/2026'
  },
  {
    id: 'p2',
    codigo: 'CSPL014J',
    nome: 'Camisa CSPL014J',
    tipo: 'Camisa',
    status: 'Em andamento',
    etapaAtual: 'Aprovação de Ficha',
    tema: 'Base',
    colecaoNome: 'PL',
    marcaNome: 'K&J Black',
    estilista: 'Mariana Barbosa',
    tecidos: ['Cotton Pinpoint Span'],
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop',
    custo: 135.00,
    preco: 389.90,
    previsaoEntrega: '20/09/2026'
  },
  {
    id: 'p3',
    codigo: 'CSPL017J',
    nome: 'Camisa CSPL017J',
    tipo: 'Camisa',
    status: 'A desenhar',
    etapaAtual: 'Croqui em Definição',
    tema: 'Base',
    colecaoNome: 'PL',
    marcaNome: 'K&J Black',
    estilista: 'Ivonete Barbosa',
    tecidos: ['Malha Suedine Poliamida'],
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
    custo: 98.00,
    preco: 299.90,
    previsaoEntrega: '30/09/2026'
  },
  {
    id: 'p4',
    codigo: 'CSPL024J',
    nome: 'Camisa CSPL024J',
    tipo: 'Camisa',
    status: 'Completa',
    etapaAtual: 'Piloto Entregue',
    tema: 'Base',
    colecaoNome: 'PL',
    marcaNome: 'K&J Black',
    estilista: 'Fabiano',
    tecidos: ['Tricoline Blend Span'],
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=600&auto=format&fit=crop',
    custo: 110.00,
    preco: 329.90,
    previsaoEntrega: '05/10/2026'
  },
  {
    id: 'p5',
    codigo: 'CSPL015J',
    nome: 'Camisa CSPL015J',
    tipo: 'Camisa',
    status: 'Em andamento',
    etapaAtual: 'Corte Amostra',
    tema: 'Base',
    colecaoNome: 'PL',
    marcaNome: 'K&J Black',
    estilista: 'Beatris Sgarioni',
    tecidos: ['Piquet Pima Cores'],
    imagemCroquiUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop',
    custo: 140.00,
    preco: 399.90,
    previsaoEntrega: '12/10/2026'
  }
];

/**
 * Componente Reutilizável de Input com Pop-up de Calendário (DatePicker)
 */
const DatePickerInput: React.FC<{
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}> = ({ placeholder, value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const daysInMonth = 30; // Setembro tem 30 dias
  const startDay = 2; // Terça-feira

  const handleSelectDay = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formatted = `${formattedDay}/09/2026`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className={className || "w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none cursor-pointer pr-7 text-slate-800"}
        />
        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
      </div>

      {/* POP-UP DO CALENDÁRIO FLUTUANTE PARA SELEÇÃO DE DATA */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 font-sans">
          {/* Header do Mês */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black text-slate-900">
              Setembro 2026
            </span>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
            <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
          </div>

          {/* Grid de Dias */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: startDay }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayStr = day < 10 ? `0${day}` : `${day}`;
              const isSelected = value.startsWith(dayStr);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-7 h-7 rounded-lg font-semibold flex items-center justify-center transition cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'hover:bg-blue-50 text-slate-700 hover:text-blue-600'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Rodapé do Pop-up */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <button
              type="button"
              onClick={() => handleSelectDay(3)}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Hoje (03/09/2026)
            </button>

            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="text-slate-400 font-bold hover:text-slate-700 cursor-pointer"
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente Reutilizável de Reserva de Materiais (Tecidos ou Aviamentos - Prints 1 e 2)
 */
const ReservaMateriaisTab: React.FC<{
  tituloReserva: string;
  rotuloMaterial: string;
}> = ({ tituloReserva, rotuloMaterial }) => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [buscaMaterial, setBuscaMaterial] = useState('');

  return (
    <div className="space-y-6">
      {/* 1. FILTROS DA RESERVA (FIEL AOS PRINTS 1 E 2 COM POP-UP DE DATA) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros
        </h4>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-4">
            <span className="w-36 text-slate-600 font-semibold">Estilista</span>
            <button className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold">Todas</button>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-36 text-slate-600 font-semibold">Responsável pela reserva</span>
            <button className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold">Todas</button>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-36 text-slate-600 font-semibold">Data de cadastro da reserva</span>
            <div className="flex items-center gap-2">
              <DatePickerInput
                placeholder="Início"
                value={dataInicio}
                onChange={(val) => setDataInicio(val)}
              />
              <span className="text-slate-400">-</span>
              <DatePickerInput
                placeholder="Fim"
                value={dataFim}
                onChange={(val) => setDataFim(val)}
              />
              <button 
                type="button"
                onClick={() => { setDataInicio(''); setDataFim(''); }}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Limpar Datas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <span className="w-36 text-slate-600 font-semibold">Busca</span>
            <input
              type="text"
              placeholder="Busca"
              value={buscaMaterial}
              onChange={(e) => setBuscaMaterial(e.target.value)}
              className="w-64 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. TABELA DE RESERVAS DE MATERIAL (FIEL AOS PRINTS 1 E 2) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900">{tituloReserva}</h3>
          
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
              Opções ▾
            </button>
            <button className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-md transition cursor-pointer">
              <Plus className="w-4 h-4" /> Reserva +
            </button>
          </div>
        </div>

        {/* Tabela de Reservas */}
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-100">
            <span>0-0 of 0</span>
            <div className="flex items-center gap-2">
              <button disabled className="opacity-40">&lt;</button>
              <button disabled className="opacity-40">&gt;</button>
            </div>
          </div>

          <table className="w-full text-left text-xs font-medium text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3 w-10">
                  <input type="checkbox" className="rounded-md border-slate-300 text-blue-600" defaultChecked />
                </th>
                <th className="p-3">{rotuloMaterial}</th>
                <th className="p-3">Cor</th>
                <th className="p-3">Reservado</th>
                <th className="p-3">Utilizado</th>
                <th className="p-3">Completas</th>
                <th className="p-3">Observações</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                  Nenhum item de reserva cadastrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  marca,
  colecao,
  onBackToBrand,
  onBackToHome
}) => {
  // Aba ativa interna (as 10 abas)
  const [activeTab, setActiveTab] = useState<
    'pecas' | 'temas' | 'cores' | 'paineis' | 'estampas' | 'reserva_tecidos' | 'reserva_aviamentos' | 'mix' | 'metas' | 'cronograma'
  >('pecas');

  // Busca de Peças
  const [searchPeca, setSearchPeca] = useState('');

  // Modal / Tela de Definição de Metas (Print 4)
  const [isDefinirMetasOpen, setIsDefinirMetasOpen] = useState(false);
  const [metaEtapa, setMetaEtapa] = useState('');
  const [metaDataInicio, setMetaDataInicio] = useState('03/09/2026');
  const [metaDataEntrega, setMetaDataEntrega] = useState('');

  // Dropdown de Opções no Mix (Print 3)
  const [isMixOptionsOpen, setIsMixOptionsOpen] = useState(false);

  // Sub-aba do Cronograma: 'tabela' | 'gantt' (Print 5)
  const [cronogramaSubTab, setCronogramaSubTab] = useState<'tabela' | 'gantt'>('tabela');

  // Estados de seleção dos Filtros de Peças
  const [selectedTemaFilter, setSelectedTemaFilter] = useState('Todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Todas');
  const [selectedTipoFilter, setSelectedTipoFilter] = useState('Todas');
  const [selectedEstilistaFilter, setSelectedEstilistaFilter] = useState('Todas');
  const [selectedTecidoFilter, setSelectedTecidoFilter] = useState('Todas');

  // Determinar Temporada e Ano
  const temporadaExtraida = colecao.nome.toLowerCase().includes('inverno')
    ? 'Inverno'
    : colecao.nome.toLowerCase().includes('verão')
    ? 'Verão'
    : 'Atemporal';

  const anoExtraido = colecao.nome.match(/\b(20\d{2}(-\d{2})?|\d{2})\b/)?.[0] || '2026';

  // Verificar se a coleção possui data de conclusão (Orientação 1)
  const isConcluido = colecao.progressoPercent === 100 || !!colecao.concluidoEmDate;

  // Filtrar Peças dinamicamente
  const pecasFiltradas = MOCK_PECAS_COLECAO.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchPeca.toLowerCase()) || 
                          p.codigo.toLowerCase().includes(searchPeca.toLowerCase());

    const matchesTema = selectedTemaFilter === 'Todas' || p.tema === selectedTemaFilter;
    const matchesStatus = selectedStatusFilter === 'Todas' || p.status === selectedStatusFilter;
    const matchesTipo = selectedTipoFilter === 'Todas' || p.tipo === selectedTipoFilter;
    const matchesEstilista = selectedEstilistaFilter === 'Todas' || p.estilista === selectedEstilistaFilter;
    const matchesTecido = selectedTecidoFilter === 'Todas' || p.tecidos.some(t => t.toLowerCase().includes(selectedTecidoFilter.toLowerCase()));

    return matchesSearch && matchesTema && matchesStatus && matchesTipo && matchesEstilista && matchesTecido;
  });

  return (
    <div className="space-y-6 font-sans pb-16">
      
      {/* 1. BREADCRUMBS FLUTUANTES (Início > [Marca] > [Nome da Coleção]) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button 
            type="button"
            onClick={onBackToHome}
            className="hover:text-blue-600 transition cursor-pointer font-medium text-slate-600"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button 
            type="button"
            onClick={onBackToBrand}
            className="hover:text-blue-600 transition cursor-pointer font-medium text-slate-600"
          >
            {marca.nome}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-extrabold px-2.5 py-1 bg-slate-100 rounded-lg">
            {colecao.nome}
          </span>
        </div>

        <button 
          type="button"
          onClick={onBackToBrand}
          className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para {marca.nome}</span>
        </button>
      </div>

      {/* 2. HEADER DA COLEÇÃO (ORIENTAÇÃO 1: TEMPORADA, ANO, DATA CONCLUSÃO CONDICIONAL) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold font-editorial text-neutral-900 tracking-wide">
            Coleção {colecao.nome}
          </h1>

          <button 
            type="button"
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Opções</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* PAINEL DE METADADOS: TEMPORADA, ANO E DATA DE CONCLUSÃO (ORIENTAÇÃO 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs pt-1">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Temporada
            </span>
            <strong className="text-xs font-semibold text-slate-700 block">
              {temporadaExtraida}
            </strong>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Ano
            </span>
            <strong className="text-xs font-semibold text-slate-700 block">
              {anoExtraido}
            </strong>
          </div>

          {/* EXIBIDO SOMENTE SE A COLEÇÃO TIVER SIDO CONCLUÍDA (ORIENTAÇÃO 1) */}
          {isConcluido && (
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Data de Conclusão
              </span>
              <strong className="text-xs font-semibold text-slate-700 block">
                {colecao.concluidoEmDate || '18/07/2025'}
              </strong>
            </div>
          )}

          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block mb-1">
              Progresso Geral
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 inline-block">
              {colecao.progressoPercent}% Concluído
            </span>
          </div>
        </div>

      </div>

      {/* 3. AS 10 SUB-ABAS HORIZONTAIS INTERATIVAS */}
      <div className="border-b border-slate-200 bg-white px-4 sm:px-6 rounded-2xl shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-6 text-xs font-bold whitespace-nowrap min-w-max">
          {[
            { id: 'pecas', label: 'Peças' },
            { id: 'temas', label: 'Temas' },
            { id: 'cores', label: 'Cores' },
            { id: 'paineis', label: 'Painéis' },
            { id: 'estampas', label: 'Estampas' },
            { id: 'reserva_tecidos', label: 'Reserva de Tecidos' },
            { id: 'reserva_aviamentos', label: 'Reserva de Aviamentos' },
            { id: 'mix', label: 'Mix' },
            { id: 'metas', label: 'Metas' },
            { id: 'cronograma', label: 'Cronograma' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 border-b-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CONTEÚDO DAS SUB-ABAS */}

      {/* 4.1 ABA 1: PEÇAS (COM SEÇÃO DE FILTROS DE PEÇAS FIEL AO PRINT DO SISTEMA) */}
      {activeTab === 'pecas' && (
        <div className="space-y-6">
          
          {/* SEÇÃO "FILTROS DE PEÇAS" (FIEL À IMAGEM DO SISTEMA) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros de peças
              </h3>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 shadow-2xs cursor-pointer"
                >
                  Canceladas
                </button>
                <button 
                  type="button"
                  className="px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>⚙ Filtro</span>
                </button>
              </div>
            </div>

            {/* LINHAS DE FILTROS (TEMA, STATUS, TIPO, ESTILISTA, ETAPAS, TECIDOS) */}
            <div className="space-y-3 text-xs">
              
              {/* Tema */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold text-slate-600">Tema</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['Todas', 'Base'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTemaFilter(t)}
                      className={`px-3 py-0.5 rounded-md text-xs transition cursor-pointer ${
                        selectedTemaFilter === t
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200'
                      }`}
                    >
                      {t} <span className={selectedTemaFilter === t ? 'opacity-80' : 'text-slate-400'}>10</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold text-slate-600">Status</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: 'Todas', val: 'Todas', count: 10 },
                    { label: 'A desenhar', val: 'A desenhar', count: 1 },
                    { label: 'Completas', val: 'Completa', count: 2 },
                    { label: 'Em andamento', val: 'Em andamento', count: 7 },
                  ].map(s => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setSelectedStatusFilter(s.val)}
                      className={`px-3 py-0.5 rounded-md text-xs transition cursor-pointer ${
                        selectedStatusFilter === s.val
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200'
                      }`}
                    >
                      {s.label} <span className={selectedStatusFilter === s.val ? 'opacity-80' : 'text-slate-400'}>{s.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de peça */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold text-slate-600">Tipo de peça</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: 'Todas', val: 'Todas', count: 10 },
                    { label: 'Camisa', val: 'Camisa', count: 6 },
                    { label: 'Polo', val: 'Polo', count: 4 },
                  ].map(t => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setSelectedTipoFilter(t.val)}
                      className={`px-3 py-0.5 rounded-md text-xs transition cursor-pointer ${
                        selectedTipoFilter === t.val
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200'
                      }`}
                    >
                      {t.label} <span className={selectedTipoFilter === t.val ? 'opacity-80' : 'text-slate-400'}>{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estilista */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold text-slate-600">Estilista</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: 'Todas', val: 'Todas', count: 10 },
                    { label: 'Mariana Barbosa', val: 'Mariana Barbosa', count: 2 },
                    { label: 'Ivonete Barbosa', val: 'Ivonete Barbosa', count: 1 },
                    { label: 'Fabiano', val: 'Fabiano', count: 1 },
                    { label: 'Beatris Sgarioni', val: 'Beatris Sgarioni', count: 1 },
                  ].map(e => (
                    <button
                      key={e.val}
                      type="button"
                      onClick={() => setSelectedEstilistaFilter(e.val)}
                      className={`px-3 py-0.5 rounded-md text-xs transition cursor-pointer ${
                        selectedEstilistaFilter === e.val
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200'
                      }`}
                    >
                      {e.label} <span className={selectedEstilistaFilter === e.val ? 'opacity-80' : 'text-slate-400'}>{e.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tecidos */}
              <div className="flex flex-start gap-3">
                <span className="w-28 font-semibold text-slate-600 pt-1">Tecidos</span>
                <div className="flex flex-wrap items-center gap-1.5 max-w-4xl">
                  {[
                    { label: 'Todas', val: 'Todas' },
                    { label: 'COTTON PINPOINT SPAN', val: 'Cotton Pinpoint' },
                    { label: 'ENTRETELA ROLO', val: 'Entrela Rolo' },
                    { label: 'MALHA SUEDINE POLIAMIDA', val: 'Malha Suedine' },
                    { label: 'PIQUET PIMA CORES', val: 'Piquet Pima' },
                    { label: 'TECIDO URBAN HI FLEX', val: 'Tricoline Hi Flex' },
                    { label: 'TRICOLINE BLEND SPAN', val: 'Tricoline Blend' },
                  ].map(tec => (
                    <button
                      key={tec.val}
                      type="button"
                      onClick={() => setSelectedTecidoFilter(tec.val)}
                      className={`px-2.5 py-0.5 rounded-md text-[11px] transition cursor-pointer ${
                        selectedTecidoFilter === tec.val
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold border border-slate-200'
                      }`}
                    >
                      {tec.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* BARRA SUPERIOR DE QUANTIDADE DE PEÇAS E BUSCA */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-extrabold text-slate-800">
                {pecasFiltradas.length} Peças
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Coleção {colecao.nome}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Procurar pelo nome, código..."
                  value={searchPeca}
                  onChange={(e) => setSearchPeca(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1">
                <span>Tipo de Peça</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 flex items-center gap-1 shadow-2xs">
                <Grid className="w-3.5 h-3.5 text-slate-400" /> Miniaturas
              </button>

              <button className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 flex items-center gap-1 shadow-2xs">
                <Download className="w-3.5 h-3.5 text-slate-400" /> Exportar
              </button>

              <button className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-md transition cursor-pointer">
                <Plus className="w-4 h-4" /> Peças +
              </button>
            </div>
          </div>

          {/* GRID DE PEÇAS COM DETALHES COMPLETOS FIÉIS AO PRINT DO SISTEMA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pecasFiltradas.map((peca) => (
              <div 
                key={peca.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between group cursor-pointer"
              >
                {/* Imagem / Croqui */}
                <div className="w-full h-44 bg-slate-100 rounded-xl overflow-hidden relative">
                  <img 
                    src={peca.imagemCroquiUrl} 
                    alt={peca.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                    {peca.etapaAtual}
                  </span>
                </div>

                {/* Header do Card (Camisa CSPL006J / Tema) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{peca.tipo}</span>
                    <span className="font-semibold text-slate-400 text-[11px]">{peca.codigo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {peca.tema}
                  </div>
                </div>

                {/* Detalhes de Status, Etapa, Estilista e Tecidos (Fiel à Imagem 2 do Sistema) */}
                <div className="space-y-1 text-[11px] pt-2 border-t border-slate-100 text-slate-600 leading-tight">
                  <div>
                    Status: <strong className="text-slate-800 font-semibold">{peca.status}</strong>
                  </div>
                  <div>
                    Etapa: <strong className="text-slate-700 font-normal">{peca.etapaAtual || '—'}</strong>
                  </div>
                  <div>
                    Previsão: <strong className="text-slate-700 font-normal">{peca.previsaoEntrega || '—'}</strong>
                  </div>
                  <div>
                    Estilista: <strong className="text-slate-700 font-normal">{peca.estilista || '—'}</strong>
                  </div>
                  <div className="truncate text-slate-500 pt-0.5">
                    Tecidos: <span className="text-slate-700 font-normal">{peca.tecidos.join(', ')}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 4.2 ABA 2: TEMAS */}
      {activeTab === 'temas' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Pendentes</h3>
            <div className="flex items-center gap-2">
              <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" /> Filtrar
              </button>
              <button className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-md">
                <Plus className="w-4 h-4" /> Tema
              </button>
            </div>
          </div>

          <div className="w-full sm:w-80 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="w-full h-36 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
              <ImageIcon className="w-10 h-10 text-slate-300" />
            </div>

            <h4 className="text-sm font-black text-slate-900 uppercase">Base</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Progresso</span>
                <strong className="text-slate-900 font-bold">38%</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Peças concluídas</span>
                <strong className="text-slate-900 font-bold">53 de 141 peças</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cores</span>
                <strong className="text-slate-400">—</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estampas</span>
                <strong className="text-slate-400">—</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.3 ABA 3: CORES */}
      {activeTab === 'cores' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros de cores
            </h4>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600 font-medium">Paleta</span>
              <button className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold">Todas</button>
              <button className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">Sem paleta</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Busca</label>
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Procurar cor pelo nome, código..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Cores</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">Selecionar todas</button>
              <button className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">Opções ▾</button>
              <button className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1">+ Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* 4.4 ABA 4: PAINÉIS */}
      {activeTab === 'paineis' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Painéis</h3>
            <button className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-md">
              <Plus className="w-4 h-4" /> Novo
            </button>
          </div>
          <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Nenhum painel cadastrado nesta coleção.
          </div>
        </div>
      )}

      {/* 4.5 ABA 5: ESTAMPAS */}
      {activeTab === 'estampas' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros de estampas
            </h4>
            <p className="text-xs text-slate-400 italic">Não há opções de filtro no momento</p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">0 Estampas</h3>
            <div className="flex items-center gap-2">
              <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-blue-700">Ordenação (Tipo)</button>
              <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-blue-50 text-xs font-bold text-blue-700">✓ Todas</button>
              <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700">Miniatura</button>
              <button className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700">Opções ▾</button>
              <button className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1">+ Estampa</button>
            </div>
          </div>
        </div>
      )}

      {/* 4.6 ABA 6: RESERVA DE TECIDOS (REUTILIZANDO COMPONENTE - PRINT 1) */}
      {activeTab === 'reserva_tecidos' && (
        <ReservaMateriaisTab
          tituloReserva="Reservas de material"
          rotuloMaterial="Tecido"
        />
      )}

      {/* 4.7 ABA 7: RESERVA DE AVIAMENTOS (REUTILIZANDO COMPONENTE - PRINT 2) */}
      {activeTab === 'reserva_aviamentos' && (
        <ReservaMateriaisTab
          tituloReserva="Reservas de aviamento"
          rotuloMaterial="Aviamento"
        />
      )}

      {/* 4.8 ABA 8: MIX (FIEL AO PRINT 3) */}
      {activeTab === 'mix' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 relative">
            <h3 className="text-base font-bold text-slate-900">Planejamento do Mix</h3>

            {/* Menu Opções Dropdown */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsMixOptionsOpen(!isMixOptionsOpen)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Opções</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isMixOptionsOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 text-xs">
                  <button className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl flex items-center justify-between">
                    <span>Editar</span>
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl flex items-center justify-between">
                    <span>Exportar (Agrupado)</span>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl flex items-center justify-between">
                    <span>Exportar (Detalhado)</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Mix</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-6 text-xs text-slate-600">
                <span className="font-bold text-slate-900">Total</span>
                <span>Planejado: <strong>0</strong></span>
                <span>Executado: <strong>0</strong></span>
                <span>Concluído: <strong>0</strong></span>
              </div>

              {/* Barra do Mix Lilás (Fiel ao Print 3) */}
              <div className="w-full h-3 bg-indigo-100 rounded-full overflow-hidden" />
            </div>
          </div>
        </div>
      )}

      {/* 4.9 ABA 9: METAS (NOVO BLOCO RESULTADOS + BOTÃO DEFINIR METAS) */}
      {activeTab === 'metas' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Resultados</h3>
          </div>

          <div className="p-12 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Target className="w-12 h-12 text-blue-600 mx-auto" />
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Definição de Metas da Coleção</h4>
              <p className="text-xs text-slate-500">Defina as etapas e prazos limite para estabelecer as metas de produção.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsDefinirMetasOpen(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>Definir Metas</span>
            </button>
          </div>
        </div>
      )}

      {/* 4.10 ABA 10: CRONOGRAMA (FIEL AO PRINT 5) */}
      {activeTab === 'cronograma' && (
        <div className="space-y-6">
          
          {/* FILTROS DO CRONOGRAMA (FIEL AO PRINT 5) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros
              </h4>
              <button className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-md">
                <Plus className="w-4 h-4" /> Atividade +
              </button>
            </div>

            <div className="flex items-center gap-8 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Busca</label>
                <input
                  type="text"
                  placeholder=""
                  className="w-48 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Responsáveis</label>
                <input
                  type="text"
                  placeholder=""
                  className="w-48 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SUB-ABAS TABELA | GANTT & TABELA DE CRONOGRAMA (FIEL AO PRINT 5) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-4 text-xs font-bold border-b border-slate-100 pb-3">
              <button
                onClick={() => setCronogramaSubTab('tabela')}
                className={`pb-1 border-b-2 transition ${
                  cronogramaSubTab === 'tabela' ? 'border-blue-600 text-blue-600' : 'text-slate-400'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setCronogramaSubTab('gantt')}
                className={`pb-1 border-b-2 transition ${
                  cronogramaSubTab === 'gantt' ? 'border-blue-600 text-blue-600' : 'text-slate-400'
                }`}
              >
                Gantt
              </button>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">Cronograma</h3>
            </div>

            <div className="overflow-x-auto">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-100">
                <span>0-0 de 0</span>
                <div className="flex items-center gap-2">
                  <button disabled className="opacity-40">&lt;</button>
                  <button disabled className="opacity-40">&gt;</button>
                </div>
              </div>

              <table className="w-full text-left text-xs font-medium text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3 w-10">
                      <input type="checkbox" className="rounded-md border-slate-300 text-blue-600" />
                    </th>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Período</th>
                    <th className="p-3">Etapa</th>
                    <th className="p-3">Responsáveis</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                      Nenhum item listado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 5. TELA / MODAL DE DEFINIÇÃO DE METAS (FIEL AO PRINT 4) */}
      {isDefinirMetasOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl max-w-4xl w-full space-y-6 animate-in fade-in zoom-in-95">
            
            {/* Header do Form */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Definição de Metas de Produção</h3>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Status: Ainda não criado
              </span>
            </div>

            {/* FORMULÁRIO DE ETAPA, DATAS (FIEL AO PRINT 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Etapa</label>
                <select
                  value={metaEtapa}
                  onChange={(e) => setMetaEtapa(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="">Escolha ou digite uma etapa</option>
                  <option value="estilo">1. Estilo & Design</option>
                  <option value="modelagem">2. Modelagem & Piloto</option>
                  <option value="corte">3. Corte & Liberação</option>
                  <option value="producao">4. Produção Industrial</option>
                </select>
                <span className="text-[10px] text-slate-400 block">Selecione as etapas que definem uma meta concluída.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Data de início</label>
                <DatePickerInput
                  placeholder="03/09/2026"
                  value={metaDataInicio}
                  onChange={(val) => setMetaDataInicio(val)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none cursor-pointer text-slate-800 pr-8"
                />
                <span className="text-[10px] text-slate-400 block">Selecione a data de início das metas.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Data de entrega</label>
                <DatePickerInput
                  placeholder="Ex.: 4/5/2021"
                  value={metaDataEntrega}
                  onChange={(val) => setMetaDataEntrega(val)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none cursor-pointer text-slate-800 pr-8"
                />
                <span className="text-[10px] text-slate-400 block">Selecione a data de entrega das metas.</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                Adicionar datas manualmente
              </button>
            </div>

            {/* BOTÕES INFERIORES: ATUALIZAR & FECHAR (FIEL AO PRINT 4) */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDefinirMetasOpen(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Atualizar
              </button>

              <button
                type="button"
                onClick={() => setIsDefinirMetasOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
