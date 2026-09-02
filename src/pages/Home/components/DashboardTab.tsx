/**
 * ============================================================================
 * MÓDULO: Aba Dashboard (Visão Geral de Permanência por Etapa & Gráficos)
 * ARQUIVO: src/pages/Home/components/DashboardTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe as estatísticas operacionais de tempo de permanência por etapa
 *            do processo produtivo (Média no mês, Entradas, Saídas, Gráficos Donut
 *            de SLA: Em dia, Entrega Hoje, Atrasadas, e o gráfico de barras das etapas).
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - As etapas exibidas no gráfico de barras horizontal incluem as etapas padrão e
 *   as adicionais mapeadas: '03 modelagem', '02 engenharia recebimento',
 *   '10 corte', '11 estamparia', '16 lavanderia', 'Integração linx'.
 * ============================================================================
 */

import React, { useState } from 'react';
import { Filter, BarChart2 } from 'lucide-react';

export const DashboardTab: React.FC = () => {
  // ESTADO DA ETAPA SELECIONADA PARA A VISÃO GERAL
  const [selectedEtapa, setSelectedEtapa] = useState('01 GERAÇÃO DE FICHA');
  const [selectedMarca, setSelectedMarca] = useState('');

  // DADOS DE ETAPAS E BARRAS (FIÉIS AOS PRINTS 2 E 3 ENVIADOS)
  const etapasBarrasData = [
    { etapa: '03 modelagem', azul: 12, laranja: 0 },
    { etapa: '02 engenharia recebimento', azul: 7, laranja: 3 },
    { etapa: 'acertando tecido fornecedor', azul: 8, laranja: 1 },
    { etapa: '7 estoque de tecidos matriz', azul: 6, laranja: 0 },
    { etapa: '10 corte', azul: 5, laranja: 0 },
    { etapa: '01 geração de ficha', azul: 3, laranja: 2 },
    { etapa: '14 pilotagem/costura', azul: 4, laranja: 0 },
    { etapa: '11 estamparia', azul: 3, laranja: 1 },
    { etapa: '16 lavanderia', azul: 2, laranja: 0 },
    { etapa: 'Integração linx', azul: 4, laranja: 0 },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. PAINEL DE FILTROS DO DASHBOARD (Etapa, Marcas, Coleções, Responsáveis, Fornecedores) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filtros do Dashboard
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Etapa</label>
            <select
              value={selectedEtapa}
              onChange={(e) => setSelectedEtapa(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="01 GERAÇÃO DE FICHA">01 GERAÇÃO DE FICHA</option>
              <option value="02 ENGENHARIA RECEBIMENTO">02 ENGENHARIA RECEBIMENTO</option>
              <option value="03 MODELAGEM">03 MODELAGEM</option>
              <option value="10 CORTE">10 CORTE</option>
              <option value="11 ESTAMPARIA">11 ESTAMPARIA</option>
              <option value="16 LAVANDERIA">16 LAVANDERIA</option>
              <option value="INTEGRAÇÃO LINX">INTEGRAÇÃO LINX</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Marcas</label>
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="">Todas as marcas</option>
              <option value="King & Joe">King & Joe</option>
              <option value="K&J Black">K&J Black</option>
              <option value="King & Joe Play">King & Joe Play</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Coleções</label>
            <input
              type="text"
              placeholder="Selecione as coleções"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Responsáveis</label>
            <input
              type="text"
              placeholder="Selecione responsáveis"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fornecedores</label>
            <input
              type="text"
              placeholder="Selecione fornecedores"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-1">
          <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {selectedEtapa}
          </span>
        </div>
      </div>

      {/* 2. SEÇÃO VISÃO GERAL (IGUAL AOS PRINTS 2 E 3) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Visão geral</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARD ESQUERDO: MÉDIAS DE TEMPO & ENTRADAS/SAÍDAS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                {selectedEtapa.toLowerCase()}
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Média mês atual</span>
                  <strong className="text-slate-900 font-bold">1 dia e 13 horas</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Média semana atual</span>
                  <strong className="text-slate-900 font-bold">1 hora</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Entradas na semana</span>
                  <strong className="text-slate-900 font-bold">59</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Saídas na semana</span>
                  <strong className="text-slate-900 font-bold">55</strong>
                </div>
              </div>
            </div>

            {/* AVATARES DOS RESPONSÁVEIS */}
            <div className="border-t border-slate-100 pt-3">
              <span className="block text-[11px] font-bold text-slate-700 mb-2">Responsáveis</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  F
                </div>
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  MB
                </div>
              </div>
            </div>
          </div>

          {/* CARD DIREITO (LG 2/3): GRÁFICOS DONUT DE SLA (Em dia, Entrega Hoje, Atrasadas) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-around flex-wrap gap-6">
            
            {/* DONUT 1: EM DIA (AZUL/CIANO) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-8 border-cyan-400 border-t-cyan-200 animate-spin-slow" />
                <span className="absolute text-2xl font-black text-slate-900">3</span>
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2">Em dia</span>
            </div>

            {/* DONUT 2: ENTREGA HOJE (LARANJA) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-8 border-orange-400 border-t-orange-200" />
                <span className="absolute text-2xl font-black text-slate-900">2</span>
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2">Entrega Hoje</span>
            </div>

            {/* DONUT 3: ATRASADAS (ROSA/VERMELHO) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-8 border-rose-500 border-t-rose-200" />
                <span className="absolute text-xl font-bold text-slate-400">--</span>
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2">Atrasadas</span>
            </div>

          </div>

        </div>
      </div>

      {/* 3. GRÁFICO DE BARRAS HORIZONTAL POR ETAPA (FIEL AO PRINT 3) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" /> Quantidade de Peças por Etapa de Produção
          </h4>
          <span className="text-xs text-slate-500">Mapeamento do Kanban</span>
        </div>

        <div className="space-y-3 pt-2">
          {etapasBarrasData.map((item, idx) => {
            const total = item.azul + item.laranja;
            const maxVal = 12;
            const widthBluePercent = (item.azul / maxVal) * 100;
            const widthOrangePercent = (item.laranja / maxVal) * 100;

            return (
              <div key={idx} className="flex items-center text-xs">
                <span className="w-48 font-semibold text-slate-700 truncate pr-2 text-right">
                  {item.etapa}
                </span>

                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden flex items-center p-0.5 relative">
                  {/* Barra Azul */}
                  {item.azul > 0 && (
                    <div 
                      className="h-full bg-blue-600 rounded-l-md transition-all duration-500" 
                      style={{ width: `${widthBluePercent}%` }}
                    />
                  )}
                  {/* Barra Laranja */}
                  {item.laranja > 0 && (
                    <div 
                      className="h-full bg-amber-500 rounded-r-md transition-all duration-500" 
                      style={{ width: `${widthOrangePercent}%` }}
                    />
                  )}

                  <span className="ml-2 font-extrabold text-slate-900 text-[11px]">
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
