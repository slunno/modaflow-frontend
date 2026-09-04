/**
 * ============================================================================
 * MÓDULO: Aba Gráficos (Analytics & BI Completo com Contextos do PLM)
 * ARQUIVO: src/pages/Home/components/GraficosTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Construtor completo de relatórios de BI com agrupamento dinâmico
 *            (Campo, Criador, Fornecedor, Marca, Estilista, Time, Tipo, Tag),
 *            painéis de Contexto Geral, Contexto de Tags, Contexto de Campos e
 *            Contexto de Etapas, e gráfico alinhado aos tokens da marca.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { BarChart3, Info } from 'lucide-react';
import type { GraficoDimensaoMetric } from '../../../types/plm';
import { ETAPAS_OPTIONS, COLECOES_OPTIONS } from './PecasTab';

export const GraficosTab: React.FC = () => {
  // ESTADO DO AGRUPAMENTO SELECIONADO (Campo, Criador, Fornecedor, Marca, Estilista, Time, Tipo, Tag)
  const [agrupamento, setAgrupamento] = useState<
    'Campo' | 'Criador' | 'Fornecedor' | 'Marca' | 'Estilista' | 'Time' | 'Tipo' | 'Tag'
  >('Marca');

  const [selectedCampo, setSelectedCampo] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedColecao, setSelectedColecao] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedItemTag, setSelectedItemTag] = useState('');
  const [selectedCampoCust, setSelectedCampoCust] = useState('');
  const [selectedValor, setSelectedValor] = useState('');
  const [selectedFluxo, setSelectedFluxo] = useState('');
  const [selectedPercurso1, setSelectedPercurso1] = useState('');
  const [selectedPercurso2, setSelectedPercurso2] = useState('');
  const [periodoDepois, setPeriodoDepois] = useState('');
  const [periodoAntes, setPeriodoAntes] = useState('');

  // MOCKS DE DADOS ANALÍTICOS EXTRAÍDOS DOS PRINTS OFICIAIS DO PLM
  const dadosMarca: GraficoDimensaoMetric[] = [
    { rotulo: 'King & Joe', quantidade: 1654 },
    { rotulo: 'King & Joe Play', quantidade: 1195 },
    { rotulo: 'K&J Black', quantidade: 938 },
  ];

  const dadosCriador: GraficoDimensaoMetric[] = [
    { rotulo: 'Mariana Barbosa', quantidade: 1127 },
    { rotulo: 'Ivonete Barbosa', quantidade: 876 },
    { rotulo: 'Fabiano', quantidade: 750 },
    { rotulo: 'Beatris Sgarioni', quantidade: 507 },
    { rotulo: 'Suporte', quantidade: 427 },
    { rotulo: 'Milena', quantidade: 56 },
  ];

  const dadosEstilista: GraficoDimensaoMetric[] = [
    { rotulo: 'Mariana Barbosa', quantidade: 1704 },
    { rotulo: 'Ivonete Barbosa', quantidade: 1208 },
    { rotulo: 'Beatris Sgarioni', quantidade: 564 },
    { rotulo: 'Suporte', quantidade: 1 },
  ];

  const dadosFornecedor: GraficoDimensaoMetric[] = [
    { rotulo: 'Interno', quantidade: 2 },
  ];

  const dadosTipo: GraficoDimensaoMetric[] = [
    { rotulo: 'Camisa', quantidade: 1250 },
    { rotulo: 'Calça', quantidade: 980 },
    { rotulo: 'Polo', quantidade: 840 },
    { rotulo: 'Bermuda', quantidade: 720 },
    { rotulo: 'Jaqueta', quantidade: 410 },
  ];

  const dadosTag: GraficoDimensaoMetric[] = [
    { rotulo: 'Camiseta', quantidade: 973 },
    { rotulo: 'Calça', quantidade: 789 },
    { rotulo: 'Camisa', quantidade: 483 },
    { rotulo: 'Bermuda', quantidade: 321 },
    { rotulo: 'Polo', quantidade: 257 },
    { rotulo: 'Short', quantidade: 219 },
    { rotulo: 'Conjunto', quantidade: 213 },
  ];

  // SELEÇÃO DINÂMICA DO CONJUNTO DE DADOS PARA O GRÁFICO
  const currentData = useMemo(() => {
    switch (agrupamento) {
      case 'Marca':
        return dadosMarca;
      case 'Criador':
      case 'Campo':
        return dadosCriador;
      case 'Estilista':
      case 'Time':
        return dadosEstilista;
      case 'Fornecedor':
        return dadosFornecedor;
      case 'Tipo':
        return dadosTipo;
      case 'Tag':
        return dadosTag;
      default:
        return dadosMarca;
    }
  }, [agrupamento]);

  // VALOR MÁXIMO PARA A RÉGUA DE ESCALA DO GRÁFICO
  const maxVal = Math.max(...currentData.map((d: GraficoDimensaoMetric) => d.quantidade), 10);
  const maxScale = maxVal <= 10 ? 2.2 : maxVal <= 1000 ? 1000 : maxVal <= 1200 ? 1200 : 1800;

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      
      {/* 1. PAINEL DE FILTROS & CONTEXTOS (CARD NÍVEL 2) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-5 transition-all duration-300">
        
        <div className="border-b border-border-muted pb-3">
          <h4 className="text-sm font-bold font-editorial text-primary">Filtros</h4>
        </div>

        {/* 1.1 AGRUPAMENTO COM ÍCONE DE INFORMAÇÃO ⓘ */}
        <div className="space-y-2 border-b border-border-muted pb-4">
          <label className="block text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <span>Agrupamento</span>
            <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          </label>
          <div className="flex flex-wrap gap-2">
            {(['Campo', 'Criador', 'Fornecedor', 'Marca', 'Estilista', 'Time', 'Tipo', 'Tag'] as const).map((item) => {
              const isSelected = agrupamento === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAgrupamento(item)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-accent-camel text-white border-accent-camel shadow-2xs'
                      : 'bg-surface text-muted-foreground border-border hover:bg-surface-muted'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Campo específico se agrupamento === 'Campo' */}
          {agrupamento === 'Campo' && (
            <div className="pt-2 max-w-sm">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Campo</label>
              <select
                value={selectedCampo}
                onChange={(e) => setSelectedCampo(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione qual campo deseja agrupar</option>
                <option value="estilista">Estilista Responsável</option>
                <option value="modelo">Linha do Modelo</option>
                <option value="categoria">Categoria de Tecido</option>
              </select>
            </div>
          )}

          {/* Time específico se agrupamento === 'Time' */}
          {agrupamento === 'Time' && (
            <div className="pt-2 max-w-sm">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione uma marca abaixo</option>
              </select>
            </div>
          )}

          {/* Tag específica se agrupamento === 'Tag' */}
          {agrupamento === 'Tag' && (
            <div className="pt-2 max-w-sm">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Tag</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione uma marca abaixo</option>
              </select>
            </div>
          )}
        </div>

        {/* 1.2 CONTEXTO GERAL (Marcas, Coleções, Times ⓘ) */}
        {agrupamento !== 'Marca' && (
        <div className="space-y-2 border-b border-border-muted pb-4">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Contexto Geral
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Marcas</label>
              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione marcas</option>
                <option value="King & Joe">King & Joe</option>
                <option value="K&J Black">K&J Black</option>
                <option value="King & Joe Play">King & Joe Play</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Coleções</label>
              <select
                value={selectedColecao}
                onChange={(e) => setSelectedColecao(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione marcas</option>
                {COLECOES_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {agrupamento !== 'Time' && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <span>Times</span>
                  <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
                >
                  <option value="">Selecione marcas</option>
                  <option value="time_estilo">Time de Estilo</option>
                  <option value="time_modelagem">Time de Modelagem</option>
                  <option value="time_producao">Time de Produção</option>
                </select>
              </div>
            )}
          </div>
        </div>
        )}

        {/* 1.3 CONTEXTO DE TAGS (Tags ⓘ, Item de Tag ⓘ) */}
        {agrupamento !== 'Marca' && agrupamento !== 'Tag' && (
        <div className="space-y-2 border-b border-border-muted pb-4">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Contexto de Tags
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <span>Tags</span>
                <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione marcas</option>
                <option value="linha_nobre">Linha Nobre</option>
                <option value="bestseller">Best Seller</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <span>Item de Tag</span>
                <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </label>
              <select
                value={selectedItemTag}
                onChange={(e) => setSelectedItemTag(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione tags</option>
              </select>
            </div>
          </div>
        </div>
        )}

        {/* 1.4 CONTEXTO DE CAMPOS */}
        <div className="space-y-2 border-b border-border-muted pb-4">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Contexto de Campos
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Campos Customizados</label>
              <select
                value={selectedCampoCust}
                onChange={(e) => setSelectedCampoCust(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Valores</label>
              <select
                value={selectedValor}
                onChange={(e) => setSelectedValor(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione Campos</option>
              </select>
            </div>
          </div>
        </div>

        {/* 1.5 CONTEXTO DE ETAPAS */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Contexto de Etapas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <span>Fluxos</span>
                <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </label>
              <select
                value={selectedFluxo}
                onChange={(e) => setSelectedFluxo(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
              >
                <option value="">Selecione...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Percurso de Etapas</label>
              <div className="flex gap-2">
                <select
                  value={selectedPercurso1}
                  onChange={(e) => setSelectedPercurso1(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
                >
                  <option value="">Selecione...</option>
                  {ETAPAS_OPTIONS.slice(0, 5).map(e => <option key={e} value={e}>{e}</option>)}
                </select>

                <select
                  value={selectedPercurso2}
                  onChange={(e) => setSelectedPercurso2(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
                >
                  <option value="">Selecione...</option>
                  {ETAPAS_OPTIONS.slice(5, 10).map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <span>Período</span>
                <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Depois de..."
                  value={periodoDepois}
                  onChange={(e) => setPeriodoDepois(e.target.value)}
                  className="w-1/2 px-2.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
                />
                <input
                  type="text"
                  placeholder="Antes de..."
                  value={periodoAntes}
                  onChange={(e) => setPeriodoAntes(e.target.value)}
                  className="w-1/2 px-2.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. GRÁFICO DE BARRAS (CARD NÍVEL 2) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
        
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h4 className="text-sm font-bold font-editorial text-primary flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent-camel" /> Gráficos — Agrupado por {agrupamento}
          </h4>
          <span className="text-xs font-semibold text-muted italic">Quantidade de Produtos</span>
        </div>

        {/* REGUA DE ESCALA COMPLETA */}
        <div className="pl-36 pr-8 flex justify-between text-[10px] font-bold text-muted border-b border-border-muted pb-1">
          {maxScale === 2.2 ? (
            <>
              <span>0</span>
              <span>0.2</span>
              <span>0.4</span>
              <span>0.6</span>
              <span>0.8</span>
              <span>1</span>
              <span>1.2</span>
              <span>1.4</span>
              <span>1.6</span>
              <span>1.8</span>
              <span>2</span>
              <span>2.2</span>
            </>
          ) : maxScale === 1000 ? (
            <>
              <span>0</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
              <span>600</span>
              <span>700</span>
              <span>800</span>
              <span>900</span>
              <span>1000</span>
            </>
          ) : maxScale === 1200 ? (
            <>
              <span>0</span>
              <span>100</span>
              <span>200</span>
              <span>300</span>
              <span>400</span>
              <span>500</span>
              <span>600</span>
              <span>700</span>
              <span>800</span>
              <span>900</span>
              <span>1000</span>
              <span>1100</span>
              <span>1200</span>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* BARRAS HORIZONTAIS */}
        <div className="space-y-3.5 pt-2">
          {currentData.map((item: GraficoDimensaoMetric, idx: number) => {
            const percent = (item.quantidade / maxScale) * 100;

            return (
              <div key={idx} className="flex items-center text-xs">
                <span className="w-36 font-semibold text-primary truncate pr-3 text-right">
                  {item.rotulo}
                </span>

                <div className="flex-1 bg-surface-muted h-8 rounded-lg overflow-hidden flex items-center p-0.5 relative border border-border/70">
                  <div
                    className="h-full bg-primary rounded-md transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                  <span className="ml-3 font-extrabold text-primary text-xs">
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
