/**
 * ============================================================================
 * MÓDULO: Aba Dashboard (Visão Geral & Gráficos com Tokens AKR BRANDS)
 * ARQUIVO: src/pages/Home/components/DashboardTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Exibe as estatísticas de tempo de permanência por etapa.
 *            Utiliza cartões de conteúdo elevados com bordas suaves e paleta
 *            alinhada aos tokens institucionais da marca.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Filter, BarChart2, MousePointerClick } from 'lucide-react';
import { MultiSelectDropdown } from '../../../components/ui/MultiSelectDropdown';
import { getDashboardMetrics, getBrands, getCollections } from '../../../services/plmService';
import { useAuth } from '../../../hooks/useAuth';
import type { DashboardMetricDetail } from '../../../types/plm';

export const DashboardTab: React.FC = () => {
  const { user } = useAuth();

  // ESTADOS DOS FILTROS DO DASHBOARD
  const [selectedEtapa, setSelectedEtapa] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedColecoes, setSelectedColecoes] = useState<string[]>([]);
  const [selectedFornecedores, setSelectedFornecedores] = useState<string[]>([]);
  const [responsaveisBusca, setResponsaveisBusca] = useState('');

  // DADOS DE MÉTRICAS CARREGADOS VIA SERVICE / API
  const [metricsMap, setMetricsMap] = useState<Record<string, DashboardMetricDetail>>({});
  const [fetchedMarcas, setFetchedMarcas] = useState<string[]>([]);
  const [fetchedColecoes, setFetchedColecoes] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getDashboardMetrics(),
      getBrands().catch(() => []),
      getCollections().catch(() => []),
    ]).then(([metricsData, brandsData, collectionsData]) => {
      if (!isMounted) return;
      setMetricsMap(metricsData);
      setFetchedMarcas(brandsData.map((b) => b.nome));
      setFetchedColecoes(collectionsData.map((c) => c.nome));
      const firstEtapa = Object.keys(metricsData)[0];
      if (firstEtapa) setSelectedEtapa(firstEtapa);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const marcasOptions = useMemo(() => {
    const userMarcas = user?.marcas?.map((m) => m.nome) || [];
    const combined = Array.from(new Set([...userMarcas, ...fetchedMarcas]));
    return combined.sort();
  }, [user, fetchedMarcas]);

  const colecoesOptions = useMemo(() => {
    return Array.from(new Set(fetchedColecoes)).sort();
  }, [fetchedColecoes]);

  const etapasOptions = useMemo(() => {
    return Object.keys(metricsMap).sort();
  }, [metricsMap]);

  // DADOS DE ETAPAS E BARRAS CALCULADOS DINAMICAMENTE DA API
  const etapasBarrasData = useMemo(() => {
    return Object.entries(metricsMap).map(([etapaKey, detail]) => ({
      etapa: etapaKey,
      azul: detail.emDia || detail.entradas || 0,
      laranja: detail.entregaHoje || detail.atrasadas || 0,
    }));
  }, [metricsMap]);

  // MÉTRICA ATIVA DA ETAPA FOCADA
  const currentMetric: DashboardMetricDetail = (selectedEtapa &&
    metricsMap[selectedEtapa.toLowerCase()]) || {
    mediaMes: '--',
    mediaSemana: '--',
    entradas: 0,
    saidas: 0,
    emDia: 0,
    entregaHoje: 0,
    atrasadas: 0,
    responsaveis: [],
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      {/* 1. PAINEL DE FILTROS DO DASHBOARD (CARD NÍVEL 2) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h4 className="text-xs font-bold font-editorial text-primary uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-camel" strokeWidth={1.5} /> Filtros do Dashboard
          </h4>
          <span className="text-xs font-semibold text-muted bg-surface-muted px-3 py-1 rounded-lg border border-border-muted">
            Visão Geral Operacional
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* SELETOR DE ETAPA */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Etapa</label>
            <select
              value={selectedEtapa}
              onChange={(e) => setSelectedEtapa(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-semibold text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
            >
              <option value="">Todas as etapas</option>
              {etapasOptions.map((et) => (
                <option key={et} value={et}>
                  {et.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* SELETOR DE MARCAS */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Marcas</label>
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
            >
              <option value="">Todas as marcas</option>
              {marcasOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* COLEÇÕES MULTI-SELECT */}
          <MultiSelectDropdown
            label="Coleções"
            placeholder="Selecione as coleções"
            options={colecoesOptions}
            selectedValues={selectedColecoes}
            onChange={setSelectedColecoes}
          />

          {/* RESPONSÁVEIS */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Responsáveis
            </label>
            <input
              type="text"
              placeholder="Buscar responsável..."
              value={responsaveisBusca}
              onChange={(e) => setResponsaveisBusca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
            />
          </div>

          {/* FORNECEDORES MULTI-SELECT */}
          <MultiSelectDropdown
            label="Fornecedores"
            placeholder="Selecionar fornecedores"
            options={[]}
            selectedValues={selectedFornecedores}
            onChange={setSelectedFornecedores}
          />
        </div>

        <div className="pt-1">
          <span className="inline-block text-[11px] font-bold text-accent-camel bg-accent-camel/10 px-3.5 py-1 rounded-lg border border-accent-camel/30 uppercase tracking-wider">
            Etapa Ativa: {selectedEtapa}
          </span>
        </div>
      </div>

      {/* 2. SEÇÃO VISÃO GERAL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-editorial text-primary tracking-tight">
            Visão geral
          </h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium bg-surface px-3 py-1 rounded-lg border border-border shadow-2xs">
            <MousePointerClick className="w-4 h-4 text-accent-camel" strokeWidth={1.5} /> Clique em
            qualquer barra para alterar a etapa
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CARD ESQUERDO: MÉDIAS DE TEMPO */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-6 flex flex-col justify-between transition-all duration-300">
            <div>
              <h4 className="text-sm font-bold font-editorial text-primary border-b border-border-muted pb-2 mb-4">
                {selectedEtapa.toLowerCase()}
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Média mês atual</span>
                  <strong className="text-primary font-bold text-xs">
                    {currentMetric.mediaMes}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Média semana atual</span>
                  <strong className="text-primary font-bold text-xs">
                    {currentMetric.mediaSemana}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Entradas na semana</span>
                  <strong className="text-primary font-bold text-xs">
                    {currentMetric.entradas}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Saídas na semana</span>
                  <strong className="text-primary font-bold text-xs">{currentMetric.saidas}</strong>
                </div>
              </div>
            </div>

            {/* AVATARES DOS RESPONSÁVEIS */}
            <div className="border-t border-border-muted pt-3">
              <span className="block text-[11px] font-bold text-muted-foreground mb-2">
                Responsáveis
              </span>
              <div className="flex items-center gap-2">
                {currentMetric.responsaveis.map((resp, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center text-white ${
                      i % 2 === 0 ? 'bg-primary' : 'bg-accent-camel'
                    }`}
                  >
                    {resp}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD DIREITO: GRÁFICOS DONUT */}
          <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-2xs flex items-center justify-around flex-wrap gap-6 transition-all duration-300">
            {/* DONUT 1: EM DIA (ACCENT CAMEL) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-accent-camel border-t-amber-100" />
                <span className="absolute text-3xl font-bold text-primary">
                  {currentMetric.emDia}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground mt-2">Em dia</span>
            </div>

            {/* DONUT 2: ENTREGA HOJE (ACCENT VERDE MILITAR) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-accent-militar border-t-emerald-100" />
                <span className="absolute text-3xl font-bold text-primary">
                  {currentMetric.entregaHoje}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground mt-2">Entrega Hoje</span>
            </div>

            {/* DONUT 3: ATRASADAS (ACCENT BORDÔ) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-[10px] border-accent-bordo border-t-accent-bordo/20" />
                <span className="absolute text-2xl font-bold text-muted">
                  {currentMetric.atrasadas > 0 ? currentMetric.atrasadas : '--'}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground mt-2">Atrasadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICO DE BARRAS */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h4 className="text-sm font-bold font-editorial text-primary flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent-camel" /> Quantidade de Peças por Etapa de
            Produção
          </h4>
          <span className="text-xs text-muted font-medium">
            Clique em qualquer barra para detalhar
          </span>
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
                className={`flex items-center text-xs p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-camel/10 border border-accent-camel/40 shadow-2xs scale-[1.01]'
                    : 'hover:bg-surface-muted'
                }`}
              >
                <span
                  className={`w-48 font-semibold truncate pr-3 text-right ${
                    isSelected ? 'text-accent-camel font-bold' : 'text-muted-foreground'
                  }`}
                >
                  {item.etapa}
                </span>

                {/* BARRA DO GRÁFICO PRETO-TINTA + CAMEL */}
                <div className="flex-1 h-7 bg-surface-muted rounded-lg overflow-hidden flex items-center p-0.5 relative border border-border">
                  {/* BARRA PRETO-TINTA */}
                  {item.azul > 0 && (
                    <div
                      className="h-full bg-primary rounded-l-md transition-all duration-500"
                      style={{ width: `${widthBluePercent}%` }}
                    />
                  )}
                  {/* BARRA CAMEL */}
                  {item.laranja > 0 && (
                    <div
                      className="h-full bg-accent-camel rounded-r-md transition-all duration-500"
                      style={{ width: `${widthOrangePercent}%` }}
                    />
                  )}

                  <span className="ml-2 font-bold text-primary text-xs">{total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
