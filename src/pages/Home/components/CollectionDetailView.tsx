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

  const daysInMonth = 30;
  const startDay = 2;

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
          className={className || "w-32 px-3 py-1.5 bg-surface-muted border border-border rounded-lg text-xs font-medium focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none cursor-pointer pr-7 text-primary transition-all duration-200"}
        />
        <Calendar className="w-3.5 h-3.5 text-muted absolute right-2.5 pointer-events-none" strokeWidth={1.5} />
      </div>

      {/* POP-UP DO CALENDÁRIO FLUTUANTE PARA SELEÇÃO DE DATA */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in duration-200 font-sans">
          {/* Header do Mês */}
          <div className="flex items-center justify-between border-b border-border-muted pb-2">
            <span className="text-xs font-bold text-primary">
              Setembro 2026
            </span>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-surface-muted rounded-md text-muted hover:text-primary cursor-pointer transition-colors duration-200"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted">
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
                  className={`w-7 h-7 rounded-md font-semibold flex items-center justify-center transition-all duration-200 cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-accent-camel text-white font-bold shadow-2xs'
                      : 'hover:bg-accent-camel/10 text-primary hover:text-accent-camel'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Rodapé do Pop-up */}
          <div className="pt-2 border-t border-border-muted flex items-center justify-between text-[10px]">
            <button
              type="button"
              onClick={() => handleSelectDay(3)}
              className="text-accent-camel font-bold hover:underline cursor-pointer"
            >
              Hoje (03/09/2026)
            </button>

            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="text-muted font-bold hover:text-primary cursor-pointer"
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
 * Componente Reutilizável de Reserva de Materiais (Tecidos ou Aviamentos)
 */
const ReservaMateriaisTab: React.FC<{
  tituloReserva: string;
  rotuloMaterial: string;
}> = ({ tituloReserva, rotuloMaterial }) => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [buscaMaterial, setBuscaMaterial] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. FILTROS DA RESERVA (CARD NÍVEL 2) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
        <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Filtros
        </h4>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-4">
            <span className="w-36 text-muted-foreground font-semibold">Estilista</span>
            <button className="px-3 py-1 rounded-md bg-accent-camel text-white font-bold transition-all duration-200">Todas</button>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-36 text-muted-foreground font-semibold">Responsável pela reserva</span>
            <button className="px-3 py-1 rounded-md bg-accent-camel text-white font-bold transition-all duration-200">Todas</button>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-36 text-muted-foreground font-semibold">Data de cadastro da reserva</span>
            <div className="flex items-center gap-2">
              <DatePickerInput
                placeholder="Início"
                value={dataInicio}
                onChange={(val) => setDataInicio(val)}
              />
              <span className="text-muted">-</span>
              <DatePickerInput
                placeholder="Fim"
                value={dataFim}
                onChange={(val) => setDataFim(val)}
              />
              <button 
                type="button"
                onClick={() => { setDataInicio(''); setDataFim(''); }}
                className="p-1 text-muted hover:text-primary cursor-pointer transition-colors duration-200"
                title="Limpar Datas"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <span className="w-36 text-muted-foreground font-semibold">Busca</span>
            <input
              type="text"
              placeholder="Busca"
              value={buscaMaterial}
              onChange={(e) => setBuscaMaterial(e.target.value)}
              className="w-64 px-3.5 py-1.5 bg-surface-muted border border-border rounded-lg text-xs focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* 2. TABELA DE RESERVAS DE MATERIAL (CARD NÍVEL 2 - FRENTE 5: DENSIDADE DE TABELAS) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h3 className="text-sm font-bold font-editorial text-primary">{tituloReserva}</h3>
          
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-1.5 rounded-lg border border-border bg-surface-muted text-xs font-bold text-muted-foreground hover:bg-border-muted transition-all duration-200 cursor-pointer">
              Opções ▾
            </button>
            <button className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all duration-200 cursor-pointer">
              <Plus className="w-4 h-4" /> Reserva +
            </button>
          </div>
        </div>

        {/* Tabela de Reservas com Zebra Striping e Padding py-3 */}
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted pb-2 border-b border-border-muted">
            <span>0-0 de 0</span>
            <div className="flex items-center gap-2">
              <button disabled className="opacity-40">&lt;</button>
              <button disabled className="opacity-40">&gt;</button>
            </div>
          </div>

          <table className="w-full text-left text-xs font-medium text-muted-foreground">
            <thead>
              <tr className="border-b border-border-muted text-[11px] font-bold text-muted uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10">
                  <input type="checkbox" className="rounded-md border-border text-accent-camel focus:ring-accent-camel cursor-pointer" defaultChecked />
                </th>
                <th className="py-3 px-3.5">{rotuloMaterial}</th>
                <th className="py-3 px-3.5">Cor</th>
                <th className="py-3 px-3.5">Reservado</th>
                <th className="py-3 px-3.5">Utilizado</th>
                <th className="py-3 px-3.5">Completas</th>
                <th className="py-3 px-3.5">Observações</th>
                <th className="py-3 px-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-surface-muted/40">
                <td colSpan={8} className="py-8 px-3.5 text-center text-muted italic">
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

  // Modal / Tela de Definição de Metas
  const [isDefinirMetasOpen, setIsDefinirMetasOpen] = useState(false);
  const [metaEtapa, setMetaEtapa] = useState('');
  const [metaDataInicio, setMetaDataInicio] = useState('03/09/2026');
  const [metaDataEntrega, setMetaDataEntrega] = useState('');

  // Dropdown de Opções no Mix
  const [isMixOptionsOpen, setIsMixOptionsOpen] = useState(false);

  // Sub-aba do Cronograma: 'tabela' | 'gantt'
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

  // Verificar se a coleção possui data de conclusão
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
    <div className="space-y-6 font-sans pb-16 animate-in fade-in duration-200">
      
      {/* 1. BREADCRUMBS FLUTUANTES (Início > [Marca] > [Nome da Coleção]) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <button 
            type="button"
            onClick={onBackToHome}
            className="hover:text-accent-camel transition-colors duration-200 cursor-pointer font-medium text-muted-foreground"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <button 
            type="button"
            onClick={onBackToBrand}
            className="hover:text-accent-camel transition-colors duration-200 cursor-pointer font-medium text-muted-foreground"
          >
            {marca.nome}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          <span className="text-primary font-bold px-2.5 py-1 bg-surface-muted rounded-lg border border-border-muted">
            {colecao.nome}
          </span>
        </div>

        <button 
          type="button"
          onClick={onBackToBrand}
          className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-muted transition-all duration-200 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Voltar para {marca.nome}</span>
        </button>
      </div>

      {/* 2. HEADER DA COLEÇÃO (CARD NÍVEL 2) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-5 transition-all duration-300">
        
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h1 className="text-xl sm:text-2xl font-bold font-editorial text-primary tracking-wide">
            Coleção {colecao.nome}
          </h1>

          <button 
            type="button"
            className="px-3 py-1.5 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-semibold text-muted-foreground flex items-center gap-1.5 cursor-pointer transition-all duration-200 shadow-2xs"
          >
            <span>Opções</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          </button>
        </div>

        {/* PAINEL DE METADADOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs pt-1">
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider flex items-center gap-1 mb-1">
              <Sun className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} /> Temporada
            </span>
            <strong className="text-xs font-semibold text-muted-foreground block">
              {temporadaExtraida}
            </strong>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-accent-camel" strokeWidth={1.5} /> Ano
            </span>
            <strong className="text-xs font-semibold text-muted-foreground block">
              {anoExtraido}
            </strong>
          </div>

          {/* EXIBIDO SOMENTE SE A COLEÇÃO TIVER SIDO CONCLUÍDA */}
          {isConcluido && (
            <div>
              <span className="text-[10px] font-semibold uppercase text-muted tracking-wider flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} /> Data de Conclusão
              </span>
              <strong className="text-xs font-semibold text-muted-foreground block">
                {colecao.concluidoEmDate || '18/07/2025'}
              </strong>
            </div>
          )}

          <div>
            <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block mb-1">
              Progresso Geral
            </span>
            <span className="text-xs font-bold text-accent-camel bg-accent-camel/10 px-2.5 py-0.5 rounded-md border border-accent-camel/30 inline-block">
              {colecao.progressoPercent}% Concluído
            </span>
          </div>
        </div>

      </div>

      {/* 3. AS 10 SUB-ABAS HORIZONTAIS INTERATIVAS */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 rounded-xl shadow-2xs overflow-x-auto">
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
              className={`py-3.5 border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-accent-camel text-accent-camel font-bold'
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CONTEÚDO DAS SUB-ABAS */}

      {/* 4.1 ABA 1: PEÇAS (FILTROS DE PEÇAS) */}
      {activeTab === 'pecas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* SEÇÃO "FILTROS DE PEÇAS" (CARD NÍVEL 2) */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 font-sans transition-all duration-300">
            
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Filtros de peças
              </h3>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-muted-foreground shadow-2xs transition-all duration-200 cursor-pointer"
                >
                  Canceladas
                </button>
                <button 
                  type="button"
                  className="px-3 py-1 rounded-lg border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-muted-foreground shadow-2xs transition-all duration-200 cursor-pointer flex items-center gap-1"
                >
                  <span>⚙ Filtro</span>
                </button>
              </div>
            </div>

            {/* LINHAS DE FILTROS */}
            <div className="space-y-3 text-xs">
              
              {/* Tema */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold text-muted-foreground">Tema</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['Todas', 'Base'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTemaFilter(t)}
                      className={`px-3 py-0.5 rounded-md text-xs transition-all duration-200 cursor-pointer ${
                        selectedTemaFilter === t
                          ? 'bg-accent-camel text-white font-bold shadow-2xs'
                          : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
                      }`}
                    >
                      {t} <span className={selectedTemaFilter === t ? 'opacity-80' : 'text-muted'}>10</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold text-muted-foreground">Status</span>
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
                      className={`px-3 py-0.5 rounded-md text-xs transition-all duration-200 cursor-pointer ${
                        selectedStatusFilter === s.val
                          ? 'bg-accent-camel text-white font-bold shadow-2xs'
                          : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
                      }`}
                    >
                      {s.label} <span className={selectedStatusFilter === s.val ? 'opacity-80' : 'text-muted'}>{s.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de peça */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold text-muted-foreground">Tipo de peça</span>
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
                      className={`px-3 py-0.5 rounded-md text-xs transition-all duration-200 cursor-pointer ${
                        selectedTipoFilter === t.val
                          ? 'bg-accent-camel text-white font-bold shadow-2xs'
                          : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
                      }`}
                    >
                      {t.label} <span className={selectedTipoFilter === t.val ? 'opacity-80' : 'text-muted'}>{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estilista */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-28 font-semibold text-muted-foreground">Estilista</span>
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
                      className={`px-3 py-0.5 rounded-md text-xs transition-all duration-200 cursor-pointer ${
                        selectedEstilistaFilter === e.val
                          ? 'bg-accent-camel text-white font-bold shadow-2xs'
                          : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
                      }`}
                    >
                      {e.label} <span className={selectedEstilistaFilter === e.val ? 'opacity-80' : 'text-muted'}>{e.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tecidos */}
              <div className="flex flex-start gap-3">
                <span className="w-28 font-semibold text-muted-foreground pt-1">Tecidos</span>
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
                      className={`px-2.5 py-0.5 rounded-md text-[11px] transition-all duration-200 cursor-pointer ${
                        selectedTecidoFilter === tec.val
                          ? 'bg-accent-camel text-white font-bold shadow-2xs'
                          : 'bg-surface-muted hover:bg-border-muted text-muted-foreground font-semibold border border-border'
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
          <div className="bg-surface p-4 sm:p-5 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold font-editorial text-primary">
                {pecasFiltradas.length} Peças
              </h3>
              <span className="text-xs font-semibold text-muted bg-surface-muted px-2.5 py-1 rounded-lg">
                Coleção {colecao.nome}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Procurar pelo nome, código..."
                  value={searchPeca}
                  onChange={(e) => setSearchPeca(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-muted-foreground focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
                />
              </div>

              <button className="px-3 py-1.5 rounded-lg border border-border bg-surface-muted text-xs font-semibold text-muted-foreground flex items-center gap-1 transition-all duration-200 cursor-pointer">
                <span>Tipo de Peça</span>
                <ChevronDown className="w-3 h-3 text-muted" strokeWidth={1.5} />
              </button>

              <button className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-muted-foreground flex items-center gap-1 shadow-2xs transition-all duration-200 cursor-pointer">
                <Grid className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Miniaturas
              </button>

              <button className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-muted-foreground flex items-center gap-1 shadow-2xs transition-all duration-200 cursor-pointer">
                <Download className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Exportar
              </button>

              <button className="px-4 py-1.5 rounded-lg bg-accent-camel hover:bg-accent-camel/90 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all duration-200 cursor-pointer">
                <Plus className="w-4 h-4" /> Peças +
              </button>
            </div>
          </div>

          {/* GRID DE PEÇAS COM TRATAMENTO DE IMAGEM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pecasFiltradas.map((peca) => (
              <div 
                key={peca.id}
                className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 space-y-3 flex flex-col justify-between group cursor-pointer"
              >
                {/* Imagem / Croqui com img-brand-treated */}
                <div className="w-full h-44 bg-surface-muted rounded-lg overflow-hidden relative border border-border-muted">
                  <img 
                    src={peca.imagemCroquiUrl} 
                    alt={peca.nome}
                    className="w-full h-full object-cover img-brand-treated group-hover:scale-105 transition-all duration-300" 
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-950/70 text-white text-[10px] font-medium backdrop-blur-xs">
                    {peca.etapaAtual}
                  </span>
                </div>

                {/* Header do Card */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary">{peca.tipo}</span>
                    <span className="font-semibold text-muted text-[11px]">{peca.codigo}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">
                    {peca.tema}
                  </div>
                </div>

                {/* Detalhes */}
                <div className="space-y-1 text-[11px] pt-2 border-t border-border-muted text-muted-foreground leading-tight">
                  <div>
                    Status: <strong className="text-primary font-semibold">{peca.status}</strong>
                  </div>
                  <div>
                    Etapa: <strong className="text-muted-foreground font-normal">{peca.etapaAtual || '—'}</strong>
                  </div>
                  <div>
                    Previsão: <strong className="text-muted-foreground font-normal">{peca.previsaoEntrega || '—'}</strong>
                  </div>
                  <div>
                    Estilista: <strong className="text-muted-foreground font-normal">{peca.estilista || '—'}</strong>
                  </div>
                  <div className="truncate text-muted pt-0.5">
                    Tecidos: <span className="text-muted-foreground font-normal">{peca.tecidos.join(', ')}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* 4.2 ABA 2: TEMAS */}
      {activeTab === 'temas' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border-muted pb-4">
            <h3 className="text-base font-bold text-primary font-editorial">Pendentes</h3>
            <div className="flex items-center gap-2">
              <button className="px-3.5 py-1.5 rounded-lg border border-border bg-surface-muted text-xs font-bold text-muted-foreground flex items-center gap-1 transition-all duration-200 cursor-pointer">
                <Filter className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Filtrar
              </button>
              <button className="px-4 py-1.5 rounded-lg bg-accent-camel text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all duration-200 cursor-pointer">
                <Plus className="w-4 h-4" /> Tema
              </button>
            </div>
          </div>

          <div className="w-full sm:w-80 p-5 rounded-xl bg-surface border border-border shadow-2xs space-y-4 hover:shadow-md transition-all duration-300">
            <div className="w-full h-36 bg-surface-muted rounded-lg flex items-center justify-center border border-border-muted">
              <ImageIcon className="w-10 h-10 text-muted" strokeWidth={1.5} />
            </div>

            <h4 className="text-sm font-bold font-editorial text-primary uppercase">Base</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Progresso</span>
                <strong className="text-primary font-bold">38%</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Peças concluídas</span>
                <strong className="text-primary font-bold">53 de 141 peças</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Cores</span>
                <strong className="text-muted">—</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estampas</span>
                <strong className="text-muted">—</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.3 ABA 3: CORES */}
      {activeTab === 'cores' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border-muted pb-4 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Filtros de cores
            </h4>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground font-medium">Paleta</span>
              <button className="px-3 py-1 rounded-md bg-accent-camel text-white font-bold transition-all duration-200">Todas</button>
              <button className="px-3 py-1 rounded-md bg-surface-muted text-muted-foreground font-medium transition-all duration-200">Sem paleta</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Busca</label>
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Procurar cor pelo nome, código..."
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border-muted flex items-center justify-between">
            <h3 className="text-base font-bold font-editorial text-primary">Cores</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground cursor-pointer transition-all duration-200">Selecionar todas</button>
              <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground cursor-pointer transition-all duration-200">Opções ▾</button>
              <button className="px-4 py-1.5 rounded-lg bg-accent-camel text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all duration-200">+ Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* 4.4 ABA 4: PAINÉIS */}
      {activeTab === 'paineis' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border-muted pb-4">
            <h3 className="text-base font-bold font-editorial text-primary">Painéis</h3>
            <button className="px-4 py-1.5 rounded-lg bg-accent-camel text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all duration-200">
              <Plus className="w-4 h-4" /> Novo
            </button>
          </div>
          <div className="p-12 text-center text-xs text-muted border border-dashed border-border rounded-xl">
            Nenhum painel cadastrado nesta coleção.
          </div>
        </div>
      )}

      {/* 4.5 ABA 5: ESTAMPAS */}
      {activeTab === 'estampas' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border-muted pb-4 space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Filtros de estampas
            </h4>
            <p className="text-xs text-muted italic">Não há opções de filtro no momento</p>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-editorial text-primary">0 Estampas</h3>
            <div className="flex items-center gap-2">
              <button className="px-3.5 py-1.5 rounded-lg border border-border bg-surface-muted text-xs font-bold text-accent-camel cursor-pointer transition-all duration-200">Ordenação (Tipo)</button>
              <button className="px-3.5 py-1.5 rounded-lg border border-border bg-accent-camel/10 text-xs font-bold text-accent-camel cursor-pointer transition-all duration-200">✓ Todas</button>
              <button className="px-3.5 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold text-muted-foreground cursor-pointer transition-all duration-200">Miniatura</button>
              <button className="px-3.5 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold text-muted-foreground cursor-pointer transition-all duration-200">Opções ▾</button>
              <button className="px-4 py-1.5 rounded-lg bg-accent-camel text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all duration-200">+ Estampa</button>
            </div>
          </div>
        </div>
      )}

      {/* 4.6 ABA 6: RESERVA DE TECIDOS */}
      {activeTab === 'reserva_tecidos' && (
        <ReservaMateriaisTab
          tituloReserva="Reservas de material"
          rotuloMaterial="Tecido"
        />
      )}

      {/* 4.7 ABA 7: RESERVA DE AVIAMENTOS */}
      {activeTab === 'reserva_aviamentos' && (
        <ReservaMateriaisTab
          tituloReserva="Reservas de aviamento"
          rotuloMaterial="Aviamento"
        />
      )}

      {/* 4.8 ABA 8: MIX */}
      {activeTab === 'mix' && (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border-muted pb-4 relative">
            <h3 className="text-base font-bold font-editorial text-primary">Planejamento do Mix</h3>

            {/* Menu Opções Dropdown */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsMixOptionsOpen(!isMixOptionsOpen)}
                className="px-3.5 py-1.5 rounded-lg border border-border bg-surface-muted text-xs font-bold text-muted-foreground flex items-center gap-1 cursor-pointer transition-all duration-200"
              >
                <span>Opções</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </button>

              {isMixOptionsOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-30 p-2 text-xs animate-in fade-in duration-200">
                  <button className="w-full text-left px-3 py-2 text-muted-foreground hover:bg-surface-muted font-semibold rounded-lg flex items-center justify-between cursor-pointer transition-colors duration-200">
                    <span>Editar</span>
                    <Edit2 className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  </button>
                  <button className="w-full text-left px-3 py-2 text-muted-foreground hover:bg-surface-muted font-semibold rounded-lg flex items-center justify-between cursor-pointer transition-colors duration-200">
                    <span>Exportar (Agrupado)</span>
                    <Download className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  </button>
                  <button className="w-full text-left px-3 py-2 text-muted-foreground hover:bg-surface-muted font-semibold rounded-lg flex items-center justify-between cursor-pointer transition-colors duration-200">
                    <span>Exportar (Detalhado)</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-surface border border-border shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Mix</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="font-bold text-primary">Total</span>
                <span>Planejado: <strong>0</strong></span>
                <span>Executado: <strong>0</strong></span>
                <span>Concluído: <strong>0</strong></span>
              </div>

              {/* Barra do Mix */}
              <div className="w-full h-3 bg-accent-camel/20 rounded-full overflow-hidden" />
            </div>
          </div>
        </div>
      )}

      {/* 4.9 ABA 9: METAS */}
      {activeTab === 'metas' && (
        <div className="bg-surface p-8 rounded-xl border border-border shadow-2xs space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border-muted pb-4">
            <h3 className="text-base font-bold font-editorial text-primary">Resultados</h3>
          </div>

          <div className="p-12 text-center space-y-4 bg-surface-muted rounded-xl border border-border-muted">
            <Target className="w-12 h-12 text-accent-camel mx-auto" />
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold font-editorial text-primary">Definição de Metas da Coleção</h4>
              <p className="text-xs text-muted">Defina as etapas e prazos limite para estabelecer as metas de produção.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsDefinirMetasOpen(true)}
              className="px-6 py-2.5 bg-accent-camel hover:bg-accent-camel/90 text-white text-xs font-bold rounded-lg shadow-2xs transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span>Definir Metas</span>
            </button>
          </div>
        </div>
      )}

      {/* 4.10 ABA 10: CRONOGRAMA (FRENTE 5: DENSIDADE DE TABELAS) */}
      {activeTab === 'cronograma' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* FILTROS DO CRONOGRAMA */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} /> Filtros
              </h4>
              <button className="px-4 py-1.5 rounded-lg bg-accent-camel text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-all duration-200">
                <Plus className="w-4 h-4" /> Atividade +
              </button>
            </div>

            <div className="flex items-center gap-8 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold block">Busca</label>
                <input
                  type="text"
                  placeholder=""
                  className="w-48 px-3 py-1.5 bg-surface-muted border border-border rounded-lg focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold block">Responsáveis</label>
                <input
                  type="text"
                  placeholder=""
                  className="w-48 px-3 py-1.5 bg-surface-muted border border-border rounded-lg focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* SUB-ABAS TABELA | GANTT & TABELA DE CRONOGRAMA */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
            <div className="flex items-center gap-4 text-xs font-bold border-b border-border-muted pb-3">
              <button
                onClick={() => setCronogramaSubTab('tabela')}
                className={`pb-1 border-b-2 transition-all duration-200 cursor-pointer ${
                  cronogramaSubTab === 'tabela' ? 'border-accent-camel text-accent-camel' : 'text-muted'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setCronogramaSubTab('gantt')}
                className={`pb-1 border-b-2 transition-all duration-200 cursor-pointer ${
                  cronogramaSubTab === 'gantt' ? 'border-accent-camel text-accent-camel' : 'text-muted'
                }`}
              >
                Gantt
              </button>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-editorial text-primary">Cronograma</h3>
            </div>

            <div className="overflow-x-auto">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted pb-2 border-b border-border-muted">
                <span>0-0 de 0</span>
                <div className="flex items-center gap-2">
                  <button disabled className="opacity-40">&lt;</button>
                  <button disabled className="opacity-40">&gt;</button>
                </div>
              </div>

              <table className="w-full text-left text-xs font-medium text-muted-foreground">
                <thead>
                  <tr className="border-b border-border-muted text-[11px] font-bold text-muted uppercase tracking-wider">
                    <th className="py-3 px-3.5 w-10">
                      <input type="checkbox" className="rounded-md border-border text-accent-camel focus:ring-accent-camel cursor-pointer" />
                    </th>
                    <th className="py-3 px-3.5">Nome</th>
                    <th className="py-3 px-3.5">Período</th>
                    <th className="py-3 px-3.5">Etapa</th>
                    <th className="py-3 px-3.5">Responsáveis</th>
                    <th className="py-3 px-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="odd:bg-surface-muted/40">
                    <td colSpan={6} className="py-8 px-3.5 text-center text-muted italic">
                      Nenhum item listado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 5. TELA / MODAL DE DEFINIÇÃO DE METAS */}
      {isDefinirMetasOpen && (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl p-6 sm:p-8 border border-border shadow-xl max-w-4xl w-full space-y-6 animate-in fade-in duration-200">
            
            {/* Header do Form */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <h3 className="text-base font-bold font-editorial text-primary">Definição de Metas de Produção</h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Status: Ainda não criado
              </span>
            </div>

            {/* FORMULÁRIO DE ETAPA, DATAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground block">Etapa</label>
                <select
                  value={metaEtapa}
                  onChange={(e) => setMetaEtapa(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
                >
                  <option value="">Escolha ou digite uma etapa</option>
                  <option value="estilo">1. Estilo & Design</option>
                  <option value="modelagem">2. Modelagem & Piloto</option>
                  <option value="corte">3. Corte & Liberação</option>
                  <option value="producao">4. Produção Industrial</option>
                </select>
                <span className="text-[10px] text-muted block">Selecione as etapas que definem uma meta concluída.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground block">Data de início</label>
                <DatePickerInput
                  placeholder="03/09/2026"
                  value={metaDataInicio}
                  onChange={(val) => setMetaDataInicio(val)}
                  className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium focus:bg-surface focus:outline-none cursor-pointer text-primary pr-8 transition-all duration-200"
                />
                <span className="text-[10px] text-muted block">Selecione a data de início das metas.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground block">Data de entrega</label>
                <DatePickerInput
                  placeholder="Ex.: 4/5/2021"
                  value={metaDataEntrega}
                  onChange={(val) => setMetaDataEntrega(val)}
                  className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium focus:bg-surface focus:outline-none cursor-pointer text-primary pr-8 transition-all duration-200"
                />
                <span className="text-[10px] text-muted block">Selecione a data de entrega das metas.</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="button"
                className="px-4 py-2 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-bold text-muted-foreground transition-all duration-200 cursor-pointer"
              >
                Adicionar datas manualmente
              </button>
            </div>

            {/* BOTÕES INFERIORES */}
            <div className="pt-4 border-t border-border-muted flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDefinirMetasOpen(false)}
                className="px-6 py-2.5 bg-accent-camel hover:bg-accent-camel/90 text-white text-xs font-bold rounded-lg shadow-2xs transition-all duration-200 cursor-pointer"
              >
                Atualizar
              </button>

              <button
                type="button"
                onClick={() => setIsDefinirMetasOpen(false)}
                className="px-6 py-2.5 bg-surface border border-border hover:bg-surface-muted text-muted-foreground text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer"
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
