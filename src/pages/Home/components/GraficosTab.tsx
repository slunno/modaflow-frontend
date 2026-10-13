/**
 * ============================================================================
 * MÓDULO: Aba Gráficos (Analytics & BI Completo com Contextos do PLM)
 * ARQUIVO: src/pages/Home/components/GraficosTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Construtor analítico de relatórios de BI com agrupamento dinâmico,
 *            filtros de marcas sincronizados via API, tratamento de erros e
 *            sinalização clara para opções em planejamento.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Info, AlertCircle, RefreshCw } from 'lucide-react';
import type { GraficoDimensaoMetric } from '../../../types/plm';
import type { MarcaSummary } from '../../../types/auth';
import { getBiMetrics, getBrands, getCollections } from '../../../services/plmService';
import { useAuth } from '../../../hooks/useAuth';

export const GraficosTab: React.FC = () => {
  const { user } = useAuth();

  // ESTADO DO AGRUPAMENTO SELECIONADO
  const [agrupamento, setAgrupamento] = useState<
    'Campo' | 'Criador' | 'Fornecedor' | 'Marca' | 'Estilista' | 'Time' | 'Tipo' | 'Tag'
  >('Marca');

  const [selectedCampo, setSelectedCampo] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedColecao, setSelectedColecao] = useState('');
  const [selectedTime] = useState('');
  const [selectedTag] = useState('');
  const [selectedItemTag] = useState('');
  const [selectedCampoCust] = useState('');
  const [selectedValor] = useState('');
  const [selectedFluxo] = useState('');
  const [selectedPercurso1] = useState('');
  const [selectedPercurso2] = useState('');
  const [periodoDepois, setPeriodoDepois] = useState('');
  const [periodoAntes, setPeriodoAntes] = useState('');

  // SELEÇÃO DINÂMICA DO CONJUNTO DE DADOS PARA O GRÁFICO VIA SERVICE
  const [currentData, setCurrentData] = useState<GraficoDimensaoMetric[]>([]);
  const [brandsList, setBrandsList] = useState<MarcaSummary[]>([]);
  const [fetchedColecoes, setFetchedColecoes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Carrega opções de marcas e coleções
  useEffect(() => {
    let isMounted = true;
    Promise.all([getBrands().catch(() => []), getCollections().catch(() => [])]).then(
      ([brandsData, collectionsData]) => {
        if (!isMounted) return;
        setBrandsList(brandsData);
        setFetchedColecoes(collectionsData.map((c) => c.nome));
      }
    );
    return () => {
      isMounted = false;
    };
  }, []);

  // Recarrega métricas quando o agrupamento ou marca selecionada muda
  useEffect(() => {
    let isMounted = true;
    const targetBrand = brandsList.find((b) => b.nome === selectedMarca);
    setIsLoading(true);
    setErrorMessage('');

    getBiMetrics(agrupamento, targetBrand?.id)
      .then((data) => {
        if (!isMounted) return;
        setCurrentData(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os gráficos de BI do servidor.'
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [agrupamento, selectedMarca, brandsList]);

  const marcasOptions = useMemo(() => {
    const userMarcas = user?.marcas?.map((m) => m.nome) || [];
    const fromApi = brandsList.map((b) => b.nome);
    const combined = Array.from(new Set([...userMarcas, ...fromApi]));
    return combined.sort();
  }, [user, brandsList]);

  const colecoesOptions = useMemo(() => {
    return Array.from(new Set(fetchedColecoes)).sort();
  }, [fetchedColecoes]);

  // VALOR MÁXIMO PARA A RÉGUA DE ESCALA DO GRÁFICO (DINÂMICO)
  const maxVal = useMemo(() => {
    const vals = currentData.map((d: GraficoDimensaoMetric) => d.quantidade);
    return Math.max(...vals, 1);
  }, [currentData]);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      {/* 1. PAINEL DE FILTROS & CONTEXTOS (CARD NÍVEL 2) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-5 transition-all duration-300">
        <div className="border-b border-border-muted pb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold font-editorial text-primary">Filtros de BI</h4>
          <span className="text-xs font-semibold text-muted bg-surface-muted px-2.5 py-1 rounded-lg">
            Analytics PLM
          </span>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 text-xs font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1.1 AGRUPAMENTO COM ÍCONE DE INFORMAÇÃO ⓘ */}
        <div className="space-y-2 border-b border-border-muted pb-4">
          <label className="block text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <span>Agrupamento de Dados</span>
            <Info className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
          </label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                'Campo',
                'Criador',
                'Fornecedor',
                'Marca',
                'Estilista',
                'Time',
                'Tipo',
                'Tag',
              ] as const
            ).map((item) => {
              const isSelected = agrupamento === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAgrupamento(item)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'bg-accent-camel text-on-camel border-accent-camel shadow-2xs'
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
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Campo
              </label>
              <select
                value={selectedCampo}
                onChange={(e) => setSelectedCampo(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs cursor-pointer"
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
              <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                <span>Time</span>
                <span className="text-[10px] text-muted font-normal">(Em planejamento)</span>
              </label>
              <select
                disabled
                value={selectedTime}
                title="Agrupamento por times organizacionais em planejamento"
                className="w-full px-3.5 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
              >
                <option value="">Selecione uma marca abaixo</option>
              </select>
            </div>
          )}

          {/* Tag específica se agrupamento === 'Tag' */}
          {agrupamento === 'Tag' && (
            <div className="pt-2 max-w-sm">
              <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                <span>Tag</span>
                <span className="text-[10px] text-muted font-normal">(Em planejamento)</span>
              </label>
              <select
                disabled
                value={selectedTag}
                title="Agrupamento por tags de coleções em planejamento"
                className="w-full px-3.5 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
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
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Marcas
                </label>
                <select
                  value={selectedMarca}
                  onChange={(e) => setSelectedMarca(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs cursor-pointer"
                >
                  <option value="">Todas as marcas</option>
                  {marcasOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Coleções
                </label>
                <select
                  value={selectedColecao}
                  onChange={(e) => setSelectedColecao(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs cursor-pointer"
                >
                  <option value="">Todas as coleções</option>
                  {colecoesOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {agrupamento !== 'Time' && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center justify-between">
                    <span>Times</span>
                    <span className="text-[10px] text-muted font-normal">(Planejado)</span>
                  </label>
                  <select
                    disabled
                    value={selectedTime}
                    title="Filtro por times em planejamento"
                    className="w-full px-3.5 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
                  >
                    <option value="">Todos os times</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 1.3 CONTEXTO DE TAGS */}
        {agrupamento !== 'Marca' && agrupamento !== 'Tag' && (
          <div className="space-y-2 border-b border-border-muted pb-4">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Contexto de Tags</span>
              <span className="text-[10px] text-muted font-normal">Disponível na próxima fase</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tags</label>
                <select
                  disabled
                  value={selectedTag}
                  title="Filtro por tags em planejamento"
                  className="w-full px-3.5 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
                >
                  <option value="">Todas as tags</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Item de Tag
                </label>
                <select
                  disabled
                  value={selectedItemTag}
                  title="Filtro por item de tag em planejamento"
                  className="w-full px-3.5 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
                >
                  <option value="">Todos os itens</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 1.4 CONTEXTO DE CAMPOS */}
        <div className="space-y-2 border-b border-border-muted pb-4">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Contexto de Campos Customizados</span>
            <span className="text-[10px] text-muted font-normal">Disponível na próxima fase</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Campos Customizados
              </label>
              <select
                disabled
                value={selectedCampoCust}
                title="Campos customizados em planejamento"
                className="w-full px-3.5 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
              >
                <option value="">Nenhum campo selecionado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Valores
              </label>
              <select
                disabled
                value={selectedValor}
                title="Valores customizados em planejamento"
                className="w-full px-3.5 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
              >
                <option value="">Todos os valores</option>
              </select>
            </div>
          </div>
        </div>

        {/* 1.5 CONTEXTO DE ETAPAS */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Contexto de Etapas & Percurso
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center justify-between">
                <span>Fluxos</span>
                <span className="text-[10px] text-muted font-normal">(Planejado)</span>
              </label>
              <select
                disabled
                value={selectedFluxo}
                title="Fluxos em planejamento"
                className="w-full px-3.5 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
              >
                <option value="">Todos os fluxos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Percurso de Etapas
              </label>
              <div className="flex gap-2">
                <select
                  disabled
                  value={selectedPercurso1}
                  title="Percurso de etapas em planejamento"
                  className="w-1/2 px-2 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
                >
                  <option value="">De...</option>
                </select>

                <select
                  disabled
                  value={selectedPercurso2}
                  title="Percurso de etapas em planejamento"
                  className="w-1/2 px-2 py-2 bg-surface-muted/50 border border-border-muted rounded-lg text-xs font-medium text-muted cursor-not-allowed opacity-60"
                >
                  <option value="">Para...</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Período
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={periodoDepois}
                  onChange={(e) => setPeriodoDepois(e.target.value)}
                  className="w-1/2 px-2.5 py-2 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:bg-surface focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200 shadow-2xs"
                />
                <input
                  type="date"
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
            <BarChart3 className="w-4 h-4 text-accent-camel" /> Gráficos — Agrupado por{' '}
            {agrupamento}
          </h4>
          <span className="text-xs font-semibold text-muted italic">Quantidade de Produtos</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-semibold text-muted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-accent-camel" />
            <span>Atualizando métricas...</span>
          </div>
        ) : currentData.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">
            Nenhuma métrica disponível para este agrupamento no momento.
          </div>
        ) : (
          <div className="space-y-3.5 pt-2">
            {currentData.map((item: GraficoDimensaoMetric, idx: number) => {
              const percent = Math.min((item.quantidade / maxVal) * 100, 100);

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
        )}
      </div>
    </div>
  );
};
export default GraficosTab;
