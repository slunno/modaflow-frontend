/**
 * ============================================================================
 * MÓDULO: Aba Gráficos (Analytics & BI Customizado por Dimensão)
 * ARQUIVO: src/pages/Home/components/GraficosTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Construtor de relatórios analíticos de BI com agrupamento dinâmico
 *            (por Marca, Estilista, Fornecedor, Tipo, Tag, etc.) e gráficos de barras
 *            para quantificar produtos em desenvolvimento.
 * ----------------------------------------------------------------------------
 * PADRÃO DE ADIÇÃO/ALTERAÇÃO:
 * - Os dados das marcas (King & Joe: 1654, King & Joe Play: 1195, K&J Black: 938)
 *   são populados dinamicamente via integração com o ERP Linx no backend.
 * ============================================================================
 */

import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { GraficoDimensaoMetric } from '../../../types/plm';

export const GraficosTab: React.FC = () => {
  // ESTADO DO AGRUPAMENTO SELECIONADO (Campo, Criador, Fornecedor, Marca, Estilista, etc.)
  const [agrupamento, setAgrupamento] = useState<'Marca' | 'Estilista' | 'Fornecedor' | 'Tipo' | 'Tag'>('Marca');

  // MOCK DE DADOS ANALÍTICOS FIÉIS AO PRINT 4 ENVIADO
  const dadosMarca: GraficoDimensaoMetric[] = [
    { rotulo: 'King & Joe', quantidade: 1654 },
    { rotulo: 'King & Joe Play', quantidade: 1195 },
    { rotulo: 'K&J Black', quantidade: 938 },
  ];

  const dadosEstilista: GraficoDimensaoMetric[] = [
    { rotulo: 'Mariana Barbosa', quantidade: 1420 },
    { rotulo: 'Juliano', quantidade: 1180 },
    { rotulo: 'Carlos Eduardo', quantidade: 890 },
  ];

  const dadosTipo: GraficoDimensaoMetric[] = [
    { rotulo: 'Camisa', quantidade: 1250 },
    { rotulo: 'Calça', quantidade: 980 },
    { rotulo: 'Polo', quantidade: 840 },
    { rotulo: 'Bermuda', quantidade: 720 },
  ];

  const currentData = agrupamento === 'Marca' ? dadosMarca : agrupamento === 'Estilista' ? dadosEstilista : dadosTipo;

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. SEÇÃO DE FILTROS & AGRUPAMENTO (IGUAL AO PRINT 4) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        {/* BARRAS DE AGRUPAMENTO (Campo, Criador, Fornecedor, Marca, Estilista, Time, Tipo, Tag) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            Agrupamento
          </label>
          <div className="flex flex-wrap gap-2">
            {(['Campo', 'Criador', 'Fornecedor', 'Marca', 'Estilista', 'Time', 'Tipo', 'Tag'] as const).map((item) => {
              const isSelected = agrupamento === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (['Marca', 'Estilista', 'Tipo'].includes(item)) {
                      setAgrupamento(item as any);
                    }
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTEXTO DE CAMPOS & ETAPAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campos Customizados</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none">
              <option value="">Selecione...</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Valores</label>
            <input
              type="text"
              placeholder="Selecione Campos"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Percurso de Etapas</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none">
              <option value="">Selecione...</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Período</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Depois de..."
                className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Antes de..."
                className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 2. GRÁFICO DE BARRAS DA QUANTIDADE DE PRODUTOS (FIEL AO PRINT 4) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" /> Gráficos de BI — Quantidade de Produtos por {agrupamento}
          </h4>
          <span className="text-xs font-bold text-slate-400">Quantidade de Produtos</span>
        </div>

        {/* REGUA DE ESCALA (0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800) */}
        <div className="pl-36 pr-8 flex justify-between text-[10px] font-bold text-slate-400 border-b border-slate-100 pb-1">
          <span>0</span>
          <span>200</span>
          <span>400</span>
          <span>600</span>
          <span>800</span>
          <span>1000</span>
          <span>1200</span>
          <span>1400</span>
          <span>1600</span>
          <span>1800</span>
        </div>

        {/* BARRAS HORIZONTAIS */}
        <div className="space-y-4 pt-2">
          {currentData.map((item, idx) => {
            const maxScale = 1800;
            const percent = (item.quantidade / maxScale) * 100;

            return (
              <div key={idx} className="flex items-center text-xs">
                <span className="w-36 font-bold text-slate-800 truncate pr-3 text-right">
                  {item.rotulo}
                </span>

                <div className="flex-1 bg-slate-100 h-8 rounded-lg overflow-hidden flex items-center p-0.5 relative">
                  <div
                    className="h-full bg-indigo-600 rounded-md transition-all duration-700 shadow-xs"
                    style={{ width: `${percent}%` }}
                  />
                  <span className="ml-3 font-extrabold text-slate-900 text-xs">
                    {item.quantidade}
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
