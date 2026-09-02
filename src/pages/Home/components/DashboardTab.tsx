/**
 * ============================================================================
 * MÓDULO: Aba Dashboard (Visão Geral de Permanência por Etapa & Gráficos com Alto Contraste)
 * ARQUIVO: src/pages/Home/components/DashboardTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe estatísticas de tempo de permanência por etapa do processo produtivo.
 *            Gráficos redesenhados com barras em Preto Absoluto (#000000), bordas
 *            pretas nítidas de alto contraste e componentes clicáveis.
 * ----------------------------------------------------------------------------
 * PADRÃO DE DESIGN:
 * - Barras de etapas utilizam cor preta sólida (`bg-black` / `bg-slate-950`).
 * - Containers de gráficos utilizam bordas escuras nítidas (`border-2 border-slate-950`).
 * ============================================================================
 */

import React, { useState } from 'react';
import { Filter, BarChart2, MousePointerClick } from 'lucide-react';
import { MultiSelectDropdown } from '../../../components/ui/MultiSelectDropdown';
import { ETAPAS_OPTIONS, COLECOES_OPTIONS } from './PecasTab';

/** Lista de Fornecedores extraída da tela oficial do PLM */
const FORNECEDORES_OPTIONS = [
  'ACJ COMERCIO',
  'ADAR TEXTIL',
  'ADINA TEXTIL',
  'ADVANCE',
  'AKR',
  'AKR BRANDS',
  'ALEXANDRE GUIRAO',
  'MALHAS CIANORTE',
  'TEXTIL SÃO PAULO'
];

/** Mapeamento de métricas dinâmicas por Etapa para a Visão Geral */
const ETAPAS_METRICS_MAP: Record<string, {
  mediaMes: string;
  mediaSemana: string;
  entradas: number;
  saidas: number;
  emDia: number;
  entregaHoje: number;
  atrasadas: number;
  responsaveis: string[];
}> = {
  '01 geração de ficha': { mediaMes: '1 dia e 13 horas', mediaSemana: '1 hora', entradas: 59, saidas: 55, emDia: 3, entregaHoje: 2, atrasadas: 0, responsaveis: ['F', 'IB'] },
  '02 engenharia recebimento': { mediaMes: '2 dias e 4 horas', mediaSemana: '5 horas', entradas: 42, saidas: 38, emDia: 7, entregaHoje: 3, atrasadas: 1, responsaveis: ['MB', 'J'] },
  '03 modelagem': { mediaMes: '3 dias e 12 horas', mediaSemana: '8 horas', entradas: 68, saidas: 60, emDia: 12, entregaHoje: 0, atrasadas: 0, responsaveis: ['J', 'CE'] },
  '07 estoque de tecidos matriz': { mediaMes: '1 dia', mediaSemana: '2 horas', entradas: 30, saidas: 28, emDia: 6, entregaHoje: 1, atrasadas: 0, responsaveis: ['F'] },
  '10 corte': { mediaMes: '2 dias', mediaSemana: '4 horas', entradas: 45, saidas: 41, emDia: 5, entregaHoje: 2, atrasadas: 0, responsaveis: ['AKR'] },
  '11 estamparia': { mediaMes: '4 dias', mediaSemana: '12 horas', entradas: 22, saidas: 18, emDia: 3, entregaHoje: 1, atrasadas: 2, responsaveis: ['MB'] },
  '14 pilotagem/costura': { mediaMes: '3 dias e 6 horas', mediaSemana: '6 horas', entradas: 36, saidas: 32, emDia: 4, entregaHoje: 1, atrasadas: 0, responsaveis: ['J'] },
  '16 lavanderia': { mediaMes: '2 dias e 8 horas', mediaSemana: '3 horas', entradas: 19, saidas: 15, emDia: 2, entregaHoje: 0, atrasadas: 1, responsaveis: ['CE'] },
  'Integração linx': { mediaMes: '12 horas', mediaSemana: '45 minutos', entradas: 80, saidas: 78, emDia: 4, entregaHoje: 0, atrasadas: 0, responsaveis: ['AKR'] },
};

export const DashboardTab: React.FC = () => {
  // ESTADOS DOS FILTROS DO DASHBOARD
  const [selectedEtapa, setSelectedEtapa] = useState('01 geração de ficha');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedColecoes, setSelectedColecoes] = useState<string[]>([]);
  const [selectedFornecedores, setSelectedFornecedores] = useState<string[]>([]);
  const [responsaveisBusca, setResponsaveisBusca] = useState('');

  // DADOS DE ETAPAS E BARRAS (BARRAS PRETAS)
  const etapasBarrasData = [
    { etapa: '03 modelagem', preto: 12, laranja: 0 },
    { etapa: '02 engenharia recebimento', preto: 7, laranja: 3 },
    { etapa: 'acertando tecido fornecedor', preto: 8, laranja: 1 },
    { etapa: '07 estoque de tecidos matriz', preto: 6, laranja: 0 },
    { etapa: '10 corte', preto: 5, laranja: 0 },
    { etapa: '01 geração de ficha', preto: 3, laranja: 2 },
    { etapa: '14 pilotagem/costura', preto: 4, laranja: 0 },
    { etapa: '11 estamparia', preto: 3, laranja: 1 },
    { etapa: '16 lavanderia', preto: 2, laranja: 0 },
    { etapa: 'Integração linx', preto: 4, laranja: 0 },
  ];

  // MÉTRICA ATIVA DA ETAPA FOCADA
  const currentMetric = ETAPAS_METRICS_MAP[selectedEtapa.toLowerCase()] || {
    mediaMes: '1 dia e 8 horas',
    mediaSemana: '2 horas',
    entradas: 30,
    saidas: 25,
    emDia: 4,
    entregaHoje: 1,
    atrasadas: 0,
    responsaveis: ['J', 'MB']
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. PAINEL DE FILTROS DO DASHBOARD COM BORDA PRETA DE ALTO CONTRASTE */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-950 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-950" /> Filtros do Dashboard
          </h4>
          <span className="text-[11px] font-extrabold text-slate-900">Visão Geral Operacional</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* SELETOR DE ETAPA */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Etapa</label>
            <select
              value={selectedEtapa}
              onChange={(e) => setSelectedEtapa(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 focus:outline-none"
            >
              {ETAPAS_OPTIONS.map((et) => (
                <option key={et} value={et}>{et.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* SELETOR DE MARCAS */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Marcas</label>
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 focus:outline-none"
            >
              <option value="">Todas as marcas</option>
              <option value="King & Joe">King & Joe</option>
              <option value="K&J Black">K&J Black</option>
              <option value="King & Joe Play">King & Joe Play</option>
            </select>
          </div>

          {/* COLEÇÕES MULTI-SELECT */}
          <MultiSelectDropdown
            label="Coleções"
            placeholder="Selecione as coleções"
            options={COLECOES_OPTIONS}
            selectedValues={selectedColecoes}
            onChange={setSelectedColecoes}
          />

          {/* RESPONSÁVEIS */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">Responsáveis</label>
            <input
              type="text"
              placeholder="Buscar responsável..."
              value={responsaveisBusca}
              onChange={(e) => setResponsaveisBusca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-xs font-bold text-slate-950 focus:outline-none"
            />
          </div>

          {/* FORNECEDORES MULTI-SELECT */}
          <MultiSelectDropdown
            label="Fornecedores"
            placeholder="Selecionar fornecedores"
            options={FORNECEDORES_OPTIONS}
            selectedValues={selectedFornecedores}
            onChange={setSelectedFornecedores}
          />

        </div>

        <div className="pt-1">
          <span className="inline-block text-[11px] font-black text-white bg-slate-950 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Etapa Ativa: {selectedEtapa}
          </span>
        </div>
      </div>

      {/* 2. SEÇÃO VISÃO GERAL COM BORDAS PRETAS DE ALTO CONTRASTE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">Visão geral</h3>
          <span className="text-xs text-slate-950 flex items-center gap-1.5 font-bold bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
            <MousePointerClick className="w-4 h-4 text-slate-950" /> Clique em qualquer barra para alterar a etapa
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARD ESQUERDO: MÉDIAS DE TEMPO (BORDA PRETA REFORÇADA) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-950 shadow-xl space-y-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-950 uppercase border-b-2 border-slate-950 pb-2 mb-4 tracking-tight">
                {selectedEtapa}
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Média mês atual</span>
                  <strong className="text-slate-950 font-black text-xs">{currentMetric.mediaMes}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Média semana atual</span>
                  <strong className="text-slate-950 font-black text-xs">{currentMetric.mediaSemana}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Entradas na semana</span>
                  <strong className="text-slate-950 font-black text-xs">{currentMetric.entradas}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Saídas na semana</span>
                  <strong className="text-slate-950 font-black text-xs">{currentMetric.saidas}</strong>
                </div>
              </div>
            </div>

            {/* AVATARES DOS RESPONSÁVEIS */}
            <div className="border-t border-slate-200 pt-3">
              <span className="block text-[11px] font-extrabold text-slate-900 uppercase tracking-wider mb-2">Responsáveis</span>
              <div className="flex items-center gap-2">
                {currentMetric.responsaveis.map((resp, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shadow-md text-white bg-slate-950 border border-white"
                  >
                    {resp}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD DIREITO: GRÁFICOS DONUT DE SLA (BORDA PRETA REFORÇADA) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border-2 border-slate-950 shadow-xl flex items-center justify-around flex-wrap gap-6">
            
            {/* DONUT 1: EM DIA (AZUL/CIANO COM BORDA PRETA INTERNA) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-cyan-400 border-t-slate-950 shadow-md" />
                <span className="absolute text-3xl font-black text-slate-950">{currentMetric.emDia}</span>
              </div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider mt-2">Em dia</span>
            </div>

            {/* DONUT 2: ENTREGA HOJE (LARANJA COM BORDA PRETA INTERNA) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-orange-400 border-t-slate-950 shadow-md" />
                <span className="absolute text-3xl font-black text-slate-950">{currentMetric.entregaHoje}</span>
              </div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider mt-2">Entrega Hoje</span>
            </div>

            {/* DONUT 3: ATRASADAS (ROSA/VERMELHO COM BORDA PRETA INTERNA) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-rose-500 border-t-slate-950 shadow-md" />
                <span className="absolute text-2xl font-black text-slate-950">
                  {currentMetric.atrasadas > 0 ? currentMetric.atrasadas : '--'}
                </span>
              </div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider mt-2">Atrasadas</span>
            </div>

          </div>

        </div>
      </div>

      {/* 3. GRÁFICO DE BARRAS PRETAS COM BORDAS PRETAS DE ALTO CONTRASTE */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-950 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b-2 border-slate-950 pb-3">
          <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-950" /> Quantidade de Peças por Etapa de Produção
          </h4>
          <span className="text-xs font-extrabold text-slate-900">Barras em Preto Absoluto</span>
        </div>

        <div className="space-y-3 pt-2">
          {etapasBarrasData.map((item, idx) => {
            const total = item.preto + item.laranja;
            const maxVal = 12;
            const widthBlackPercent = (item.preto / maxVal) * 100;
            const widthOrangePercent = (item.laranja / maxVal) * 100;
            const isSelected = selectedEtapa.toLowerCase() === item.etapa.toLowerCase();

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedEtapa(item.etapa)}
                className={`flex items-center text-xs p-2 rounded-2xl transition cursor-pointer border ${
                  isSelected 
                    ? 'bg-slate-950 text-white border-black shadow-lg scale-[1.01]' 
                    : 'bg-white text-slate-900 border-slate-300 hover:border-black hover:bg-slate-50'
                }`}
              >
                <span className={`w-48 font-black truncate pr-3 text-right uppercase tracking-wider ${
                  isSelected ? 'text-white' : 'text-slate-900'
                }`}>
                  {item.etapa}
                </span>

                {/* CONTAINER DA BARRA DO GRÁFICO COM BORDA PRETA DESTACADA */}
                <div className={`flex-1 h-7 rounded-xl overflow-hidden flex items-center p-0.5 relative border-2 ${
                  isSelected ? 'border-white bg-slate-900' : 'border-slate-950 bg-slate-100'
                }`}>
                  {/* BARRA PRETA DE ALTO CONTRASTE */}
                  {item.preto > 0 && (
                    <div 
                      className={`h-full rounded-l-lg transition-all duration-500 shadow-sm ${
                        isSelected ? 'bg-white' : 'bg-slate-950'
                      }`} 
                      style={{ width: `${widthBlackPercent}%` }}
                    />
                  )}
                  {/* BARRA LARANJA */}
                  {item.laranja > 0 && (
                    <div 
                      className="h-full bg-amber-500 rounded-r-lg transition-all duration-500 shadow-sm" 
                      style={{ width: `${widthOrangePercent}%` }}
                    />
                  )}

                  <span className={`ml-3 font-black text-xs ${
                    isSelected ? 'text-white' : 'text-slate-950'
                  }`}>
                    {total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
