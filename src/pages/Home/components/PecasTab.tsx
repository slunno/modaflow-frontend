/**
 * ============================================================================
 * MÓDULO: Aba Peças (Catálogo & Filtros com Multi-Select de Etapas, Tipos e Estações)
 * ARQUIVO: src/pages/Home/components/PecasTab.tsx
 * PROJETO: ModaFlow PLM — AKR BRANDS
 * DESCRIÇÃO: Renderiza a listagem de peças com os dropdowns multi-seleção de
 *            Etapas, Tipos de Peças (incluindo Regata, Short, Sunga, Tricot),
 *            Status da Coleção, Coleções e Estações, alimentada por plmService.
 * ============================================================================
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { PecaItem } from '../../../types/plm';
import { Search, Filter, Loader2, Shirt } from 'lucide-react';
import { MultiSelectDropdown } from '../../../components/ui/MultiSelectDropdown';
import { getProducts, getBrands, getCollections } from '../../../services/plmService';
import { useAuth } from '../../../hooks/useAuth';

interface PecasTabProps {
  onSelectPeca?: (peca: PecaItem) => void;
}

export const PecasTab: React.FC<PecasTabProps> = ({ onSelectPeca }) => {
  const { user } = useAuth();

  // DADOS VIA SERVICE / API
  const [pecasList, setPecasList] = useState<PecaItem[]>([]);
  const [fetchedMarcas, setFetchedMarcas] = useState<string[]>([]);
  const [fetchedColecoes, setFetchedColecoes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ESTADOS DOS FILTROS
  const [filterMarca, setFilterMarca] = useState('');
  const [selectedEtapas, setSelectedEtapas] = useState<string[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [filterStatusPeca, setFilterStatusPeca] = useState('');
  const [filterStatusColecao, setFilterStatusColecao] = useState('');
  const [selectedColecoes, setSelectedColecoes] = useState<string[]>([]);
  const [selectedEstacoes, setSelectedEstacoes] = useState<string[]>([]);
  const [filterTecido, setFilterTecido] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([getProducts(), getBrands().catch(() => []), getCollections().catch(() => [])])
      .then(([productsData, brandsData, collectionsData]) => {
        if (!isMounted) return;
        setPecasList(productsData);
        setFetchedMarcas(brandsData.map((b) => b.nome));
        setFetchedColecoes(collectionsData.map((c) => c.nome));
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // OPÇÕES DINÂMICAS EXTRAÍDAS ESTRITAMENTE DA API E DOS REGISTROS REAIS DO BANCO DE DADOS
  const marcasOptions = useMemo(() => {
    const userMarcas = user?.marcas?.map((m) => m.nome) || [];
    const pecaMarcas = pecasList.map((p) => p.marcaNome).filter(Boolean);
    const combined = Array.from(new Set([...userMarcas, ...fetchedMarcas, ...pecaMarcas]));
    return combined.sort();
  }, [user, fetchedMarcas, pecasList]);

  const etapasOptions = useMemo(() => {
    const fromPecas = pecasList.map((p) => p.etapaAtual).filter(Boolean);
    return Array.from(new Set(fromPecas)).sort();
  }, [pecasList]);

  const tiposOptions = useMemo(() => {
    const fromPecas = pecasList.map((p) => p.tipo).filter(Boolean);
    return Array.from(new Set(fromPecas)).sort();
  }, [pecasList]);

  const statusPecaOptions = useMemo(() => {
    const fromPecas = pecasList.map((p) => p.status).filter(Boolean);
    return Array.from(new Set(fromPecas)).sort();
  }, [pecasList]);

  const statusColecaoOptions = useMemo(() => {
    const fromPecas = pecasList.map((p) => p.statusColecao).filter((s): s is string => Boolean(s));
    return Array.from(new Set(fromPecas)).sort();
  }, [pecasList]);

  const colecoesOptions = useMemo(() => {
    const fromPecas = pecasList.map((p) => p.colecaoNome).filter(Boolean);
    const combined = Array.from(new Set([...fetchedColecoes, ...fromPecas]));
    return combined.sort();
  }, [fetchedColecoes, pecasList]);

  const estacoesOptions = useMemo(() => {
    const fromPecas = pecasList.map((p) => p.estacao).filter((e): e is string => Boolean(e));
    return Array.from(new Set(fromPecas)).sort();
  }, [pecasList]);

  // FILTRAGEM REATIVA DE PEÇAS
  const filteredPecas = useMemo(() => {
    return pecasList.filter((peca) => {
      const matchSearch =
        searchTerm === '' ||
        peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        peca.codigo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchMarca = filterMarca === '' || peca.marcaNome === filterMarca;

      const matchEtapa =
        selectedEtapas.length === 0 ||
        selectedEtapas.some((e) => e.toLowerCase() === peca.etapaAtual.toLowerCase());

      const matchTipo =
        selectedTipos.length === 0 ||
        selectedTipos.some((t) => t.toLowerCase() === peca.tipo.toLowerCase());

      const matchStatusPeca = filterStatusPeca === '' || peca.status === filterStatusPeca;

      const matchColecao =
        selectedColecoes.length === 0 || selectedColecoes.includes(peca.colecaoNome);

      const matchTecido =
        filterTecido === '' ||
        peca.tecidos.some((t) => t.toLowerCase().includes(filterTecido.toLowerCase()));

      return (
        matchSearch &&
        matchMarca &&
        matchEtapa &&
        matchTipo &&
        matchStatusPeca &&
        matchColecao &&
        matchTecido
      );
    });
  }, [
    pecasList,
    searchTerm,
    filterMarca,
    selectedEtapas,
    selectedTipos,
    filterStatusPeca,
    selectedColecoes,
    filterTecido,
  ]);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      {/* 1. PAINEL DE FILTROS AVANÇADOS (CARD NÍVEL 2) */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <h4 className="text-sm font-bold font-editorial text-primary flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-camel" strokeWidth={1.5} /> Filtros
          </h4>
          <span className="text-xs font-semibold text-muted bg-surface-muted px-3 py-1 rounded-lg border border-border-muted">
            Opções de Filtro
          </span>
        </div>

        {/* LINHA 1 DE FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Marcas</label>
            <select
              value={filterMarca}
              onChange={(e) => setFilterMarca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            >
              <option value="">Selecionar marcas</option>
              {marcasOptions.map((marca) => (
                <option key={marca} value={marca}>
                  {marca}
                </option>
              ))}
            </select>
          </div>

          <MultiSelectDropdown
            label="Etapas"
            placeholder="Selecionar etapas"
            options={etapasOptions}
            selectedValues={selectedEtapas}
            onChange={setSelectedEtapas}
          />

          <MultiSelectDropdown
            label="Tipos de Peças"
            placeholder="Selecionar tipos"
            options={tiposOptions}
            selectedValues={selectedTipos}
            onChange={setSelectedTipos}
          />

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Status da Peça
            </label>
            <select
              value={filterStatusPeca}
              onChange={(e) => setFilterStatusPeca(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            >
              <option value="">Selecionar status</option>
              {statusPecaOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LINHA 2 DE FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Status da Coleção
            </label>
            <select
              value={filterStatusColecao}
              onChange={(e) => setFilterStatusColecao(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            >
              <option value="">Selecione o status da coleção</option>
              {statusColecaoOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <MultiSelectDropdown
            label="Coleções"
            placeholder="Selecione as coleções"
            options={colecoesOptions}
            selectedValues={selectedColecoes}
            onChange={setSelectedColecoes}
          />

          <MultiSelectDropdown
            label="Estações"
            placeholder="Selecionar estações"
            options={estacoesOptions}
            selectedValues={selectedEstacoes}
            onChange={setSelectedEstacoes}
          />
        </div>

        {/* LINHA 3 DE FILTROS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Tecido</label>
            <input
              type="text"
              placeholder="Buscar Tecido"
              value={filterTecido}
              onChange={(e) => setFilterTecido(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Aviamento
            </label>
            <input
              type="text"
              placeholder="Buscar Aviamento"
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Terceiro
            </label>
            <input
              type="text"
              placeholder="Buscar Terceiro"
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* LINHA 4 DE FILTROS */}
        <div className="max-w-xs pt-1">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Buscar Peças
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none transition-all duration-200"
            />
            <Search className="w-4 h-4 text-muted absolute left-3 top-3" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* 2. GRID DE EXIBIÇÃO DE PEÇAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-editorial text-primary">
            Peças ({filteredPecas.length})
          </h3>
          <span className="text-xs text-muted font-medium">Exibindo catálogo do PLM</span>
        </div>

        {isLoading ? (
          <div className="bg-surface p-12 rounded-xl border border-border text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-accent-camel animate-spin" />
            <span className="text-xs text-muted font-medium">Carregando catálogo de peças...</span>
          </div>
        ) : filteredPecas.length === 0 ? (
          <div className="bg-surface p-12 rounded-xl border border-border text-center space-y-3">
            <Shirt className="w-10 h-10 text-muted mx-auto opacity-60" strokeWidth={1.5} />
            <h4 className="text-sm font-bold font-editorial text-primary">
              Nenhuma peça encontrada
            </h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Ajuste os filtros de pesquisa para visualizar outros produtos do catálogo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredPecas.map((peca) => (
              <div
                key={peca.id}
                onClick={() => onSelectPeca?.(peca)}
                className="bg-surface border border-border rounded-xl p-4 shadow-2xs hover:border-accent-camel/50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-primary truncate">{peca.nome}</h4>
                </div>

                <div className="w-full h-44 rounded-lg bg-surface-muted border border-border-muted overflow-hidden mb-3 relative flex items-center justify-center">
                  <img
                    src={peca.imagemCroquiUrl}
                    alt={peca.nome}
                    className="w-full h-full object-cover img-brand-treated group-hover:scale-105 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <p>
                    Status: <strong className="text-primary font-semibold">{peca.status}</strong>
                  </p>
                  <p>
                    Tema: <strong className="text-primary font-semibold">{peca.tema}</strong>
                  </p>
                  <p className="truncate">
                    Coleção:{' '}
                    <strong className="text-primary font-semibold">{peca.colecaoNome}</strong>
                  </p>
                  <p>
                    Marca:{' '}
                    <strong className="text-accent-camel font-semibold">{peca.marcaNome}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
