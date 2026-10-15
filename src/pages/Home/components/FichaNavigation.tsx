import { useRef } from 'react';
import type { PecaItem } from '../../../types/plm';
import {
  conferirFicha,
  assinaturaConferenciaVariante,
  confirmacaoAtual,
} from '../../../services/fichaProcesso';
import { StatusBadge, type FichaStatus } from '../../../components/ui/FichaPrimitives';

const groups = [
  {
    name: 'Produto',
    tabs: [
      ['geral', 'Geral'],
      ['variantes', 'Variantes'],
    ],
  },
  {
    name: 'Técnico',
    tabs: [
      ['modelagem', 'Modelagem'],
      ['corte', 'Corte'],
      ['tecidos', 'Tecidos'],
      ['aviamentos', 'Aviamentos'],
      ['terceiros', 'Terceiros'],
    ],
  },
  {
    name: 'Financeiro',
    tabs: [
      ['custos', 'Custos'],
      ['precificacao', 'Precificação'],
    ],
  },
  {
    name: 'Acompanhamento',
    tabs: [
      ['prova_roupa', 'Prova de Roupa'],
      ['historico', 'Histórico'],
      ['graficos', 'Gráficos'],
    ],
  },
] as const;
export type FichaTabId = (typeof groups)[number]['tabs'][number][0];

export function FichaNavigation({
  peca,
  active,
  onChange,
  shared = false,
}: {
  peca: PecaItem;
  active: FichaTabId;
  onChange: (id: FichaTabId) => void;
  shared?: boolean;
}) {
  const refs = useRef(new Map<FichaTabId, HTMLButtonElement>());
  const pending = conferirFicha(peca);
  // Somente áreas cobertas pela conferência existente recebem avaliação formal.
  const checked = ['geral', 'tecidos', 'aviamentos'] as const;
  const status = (id: FichaTabId): FichaStatus => {
    if (!checked.some((item) => item === id)) return 'neutral';
    if (pending.some((item) => item.aba === id)) return 'pending';
    if (id === 'aviamentos' || id === 'tecidos') {
      const variants = peca.fichaTecnica?.variantes ?? [];
      if (!variants.some((item) => item[id].length)) {
        const components =
          id === 'tecidos'
            ? (['entretela'] as const)
            : (['ziper', 'etiqueta', 'elastico'] as const);
        return variants.length &&
          variants.every((variant) =>
            components.every((component) => {
              const decision =
                peca.fichaTecnica?.conferencia?.componentesPorVariante?.[variant.id]?.[component];
              return (
                decision?.aplicavel === false &&
                confirmacaoAtual(
                  decision,
                  assinaturaConferenciaVariante(variant, peca.fichaTecnica?.tamanhos ?? [])
                )
              );
            })
          )
          ? 'na'
          : 'neutral';
      }
    }
    return 'complete';
  };
  const tabs = groups.flatMap((group) => [...group.tabs]);
  return (
    <nav
      aria-label="Abas da ficha técnica"
      className="ficha-navigation rounded-card border border-border bg-surface shadow-card"
    >
      <div className="flex flex-nowrap gap-x-3 gap-y-2 overflow-x-auto p-3 sm:flex-wrap sm:overflow-visible">
        {groups.map((group) => (
          <div
            key={group.name}
            role="group"
            aria-label={group.name}
            className="min-w-0 shrink-0 sm:shrink"
          >
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {group.name}
            </p>
            <div className="flex flex-nowrap gap-1 sm:flex-wrap">
              {group.tabs.map(([id, label]) => {
                const title = shared && id === 'graficos' ? 'Cronograma' : label;
                return (
                  <button
                    key={id}
                    ref={(node) => {
                      if (node) refs.current.set(id, node);
                      else refs.current.delete(id);
                    }}
                    type="button"
                    aria-label={title}
                    aria-pressed={active === id}
                    aria-controls="ficha-conteudo"
                    tabIndex={active === id ? 0 : -1}
                    onClick={() => onChange(id)}
                    onKeyDown={(event) => {
                      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
                      event.preventDefault();
                      const index = tabs.findIndex(([tab]) => tab === id);
                      const next =
                        event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? tabs.length - 1
                            : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) %
                              tabs.length;
                      const target = tabs[next]?.[0];
                      if (target) {
                        onChange(target);
                        refs.current.get(target)?.focus();
                      }
                    }}
                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-control px-2 py-1.5 text-xs font-semibold transition-colors ${active === id ? 'bg-accent-camel/10 text-accent-camel ring-1 ring-accent-camel/30' : 'text-muted-foreground hover:bg-surface-muted'}`}
                  >
                    {title}
                    <StatusBadge compact status={status(id)} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
