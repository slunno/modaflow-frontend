/**
 * ============================================================================
 * MÓDULO: Aba Dashboard (Visão Geral de Permanência por Etapa & Gráficos Interativos)
 * ARQUIVO: src/pages/Home/components/DashboardTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe estatísticas de tempo de permanência por etapa do processo produtivo.
 *            Possui filtros avançados com Multi-Select de Fornecedores e Etapas,
 *            gráficos com bordas destacadas e barras interativas que atualizam a Visão Geral.
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - Clicar em qualquer barra da lista "Quantidade de Peças por Etapa de Produção"
 *   foca aquela etapa na Visão Geral e recalcula os contadores de SLA em dia/hoje/atrasadas.
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

  // DADOS DE ETAPAS E BARRAS (CLICÁVEIS)
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
      
      {/* 1. PAINEL DE FILTROS DO DASHBOARD (COM MULTI-SELECT DE FORNECEDORES E REUTILIZAÇÃO DE ETAPAS) */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-md shadow-slate-200/40 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filtros do Dashboard
          </h4>
          <span className="text-[11px] font-bold text-slate-400">Visão Geral Operacional</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* SELETOR DE ETAPA (REUTILIZANDO AS 24 ETAPAS DO PLM) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Etapa</label>
            <select
              value={selectedEtapa}
              onChange={(e) => setSelectedEtapa(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
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
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* FORNECEDORES MULTI-SELECT (EXTRAÍDO DA SUA NOVA IMAGEM!) */}
          <MultiSelectDropdown
            label="Fornecedores"
            placeholder="Selecionar fornecedores"
            options={FORNECEDORES_OPTIONS}
            selectedValues={selectedFornecedores}
            onChange={setSelectedFornecedores}
          />

        </div>

        <div className="pt-1">
          <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            Etapa Ativa: {selectedEtapa}
          </span>
        </div>
      </div>

      {/* 2. SEÇÃO VISÃO GERAL COM BORDAS DESTACADAS E CONTADORES DINÂMICOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Visão geral</h3>
          <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
            <MousePointerClick className="w-3.5 h-3.5 text-blue-600" /> Clique em qualquer barra do gráfico para alterar a etapa
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARD ESQUERDO: MÉDIAS DE TEMPO & ENTRADAS/SAÍDAS (COM BORDA DESTACADA) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-md shadow-slate-200/40 space-y-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase border-b border-slate-100 pb-2 mb-4 tracking-tight">
                {selectedEtapa}
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Média mês atual</span>
                  <strong className="text-slate-900 font-extrabold">{currentMetric.mediaMes}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Média semana atual</span>
                  <strong className="text-slate-900 font-extrabold">{currentMetric.mediaSemana}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Entradas na semana</span>
                  <strong className="text-slate-900 font-extrabold">{currentMetric.entradas}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Saídas na semana</span>
                  <strong className="text-slate-900 font-extrabold">{currentMetric.saidas}</strong>
                </div>
              </div>
            </div>

            {/* AVATARES DOS RESPONSÁVEIS */}
            <div className="border-t border-slate-100 pt-3">
              <span className="block text-[11px] font-bold text-slate-700 mb-2">Responsáveis</span>
              <div className="flex items-center gap-2">
                {currentMetric.responsaveis.map((resp, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-xs text-white ${
                      i % 2 === 0 ? 'bg-purple-600' : 'bg-pink-600'
                    }`}
                  >
                    {resp}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD DIREITO: GRÁFICOS DONUT DE SLA (COM BORDAS DESTACADAS) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-md shadow-slate-200/40 flex items-center justify-around flex-wrap gap-6">
            
            {/* DONUT 1: EM DIA (AZUL/CIANO) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-cyan-400 border-t-cyan-200 shadow-inner" />
                <span className="absolute text-3xl font-black text-slate-900">{currentMetric.emDia}</span>
              </div>
              <span className="text-xs font-bold text-slate-700 mt-2">Em dia</span>
            </div>

            {/* DONUT 2: ENTREGA HOJE (LARANJA) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-orange-400 border-t-orange-200 shadow-inner" />
                <span className="absolute text-3xl font-black text-slate-900">{currentMetric.entregaHoje}</span>
              </div>
              <span className="text-xs font-bold text-slate-700 mt-2">Entrega Hoje</span>
            </div>

            {/* DONUT 3: ATRASADAS (ROSA/VERMELHO) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-rose-500 border-t-rose-200 shadow-inner" />
                <span className="absolute text-2xl font-bold text-slate-900">
                  {currentMetric.atrasadas > 0 ? currentMetric.atrasadas : '--'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700 mt-2">Atrasadas</span>
            </div>

          </div>

        </div>
      </div>

      {/* 3. GRÁFICO DE BARRAS HORIZONTAL INTERATIVO COM BORDAS DESTACADAS */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-md shadow-slate-200/40 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" /> Quantidade de Peças por Etapa de Produção
          </h4>
          <span className="text-xs font-bold text-slate-400">Clique na etapa para detalhar</span>
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
                className={`flex items-center text-xs p-1.5 rounded-xl transition cursor-pointer ${
                  isSelected ? 'bg-blue-50/80 ring-2 ring-blue-500' : 'hover:bg-slate-50'
                }`}
              >
                <span className={`w-48 font-bold truncate pr-3 text-right ${
                  isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-700'
                }`}>
                  {item.etapa}
                </span>

                <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden flex items-center p-0.5 relative border border-slate-200">
                  {/* Barra Azul */}
                  {item.azul > 0 && (
                    <div 
                      className="h-full bg-blue-600 rounded-l-md transition-all duration-500 shadow-xs" 
                      style={{ width: `${widthBluePercent}%` }}
                    />
                  )}
                  {/* Barra Laranja */}
                  {item.laranja > 0 && (
                    <div 
                      className="h-full bg-amber-500 rounded-r-md transition-all duration-500 shadow-xs" 
                      style={{ width: `${widthOrangePercent}%` }}
                    />
                  )}

                  <span className="ml-2 font-black text-slate-900 text-xs">
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
