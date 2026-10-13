import { useRef } from 'react';
import {
  Shirt,
  Layers,
  Ruler,
  Scissors,
  SwatchBook,
  Paperclip,
  Handshake,
  Coins,
  Calculator,
  PersonStanding,
  History,
  ChartNoAxesCombined,
  type LucideIcon,
} from 'lucide-react';
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
      ['anexos', 'Imagens e arquivos'],
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
const icons: Record<FichaTabId, LucideIcon> = {
  geral: Shirt,
  variantes: Layers,
  anexos: Paperclip,
  modelagem: Ruler,
  corte: Scissors,
  tecidos: SwatchBook,
  aviamentos: Paperclip,
  terceiros: Handshake,
  custos: Coins,
  precificacao: Calculator,
  prova_roupa: PersonStanding,
  historico: History,
  graficos: ChartNoAxesCombined,
};

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
      <div className="flex flex-nowrap gap-2 overflow-x-auto p-2">
        {groups.map((group) => (
          <div key={group.name} role="group" aria-label={group.name} className="shrink-0">
            <p className="mb-1 px-2 text-xs font-medium text-muted">{group.name}</p>
            <div className="flex flex-nowrap gap-0.5 rounded-control bg-surface-muted/70 p-0.5">
              {group.tabs.map(([id, label]) => {
                const Icon = icons[id];
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
                    className={`inline-flex min-h-control-compact items-center gap-1 whitespace-nowrap rounded-control px-1 py-1.5 text-xs font-semibold transition-colors ${active === id ? 'bg-accent-camel/10 text-accent-camel' : 'text-muted-foreground hover:bg-surface'}`}
                  >
                    <Icon aria-hidden="true" strokeWidth={1.5} className="h-3.5 w-3.5" />
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
