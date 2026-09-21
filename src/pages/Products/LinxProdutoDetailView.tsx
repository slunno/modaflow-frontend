import React from 'react';
import {
  ArrowLeft,
  BadgeDollarSign,
  CalendarDays,
  Database,
  LockKeyhole,
  Package,
  Shirt,
  UserRound,
} from 'lucide-react';
import type { LinxProdutoValido } from '../../types/linx';

interface LinxProdutoDetailViewProps {
  product: LinxProdutoValido;
  sourceDatabase: string;
  onBack: () => void;
}

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function DetailField({ label, value, mono = false }: DetailFieldProps) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
        {label}
      </dt>
      <dd className={'text-xs font-semibold text-primary break-words ' + (mono ? 'font-mono' : '')}>
        {value ?? '—'}
      </dd>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatCurrency(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatGriffe(griffe: string | null): string {
  switch (griffe) {
    case 'K&J BLACK':
      return 'K&J Black';
    case 'KING&JOE':
      return 'King & Joe';
    case 'KING&JOE PLAY':
      return 'King & Joe Play';
    default:
      return griffe ?? '—';
  }
}

export const LinxProdutoDetailView: React.FC<LinxProdutoDetailViewProps> = ({
  product,
  sourceDatabase,
  onBack,
}) => {
  const title = product.descricao ?? product.codigo ?? 'Produto sem descrição';
  const material =
    product.descricaoMaterialPrincipal && product.materialPrincipal
      ? product.descricaoMaterialPrincipal + ' (' + product.materialPrincipal + ')'
      : (product.descricaoMaterialPrincipal ?? product.materialPrincipal ?? '—');

  return (
    <div className="space-y-6 font-sans pb-16 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-xs font-bold text-primary hover:border-accent-camel/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às peças
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-muted text-[11px] font-semibold text-muted-foreground">
            <Database className="w-3.5 h-3.5" />
            {sourceDatabase}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-bold text-emerald-700">
            <LockKeyhole className="w-3.5 h-3.5" />
            Somente leitura
          </span>
        </div>
      </div>

      <header className="bg-surface p-6 rounded-xl border border-border shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-24 h-24 shrink-0 rounded-xl bg-surface-muted border border-border-muted flex items-center justify-center">
            <Shirt className="w-11 h-11 text-accent-camel/70" strokeWidth={1.25} />
          </div>
          <div className="min-w-0 space-y-2">
            <span className="text-xs font-mono font-semibold text-accent-camel">
              {product.codigo ?? 'Sem código'}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-editorial text-primary">{title}</h1>
            <p className="text-xs text-muted-foreground">
              Registro oficial existente no Linx. Esta visualização não altera o banco da empresa.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
          <h2 className="text-sm font-bold font-editorial text-primary flex items-center gap-2 border-b border-border-muted pb-3">
            <Package className="w-4 h-4 text-accent-camel" />
            Produto e coleção
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Código Linx" value={product.codigo} mono />
            <DetailField label="ID Linx" value={product.linxId} mono />
            <DetailField label="Griffe" value={formatGriffe(product.griffe)} />
            <DetailField label="Coleção" value={product.colecaoNome ?? product.colecaoCodigo} />
            <DetailField label="Código da coleção" value={product.colecaoCodigo} mono />
            <DetailField label="Temporada" value={product.temporada} />
            <DetailField label="Grupo" value={product.grupo} />
            <DetailField label="Subgrupo" value={product.subgrupo} />
            <DetailField label="Tipo" value={product.tipo} />
            <DetailField label="Período PCP" value={product.periodoPcp} />
            <DetailField label="Grade" value={product.grade} />
            <DetailField label="Linha" value={product.linha} />
            <DetailField label="Cartela" value={product.cartela} />
            <DetailField label="Modelagem" value={product.modelagem} />
          </dl>
        </section>

        <section className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
          <h2 className="text-sm font-bold font-editorial text-primary flex items-center gap-2 border-b border-border-muted pb-3">
            <Database className="w-4 h-4 text-accent-camel" />
            Dados do Linx
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Material principal" value={material} />
            <DetailField label="Código do material" value={product.materialPrincipal} mono />
            <DetailField label="Status do produto" value={product.statusProduto} mono />
            <DetailField label="Tipo de status" value={product.tipoStatusProduto} mono />
            <DetailField label="Griffe cadastrada na coleção" value={product.griffeColecao} />
            <DetailField label="Código normalizado" value={product.codigoNormalizado} mono />
          </dl>
          <p className="text-[11px] leading-relaxed text-muted-foreground bg-surface-muted rounded-lg border border-border-muted p-3">
            Os códigos de status são exibidos exatamente como armazenados no Linx. Eles não são
            convertidos para “completa” ou “em andamento”, pois essa equivalência não foi
            confirmada.
          </p>
        </section>

        <section className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
          <h2 className="text-sm font-bold font-editorial text-primary flex items-center gap-2 border-b border-border-muted pb-3">
            <CalendarDays className="w-4 h-4 text-accent-camel" />
            Datas
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Início da coleção" value={formatDate(product.dataInicioColecao)} />
            <DetailField label="Final da coleção" value={formatDate(product.dataFinalColecao)} />
            <DetailField
              label="Cadastro do produto"
              value={formatDate(product.dataCadastramento)}
            />
            <DetailField
              label="Início do desenvolvimento"
              value={formatDate(product.dataInicioDesenvolvimento)}
            />
          </dl>
        </section>

        <section className="bg-surface p-6 rounded-xl border border-border shadow-2xs space-y-4">
          <h2 className="text-sm font-bold font-editorial text-primary flex items-center gap-2 border-b border-border-muted pb-3">
            <UserRound className="w-4 h-4 text-accent-camel" />
            Responsáveis e valores
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField label="Estilista" value={product.estilista} />
            <DetailField label="Modelista" value={product.modelista} />
            <DetailField
              label="Custo de reposição"
              value={
                <span className="inline-flex items-center gap-1">
                  <BadgeDollarSign className="w-3.5 h-3.5 text-muted" />
                  {formatCurrency(product.custoReposicao)}
                </span>
              }
            />
            <DetailField
              label="Preço de reposição"
              value={
                <span className="inline-flex items-center gap-1">
                  <BadgeDollarSign className="w-3.5 h-3.5 text-muted" />
                  {formatCurrency(product.precoReposicao)}
                </span>
              }
            />
          </dl>
        </section>
      </div>
    </div>
  );
};
