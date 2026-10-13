import { Image as ImageIcon } from 'lucide-react';

interface Props {
  nome: string;
  codigo: string;
  custo: string;
  unidade: string;
  fornecedores: string[];
  cores: number;
  imagens: string[];
  fonte?: string;
  compacto: boolean;
}

export function InsumoResumo({
  nome,
  codigo,
  custo,
  unidade,
  fornecedores,
  cores,
  imagens,
  fonte,
  compacto,
}: Props) {
  if (compacto) {
    return (
      <aside
        aria-label="Resumo do insumo"
        className="order-first flex min-w-0 flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-muted/60 p-3"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
          {imagens[0] ? (
            <img src={imagens[0]} alt="Prévia do insumo" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon aria-hidden="true" className="h-6 w-6 text-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="break-words font-editorial text-sm font-semibold">
            {nome || 'Nome do insumo'}
          </h4>
          <p className="break-all text-[11px] text-muted">{codigo || 'Código a definir'}</p>
          <p className="break-words text-[11px] text-muted">
            {fornecedores.filter(Boolean).join(', ') || 'Fornecedor a definir'} · {cores} cor(es) ·{' '}
            {imagens.length} imagem(ns)
          </p>
        </div>
        <p
          className={`shrink-0 text-right text-lg font-semibold tabular-nums ${custo ? 'font-mono text-accent-camel' : 'text-status-pending'}`}
        >
          {custo ? `R$ ${custo}` : 'Preço a definir'}
          <span className="block text-[11px] font-normal text-muted">por {unidade}</span>
        </p>
      </aside>
    );
  }
  return (
    <aside
      aria-label="Resumo do insumo"
      className={`min-w-0 rounded-lg border border-border bg-surface-muted/60 p-3 ${compacto ? 'order-first' : 'h-fit lg:sticky lg:top-0'}`}
    >
      {!compacto && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Resumo do insumo
        </p>
      )}
      <div className={compacto ? 'flex items-center gap-3' : 'space-y-2'}>
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface ${compacto ? 'h-14 w-14' : 'h-32 w-full'}`}
        >
          {imagens[0] ? (
            <img src={imagens[0]} alt="Prévia do insumo" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon aria-hidden="true" className="h-7 w-7 text-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className={`break-words font-editorial font-semibold ${compacto ? 'text-sm' : 'text-lg'}`}
          >
            {nome || 'Nome do insumo'}
          </h4>
          <p className="mt-1 break-all text-[11px] text-muted">{codigo || 'Código a definir'}</p>
          <p className="mt-1 text-lg font-semibold text-accent-camel">
            {custo ? `R$ ${custo}` : 'Preço a definir'}
            <span className="ml-1 text-xs font-normal text-muted">/ {unidade}</span>
          </p>
        </div>
      </div>
      <p className="mt-2 break-words text-[11px] text-muted">
        {fornecedores.filter(Boolean).join(', ') || 'Fornecedor a definir'} · {cores} cor(es) ·{' '}
        {imagens.length} imagem(ns)
      </p>
      {!compacto && (
        <p className="mt-3 break-words rounded border border-accent-camel/20 bg-accent-camel/5 p-2 text-[11px] text-status-draft">
          {fonte ? (
            <>
              Valor selecionado: <span className="break-all">{fonte}</span>.
            </>
          ) : (
            'Preço manual vinculado à ficha.'
          )}{' '}
          Este cadastro não atualiza o catálogo do Linx.
        </p>
      )}
    </aside>
  );
}
