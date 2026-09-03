/**
 * ============================================================================
 * MÓDULO: Aba Dashboard (Visão Geral & Gráficos Estilo Plataforma Flutuante)
 * ARQUIVO: src/pages/Home/components/DashboardTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe as estatísticas de tempo de permanência por etapa.
 *            Restaura as barras em Azul Vibrante, donuts coloridos e aplica o
 *            design de "Plataforma Flutuante" (cards brancos elevados com sombra
 *            suave e bordas finas elegantes).
 * ----------------------------------------------------------------------------
 * PADRÃO DE DESIGN:
 * - As barras dos gráficos utilizam Azul Vibrante (`bg-blue-600` / `bg-blue-500`).
 * - Os cartões utilizam o efeito de plataforma flutuante:
 *   `bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl`.
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

  // DADOS DE ETAPAS E BARRAS (VOLTANDO AO AZUL VIBRANTE)
  const etapasBarrasData = [
    { etapa: '03 modelagem', azul: 12, laranja: 0 },
    { etapa: '02 engenharia recebimento', azul: 7, laranja: 3 },
    { etapa: 'acertando tecido fornecedor', azul: 8, laranja: 1 },
    { etapa: '07 estoque de tecidos matriz', azul: 6, laranja: 0 },
    { etapa: '10 corte', azul: 5, laranja: 0 },
    { etapa: '01 geração de ficha', azul: 3, laranja: 2 },
    { etapa: '14 pilotagem/costura', azul: 4, laranja: 0 },
    { etapa: '11 estamparia', azul: 3, laranja: 1 },
    { etapa: '16 lavanderia', azul: 2, laranja: 0 },
    { etapa: 'Integração linx', azul: 4, laranja: 0 },
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
      
      {/* 1. PAINEL DE FILTROS DO DASHBOARD ESTILO PLATAFORMA FLUTUANTE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" /> Filtros do Dashboard
          </h4>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Visão Geral Operacional
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* SELETOR DE ETAPA */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Etapa</label>
            <select
              value={selectedEtapa}
              onChange={(e) => setSelectedEtapa(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition shadow-xs"
            >
              {ETAPAS_OPTIONS.map((et) => (
                <option key={et} value={et}>{et.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* SELETOR DE MARCAS */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Marcas</label>
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition shadow-xs"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Responsáveis</label>
            <input
              type="text"
              placeholder="Buscar responsável..."
              value={responsaveisBusca}
              onChange={(e) => setResponsaveisBusca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition shadow-xs"
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
          <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            Etapa Ativa: {selectedEtapa}
          </span>
        </div>
      </div>

      {/* 2. SEÇÃO VISÃO GERAL COM CARD FLUTUANTE ELEGANTE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Visão geral</h3>
          <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
            <MousePointerClick className="w-4 h-4 text-blue-600" /> Clique em qualquer barra para alterar a etapa
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARD ESQUERDO: MÉDIAS DE TEMPO (ESTILO PLATAFORMA FLUTUANTE) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                {selectedEtapa.toLowerCase()}
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Média mês atual</span>
                  <strong className="text-slate-900 font-bold text-xs">{currentMetric.mediaMes}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Média semana atual</span>
                  <strong className="text-slate-900 font-bold text-xs">{currentMetric.mediaSemana}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Entradas na semana</span>
                  <strong className="text-slate-900 font-bold text-xs">{currentMetric.entradas}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Saídas na semana</span>
                  <strong className="text-slate-900 font-bold text-xs">{currentMetric.saidas}</strong>
                </div>
              </div>
            </div>

            {/* AVATARES DOS RESPONSÁVEIS (CORES DA MARCA: PRETO-TINTA E CAMEL - PASSO 4) */}
            <div className="border-t border-slate-100 pt-3">
              <span className="block text-[11px] font-bold text-slate-700 mb-2">Responsáveis</span>
              <div className="flex items-center gap-2">
                {currentMetric.responsaveis.map((resp, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-2xs text-white ${
                      i % 2 === 0 ? 'bg-[#181818]' : 'bg-[#A9764A]'
                    }`}
                  >
                    {resp}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD DIREITO: GRÁFICOS DONUT COM CORES DA MARCA (CAMEL, VERDE MILITAR, BORDÔ - PASSO 4) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 flex items-center justify-around flex-wrap gap-6">
            
            {/* DONUT 1: EM DIA (CAMEL #A9764A) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-[#A9764A] border-t-amber-100" />
                <span className="absolute text-3xl font-black text-slate-900">{currentMetric.emDia}</span>
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2">Em dia</span>
            </div>

            {/* DONUT 2: ENTREGA HOJE (VERDE MILITAR #4B5320) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-[#4B5320] border-t-emerald-100" />
                <span className="absolute text-3xl font-black text-slate-900">{currentMetric.entregaHoje}</span>
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2">Entrega Hoje</span>
            </div>

            {/* DONUT 3: ATRASADAS (BORDÔ #7A2E2E) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-[#7A2E2E] border-t-rose-100" />
                <span className="absolute text-2xl font-bold text-slate-400">
                  {currentMetric.atrasadas > 0 ? currentMetric.atrasadas : '--'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2">Atrasadas</span>
            </div>

          </div>

        </div>
      </div>

      {/* 3. GRÁFICO DE BARRAS (PRETO-TINTA + CAMEL - PASSO 4) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#A9764A]" /> Quantidade de Peças por Etapa de Produção
          </h4>
          <span className="text-xs text-slate-500 font-medium">Clique em qualquer barra para detalhar</span>
        </div>

        <div className="space-y-3 pt-2">
          {etapasBarrasData.map((item, idx) => {
            const total = item.azul + item.laranja;
            const maxVal = 12;
            const widthBluePercent = (item.azul / maxVal) * 100;
            const widthOrangePercent = (item.laranja / maxVal) * 100;
            const isSelected = selectedEtapa.toLowerCase() === item.etapa.toLowerCase();

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedEtapa(item.etapa)}
                className={`flex items-center text-xs p-2 rounded-2xl transition cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-50/90 border border-amber-300 shadow-md scale-[1.01]' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <span className={`w-48 font-bold truncate pr-3 text-right ${
                  isSelected ? 'text-[#A9764A] font-extrabold' : 'text-slate-700'
                }`}>
                  {item.etapa}
                </span>

                {/* BARRA DO GRÁFICO PRETO-TINTA + CAMEL (PASSO 4) */}
                <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden flex items-center p-0.5 relative border border-slate-200/80">
                  {/* BARRA PRETO-TINTA */}
                  {item.azul > 0 && (
                    <div 
                      className="h-full bg-[#181818] rounded-l-md transition-all duration-500 shadow-xs" 
                      style={{ width: `${widthBluePercent}%` }}
                    />
                  )}
                  {/* BARRA CAMEL */}
                  {item.laranja > 0 && (
                    <div 
                      className="h-full bg-[#A9764A] rounded-r-md transition-all duration-500 shadow-xs" 
                      style={{ width: `${widthOrangePercent}%` }}
                    />
                  )}

                  <span className="ml-2 font-extrabold text-slate-900 text-xs">
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
