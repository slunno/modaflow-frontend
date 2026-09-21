/**
 * Catálogo oficial de peças elegíveis, lido diretamente do Linx por meio do backend.
 * Todos os filtros desta tela são aplicados no SQL Server antes da paginação.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Shirt,
  ShieldCheck,
} from 'lucide-react';
import {
  getLinxColecoesValidas,
  getLinxConnectionInfo,
  getLinxProdutosValidos,
  getLinxSubgrupos,
} from '../../../services/linxService';
import { MultiSelectDropdown } from '../../../components/ui/MultiSelectDropdown';
import type {
  LinxColecaoValida,
  LinxConnectionInfo,
  LinxProdutoValido,
  LinxProdutosValidosPage,
  LinxGriffe,
  LinxStatusColecaoFiltro,
  LinxStatusPecaFiltro,
} from '../../../types/linx';

interface PecasTabProps {
  onSelectPeca?: (peca: LinxProdutoValido, sourceDatabase: string) => void;
}

const PAGE_SIZE = 50;
const GRIFFE_OPTIONS: ReadonlyArray<{ value: LinxGriffe; label: string }> = [
  { value: 'K&J BLACK', label: 'K&J Black' },
  { value: 'KING&JOE', label: 'King & Joe' },
  { value: 'KING&JOE PLAY', label: 'King & Joe Play' },
];
const STAGE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'GERACAO_FICHA', label: '01 geração de ficha' },
  { value: 'ENGENHARIA_RECEBIMENTO', label: '02 engenharia recebimento' },
  { value: 'MODELAGEM', label: '03 modelagem' },
  { value: 'MINI_RISCO_CONSUMO', label: '04 mini risco / consumo' },
  { value: 'CHECAGEM_MP_LINX', label: '05 checagem de mp linx' },
  { value: 'AGUARDANDO_TECIDO_FORNECEDOR', label: '06 aguardando tecido fornecedor' },
  { value: 'ESTOQUE_TECIDOS_MATRIZ', label: '07 estoque de tecidos matriz' },
  { value: 'REVISAO_INTEGRACAO_GERACAO_OP', label: '08 revisão/integração + geração de op' },
  { value: 'ENCAIXE_RISCO', label: '09 encaixe / risco' },
  { value: 'CORTE', label: '10 corte' },
  { value: 'ESTAMPARIA', label: '11 estamparia' },
  { value: 'BORDADO', label: '12 bordado' },
  { value: 'ESTOQUE_AVIAMENTOS', label: '13 estoque de aviamentos' },
  { value: 'PILOTAGEM_COSTURA', label: '14 pilotagem/costura' },
  { value: 'CD_LAVANDERIA', label: '15 cd lavanderia' },
  { value: 'LAVANDERIA', label: '16 lavanderia' },
  { value: 'ACABAMENTO', label: '17 acabamento' },
  { value: 'PRE_CUSTO_SEQUENCIA_OPERACIONAL', label: '18 pré-custo e sequência operacional' },
  { value: 'APROVACAO_PILOTO_CM', label: '19 aprovação da piloto' },
  { value: 'FINAL', label: 'Final' },
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'INTEGRACAO_LINX', label: 'Integração linx' },
  {
    value: 'REVISAR_FICHA_TECNICA_LIBERAR_MOSTRUARIO',
    label: 'Revisar ficha técnica (liberar mostruário)',
  },
];
const PIECE_STATUS_OPTIONS = [
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'COMPLETA', label: 'Completas' },
  { value: 'A_DESENHAR', label: 'A desenhar' },
] as const;
const COLLECTION_STATUS_OPTIONS = [
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluída' },
  { value: 'ARQUIVADO', label: 'Arquivadas' },
] as const;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível consultar os produtos no Linx.';
}

function friendlyGriffe(griffe: string | null): string {
  return GRIFFE_OPTIONS.find((option) => option.value === griffe)?.label ?? griffe ?? '—';
}

function productType(product: LinxProdutoValido): string {
  return product.subgrupo ?? product.tipo ?? product.grupo ?? 'Tipo não informado';
}

function materialLabel(product: LinxProdutoValido): string {
  if (product.descricaoMaterialPrincipal && product.materialPrincipal) {
    return product.descricaoMaterialPrincipal + ' (' + product.materialPrincipal + ')';
  }
  return product.descricaoMaterialPrincipal ?? product.materialPrincipal ?? 'Não informado';
}

export const PecasTab: React.FC<PecasTabProps> = ({ onSelectPeca }) => {
  const [productsPage, setProductsPage] = useState<LinxProdutosValidosPage | null>(null);
  const [connection, setConnection] = useState<LinxConnectionInfo | null>(null);
  const [collections, setCollections] = useState<LinxColecaoValida[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const [griffes, setGriffes] = useState<LinxGriffe[]>([]);
  const [collectionCodes, setCollectionCodes] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [materialInput, setMaterialInput] = useState('');
  const [stages, setStages] = useState<string[]>([]);
  const [pieceStatuses, setPieceStatuses] = useState<LinxStatusPecaFiltro[]>([]);
  const [collectionStatuses, setCollectionStatuses] = useState<LinxStatusColecaoFiltro[]>([]);

  const search = useDebouncedValue(searchInput.trim(), 350);
  const material = useDebouncedValue(materialInput.trim(), 350);
  const productRequestId = useRef(0);
  const collectionRequestId = useRef(0);

  useEffect(() => {
    let active = true;
    getLinxConnectionInfo()
      .then((data) => {
        if (active) setConnection(data);
      })
      .catch(() => {
        if (active) setConnection(null);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setIsLoadingTypes(true);
    });
    getLinxSubgrupos()
      .then((data) => {
        if (active) setProductTypes(data);
      })
      .catch(() => {
        if (active) setProductTypes([]);
      })
      .finally(() => {
        if (active) setIsLoadingTypes(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    const requestId = ++collectionRequestId.current;
    let active = true;
    queueMicrotask(() => {
      if (active && requestId === collectionRequestId.current) {
        setIsLoadingCollections(true);
      }
    });
    getLinxColecoesValidas({ griffe: griffes })
      .then((data) => {
        if (active && requestId === collectionRequestId.current) {
          setCollections(data);
        }
      })
      .catch(() => {
        if (active && requestId === collectionRequestId.current) {
          setCollections([]);
        }
      })
      .finally(() => {
        if (active && requestId === collectionRequestId.current) {
          setIsLoadingCollections(false);
        }
      });

    return () => {
      active = false;
    };
  }, [griffes, reloadKey]);

  useEffect(() => {
    const requestId = ++productRequestId.current;
    let active = true;
    queueMicrotask(() => {
      if (active && requestId === productRequestId.current) {
        setIsLoading(true);
        setError(null);
      }
    });

    getLinxProdutosValidos({
      page,
      size: PAGE_SIZE,
      search: search || undefined,
      griffe: griffes.length > 0 ? griffes : undefined,
      colecao: collectionCodes.length > 0 ? collectionCodes : undefined,
      tipo: types.length > 0 ? types : undefined,
      material: material || undefined,
      etapa: stages.length > 0 ? stages : undefined,
      statusPeca: pieceStatuses.length > 0 ? pieceStatuses : undefined,
      statusColecao: collectionStatuses.length > 0 ? collectionStatuses : undefined,
    })
      .then((data) => {
        if (active && requestId === productRequestId.current) {
          setProductsPage(data);
        }
      })
      .catch((requestError: unknown) => {
        if (active && requestId === productRequestId.current) {
          setProductsPage(null);
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (active && requestId === productRequestId.current) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    collectionCodes,
    collectionStatuses,
    griffes,
    material,
    page,
    pieceStatuses,
    reloadKey,
    search,
    stages,
    types,
  ]);

  const collectionOptions = useMemo(
    () =>
      [...collections]
        .filter((collection) => Boolean(collection.codigo))
        .sort((a, b) =>
          (a.nome ?? a.codigo ?? '').localeCompare(b.nome ?? b.codigo ?? '', 'pt-BR')
        ),
    [collections]
  );

  const sourceDatabase =
    productsPage?.sourceDatabase ?? connection?.banco ?? 'Linx';
  const totalElements = productsPage?.totalElements ?? 0;
  const totalPages = productsPage?.totalPages ?? 0;
  const items = productsPage?.items ?? [];
  const isSafeConnection =
    productsPage?.readOnly === true ||
    (connection?.bancoEsperadoConfirmado === true &&
      connection.integracaoSomenteLeitura === true);

  const resetPage = () => setPage(0);

  const handleGriffeChange = (values: string[]) => {
    setGriffes(values as LinxGriffe[]);
    setCollectionCodes([]);
    setCollections([]);
    setIsLoadingCollections(true);
    resetPage();
  };

  const clearFilters = () => {
    setGriffes([]);
    setCollectionCodes([]);
    setCollections([]);
    setIsLoadingCollections(false);
    setSearchInput('');
    setTypes([]);
    setMaterialInput('');
    setStages([]);
    setPieceStatuses([]);
    setCollectionStatuses([]);
    resetPage();
  };

  const retry = () => setReloadKey((current) => current + 1);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      <div className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-muted pb-3">
          <h4 className="text-sm font-bold font-editorial text-primary flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-camel" strokeWidth={1.5} />
            Filtros do Linx
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground bg-surface-muted px-3 py-1 rounded-lg border border-border-muted flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              {sourceDatabase}
            </span>
            <span
              className={
                'text-[11px] font-semibold px-3 py-1 rounded-lg border flex items-center gap-1.5 ' +
                (isSafeConnection
                  ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/25'
                  : 'text-muted-foreground bg-surface-muted border-border-muted')
              }
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isSafeConnection ? 'Integração somente leitura' : 'Verificando conexão'}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Fonte oficial: produtos ativos do Linx vinculados a uma coleção ativa nas três griffes
          autorizadas. Os filtros são aplicados no banco antes da paginação.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MultiSelectDropdown
            label="Griffes"
            placeholder="Todas as griffes"
            options={GRIFFE_OPTIONS}
            selectedValues={griffes}
            onChange={handleGriffeChange}
          />

          <MultiSelectDropdown
            label="Coleções"
            placeholder={isLoadingCollections ? 'Carregando coleções...' : 'Todas as coleções'}
            options={collectionOptions.map((collection) => ({
              value: collection.codigo ?? '',
              label:
                (collection.nome ?? collection.codigo ?? 'Coleção sem nome') +
                ' (' +
                collection.quantidadeProdutos +
                ')',
            })).filter((option) => Boolean(option.value))}
            selectedValues={collectionCodes}
            onChange={(values) => {
              setCollectionCodes(values);
              resetPage();
            }}
          />

          <div>
            <label
              htmlFor="linx-product-search"
              className="block text-xs font-semibold text-muted-foreground mb-1"
            >
              Produto
            </label>
            <div className="relative">
              <input
                id="linx-product-search"
                type="search"
                placeholder="Código ou descrição"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  resetPage();
                }}
                className="w-full pl-9 pr-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-3" strokeWidth={1.5} />
            </div>
          </div>

          <MultiSelectDropdown
            label="Tipos de Peças"
            placeholder={isLoadingTypes ? 'Carregando tipos...' : 'Todos os tipos de peças'}
            options={productTypes}
            selectedValues={types}
            onChange={(values) => {
              setTypes(values);
              resetPage();
            }}
          />

          <MultiSelectDropdown
            label="Etapas"
            placeholder="Todas as etapas"
            options={STAGE_OPTIONS}
            selectedValues={stages}
            onChange={(values) => {
              setStages(values);
              resetPage();
            }}
          />

          <MultiSelectDropdown
            label="Status da Peça"
            placeholder="Todos os status"
            options={PIECE_STATUS_OPTIONS}
            selectedValues={pieceStatuses}
            onChange={(values) => {
              setPieceStatuses(values as LinxStatusPecaFiltro[]);
              resetPage();
            }}
          />

          <MultiSelectDropdown
            label="Status da Coleção"
            placeholder="Todos os status"
            options={COLLECTION_STATUS_OPTIONS}
            selectedValues={collectionStatuses}
            onChange={(values) => {
              setCollectionStatuses(values as LinxStatusColecaoFiltro[]);
              resetPage();
            }}
          />

          <div>
            <label
              htmlFor="linx-material"
              className="block text-xs font-semibold text-muted-foreground mb-1"
            >
              Material principal
            </label>
            <input
              id="linx-material"
              type="search"
              placeholder="Código ou descrição"
              value={materialInput}
              onChange={(event) => {
                setMaterialInput(event.target.value);
                resetPage();
              }}
              className="w-full px-3.5 py-2.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-primary focus:border-accent-camel focus:ring-1 focus:ring-accent-camel/20 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-muted hover:bg-border-muted text-xs font-semibold text-primary transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold font-editorial text-primary">
            Peças ({totalElements.toLocaleString('pt-BR')})
          </h3>
          <span className="text-xs text-muted font-medium">
            Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
          </span>
        </div>

        {error ? (
          <div
            role="alert"
            className="bg-surface p-8 rounded-xl border border-red-300/60 text-center space-y-3"
          >
            <AlertTriangle className="w-9 h-9 text-red-500 mx-auto" strokeWidth={1.5} />
            <h4 className="text-sm font-bold text-primary">Falha ao consultar o Linx</h4>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-camel text-white text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          </div>
        ) : isLoading && !productsPage ? (
          <div className="bg-surface p-12 rounded-xl border border-border text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-accent-camel animate-spin" />
            <span className="text-xs text-muted font-medium">Consultando o Linx...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-surface p-12 rounded-xl border border-border text-center space-y-3">
            <Shirt className="w-10 h-10 text-muted mx-auto opacity-60" strokeWidth={1.5} />
            <h4 className="text-sm font-bold font-editorial text-primary">
              Nenhuma peça encontrada
            </h4>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Não existe produto elegível no Linx para os filtros informados.
            </p>
          </div>
        ) : (
          <div className={isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {items.map((product, index) => {
                const key =
                  product.linxId ??
                  product.codigoNormalizado ??
                  product.codigo ??
                  String(page) + '-' + String(index);
                const title = product.descricao ?? product.codigo ?? 'Produto sem descrição';

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!onSelectPeca}
                    onClick={() => onSelectPeca?.(product, sourceDatabase)}
                    className={
                      'text-left bg-surface border border-border rounded-xl p-4 shadow-2xs transition-all duration-300 group ' +
                      (onSelectPeca
                        ? 'hover:border-accent-camel/50 hover:shadow-md hover:scale-[1.01] cursor-pointer'
                        : 'cursor-default')
                    }
                    aria-label={'Abrir detalhes somente leitura de ' + title}
                  >
                    <div className="min-w-0 mb-3">
                      <h4 className="text-xs font-bold text-primary truncate">{title}</h4>
                      <span className="text-[11px] font-mono text-accent-camel">
                        {product.codigo ?? 'Sem código'}
                      </span>
                    </div>

                    <div className="w-full h-32 rounded-lg bg-surface-muted border border-border-muted mb-3 flex items-center justify-center">
                      <Shirt
                        className="w-12 h-12 text-muted opacity-50 group-hover:text-accent-camel transition-colors"
                        strokeWidth={1.25}
                      />
                    </div>

                    <div className="space-y-1.5 text-[11px] text-muted-foreground">
                      <p className="truncate">
                        Tipo:{' '}
                        <strong className="text-primary font-semibold">
                          {productType(product)}
                        </strong>
                      </p>
                      <p className="truncate">
                        Coleção:{' '}
                        <strong className="text-primary font-semibold">
                          {product.colecaoNome ?? product.colecaoCodigo ?? '—'}
                        </strong>
                      </p>
                      <p>
                        Griffe:{' '}
                        <strong className="text-accent-camel font-semibold">
                          {friendlyGriffe(product.griffe)}
                        </strong>
                      </p>
                      <p className="truncate" title={materialLabel(product)}>
                        Material:{' '}
                        <strong className="text-primary font-semibold">
                          {materialLabel(product)}
                        </strong>
                      </p>
                      <p>
                        Status Linx:{' '}
                        <strong className="text-primary font-semibold">
                          {[product.statusProduto, product.tipoStatusProduto]
                            .filter(Boolean)
                            .join(' / ') || 'Não informado'}
                        </strong>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Paginação dos produtos do Linx"
            className="flex items-center justify-center gap-3 pt-2"
          >
            <button
              type="button"
              disabled={page === 0 || isLoading}
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-primary disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-xs font-semibold text-muted-foreground min-w-24 text-center">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={!productsPage?.hasNext || isLoading}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-primary disabled:opacity-40"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
};
