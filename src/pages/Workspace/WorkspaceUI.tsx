import { useEffect, useRef, type ReactNode } from 'react';
import { AlertCircle, ArrowRight, Inbox, LoaderCircle, RefreshCw, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import type { OperationalProduct, WorkspaceDocument } from '../../types/workspace';
import { currency, deadline, displayDate, productCosts } from '../../services/workspaceDomain';

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="akr-page-header">
      <div>
        <p className="akr-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="akr-actions">{children}</div>
    </header>
  );
}
export function DataState({
  loading,
  error,
  empty,
  noBrand,
  retry,
  children,
}: {
  loading: boolean;
  error: string;
  empty?: boolean;
  noBrand?: boolean;
  retry: () => void;
  children?: ReactNode;
}) {
  if (noBrand)
    return (
      <div className="akr-panel akr-empty">
        <Inbox size={30} />
        <h2>Selecione uma marca</h2>
        <p>Escolha uma marca no cabeçalho para acessar os registros autorizados ao seu perfil.</p>
      </div>
    );
  if (loading)
    return (
      <div className="akr-panel akr-empty" role="status">
        <LoaderCircle className="animate-spin" size={28} />
        <p>Consultando os registros compartilhados…</p>
      </div>
    );
  if (error)
    return (
      <div className="akr-alert" role="alert">
        <AlertCircle size={20} />
        <span>
          <strong>Falha ao consultar. </strong>
          {error}
        </span>
        <button className="akr-button" onClick={retry}>
          <RefreshCw size={14} />
          Tentar novamente
        </button>
      </div>
    );
  if (empty)
    return (
      <>
        {children ?? (
          <Empty
            title="Nenhum registro cadastrado"
            description="Adicione o primeiro registro para começar."
          />
        )}
      </>
    );
  return null;
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="akr-panel akr-empty">
      <Inbox size={30} strokeWidth={1.2} />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Drawer({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close.current();
      if (event.key !== 'Tab') return;
      const nodes = Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]'
        ) ?? []
      );
      const first = nodes[0],
        last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keyboard);
      previous?.focus();
    };
  }, []);
  return (
    <>
      <div className="akr-drawer-backdrop" onClick={onClose} />
      <div ref={ref} className="akr-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="akr-drawer-header">
          <h2>{title}</h2>
          <button className="akr-icon-button" aria-label="Fechar edição" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="akr-drawer-body">{children}</div>
        {footer && <div className="akr-drawer-footer">{footer}</div>}
      </div>
    </>
  );
}
export function DeadlineBadge({ product }: { product: OperationalProduct }) {
  const state = deadline(product);
  return (
    <span
      className={
        'akr-badge ' +
        (state === 'Atrasado'
          ? 'late'
          : state === 'Concluído'
            ? 'done'
            : state === 'Vence hoje'
              ? 'today'
              : '')
      }
    >
      {state}
    </span>
  );
}
export function ProductTable({
  rows,
  finance = false,
  origin,
}: {
  rows: WorkspaceDocument<OperationalProduct>[];
  finance?: boolean;
  origin?: string;
}) {
  const [params] = useSearchParams();
  const context = new URLSearchParams(params);
  if (origin) context.set('origem', origin);
  return (
    <div className="akr-table-scroll">
      <table className="akr-table">
        <thead>
          <tr>
            <th>Modelo / código</th>
            <th>Coleção</th>
            <th>Etapa</th>
            <th>Responsável</th>
            <th>Prazo</th>
            {finance && <th className="num">Custo unitário</th>}
            <th>Situação</th>
            <th>
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <Link
                  to={'/pecas/' + row.id + '?' + context.toString()}
                  className="akr-product-cell"
                >
                  {row.data.imagemCroquiUrl ? (
                    <img src={row.data.imagemCroquiUrl} alt="" />
                  ) : (
                    <span className="akr-product-placeholder">
                      <Inbox size={18} />
                    </span>
                  )}
                  <span>
                    <strong>{row.data.nome}</strong>
                    <small>{row.data.codigo || 'Código não informado'}</small>
                  </span>
                </Link>
              </td>
              <td>{row.data.colecaoNome}</td>
              <td>
                <span className="akr-badge">{row.data.etapaAtual || 'Sem etapa'}</span>
              </td>
              <td>{row.data.responsavel || 'Não informado'}</td>
              <td>{displayDate(row.data.previsaoEntrega)}</td>
              {finance && (
                <td className="num">
                  {(() => {
                    const cost = productCosts(row.data);
                    return cost.weighted !== null
                      ? currency(cost.weighted)
                      : cost.range
                        ? cost.range[0] === cost.range[1]
                          ? currency(cost.range[0])
                          : currency(cost.range[0]) + ' – ' + currency(cost.range[1])
                        : 'Pendente';
                  })()}
                </td>
              )}
              <td>
                <DeadlineBadge product={row.data} />
              </td>
              <td>
                <Link
                  className="akr-icon-button"
                  aria-label={'Abrir ficha de ' + row.data.nome}
                  to={'/pecas/' + row.id + '?' + context.toString()}
                >
                  <ArrowRight size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
