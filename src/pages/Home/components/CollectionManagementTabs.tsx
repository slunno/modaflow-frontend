import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ChevronDown, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CollectionPrintItem, PecaItem } from '../../../types/plm';
import type { TecidoCorItem, TecidoInsumoItem, TecidoFornecedorItem } from '../../../types/gestao';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { effectiveTheme, getCollectionThemes } from '../../../services/collectionThemes';
import type { CollectionTheme } from '../../../services/collectionThemes';
import { getInsumos, createInsumo } from '../../../services/plmService';
import { getLinxCoresCatalogo } from '../../../services/linxService';
import { getMaterialColorAppearance } from './materialColorAppearance';
import { MaterialColorPicker } from './MaterialColorPicker';
import { CreateColorModal } from './CreateColorModal';
import { LinxFornecedorPicker } from './LinxFornecedorPicker';
import { CriarTecidoModal } from '../../Gestao/modals/CriarTecidoModal';
import { decimalManual } from '../../../services/fichaProcesso';
import {
  Card,
  SectionHeader,
  EmptyState,
  Button,
  Dialog,
} from '../../../components/ui/FichaPrimitives';
import { CollectionDialog, CollectionNotice, CollectionColorChips } from './CollectionPresentation';
import { CollectionReservationCard } from './CollectionReservationCard';
import { collectionDate, collectionFooter } from './collectionFormatting';
import { CollectionPrintImageUpload } from './CollectionPrintImageUpload';
import { PecaImagem } from './PecaImagem';

type MaterialType = 'TECIDO' | 'AVIAMENTO';
type Material = TecidoInsumoItem;
export type Reservation = {
  id: string;
  collectionId: string;
  type: MaterialType;
  materialId: string;
  materialName: string;
  color: string;
  reserved: string;
  used: string;
  completed: string;
  notes: string;
  stylist: string;
  responsible: string;
  createdAt: string;
};

const field =
  'w-full min-h-10 rounded-control border border-border bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent-camel focus:ring-2 focus:ring-accent-camel/20';
const button =
  'min-h-10 rounded-control bg-accent-camel px-4 py-2 text-sm font-semibold text-on-camel hover:bg-accent-camel/90';
const secondary =
  'min-h-10 rounded-control border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-muted';
const uuid = () => crypto.randomUUID();

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <CollectionDialog title={title} onClose={onClose}>
      {children}
    </CollectionDialog>
  );
}

function MaterialPicker({
  type,
  onClose,
  onSelect,
}: {
  type: MaterialType;
  onClose: () => void;
  onSelect: (material: Material) => void;
}) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [localMaterials, setLocalMaterials] = usePersistedState<
    (Material & { type: MaterialType })[]
  >('modaflow_local_insumos', []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [supplier, setSupplier] = useState('');
  const [selected, setSelected] = useState<Material | null>(null);
  const [page, setPage] = useState(0);
  const [materialAttempt, setMaterialAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) {
          setLoading(true);
          setError('');
        }
        return getInsumos(type);
      })
      .then((items) => {
        if (active) setMaterials(items);
      })
      .catch(() => {
        if (active)
          setError(
            'Não foi possível consultar os insumos da API. Você ainda pode cadastrar um novo item neste navegador.'
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [type, materialAttempt]);

  const rows = useMemo(() => {
    const merged = [...localMaterials.filter((item) => item.type === type), ...materials];
    const unique = merged.filter(
      (item, index) => merged.findIndex((other) => other.id === item.id) === index
    );
    return unique.filter(
      (item) =>
        `${item.nome} ${item.codigo}`.toLowerCase().includes(name.toLowerCase()) &&
        (item.coresList ?? [])
          .map((entry) => entry.nome)
          .join(' ')
          .toLowerCase()
          .includes(color.toLowerCase()) &&
        item.fornecedores.toLowerCase().includes(supplier.toLowerCase())
    );
  }, [localMaterials, materials, type, name, color, supplier]);
  const visible = rows.slice(page * 10, page * 10 + 10);

  const saveMaterial = async (item: Material) => {
    let saved = item;
    try {
      const created = await createInsumo({
        nome: item.nome,
        codigo: item.codigo,
        tipo: type,
        custo: decimalManual(item.custo) ?? undefined,
        fornecedorNome: item.fornecedores,
        temErp: false,
        imagemUrl: item.imagemUrl,
        unidadeMedida: item.unidade,
        observacoes: item.observacoes,
      });
      saved = {
        ...item,
        ...created,
        custo: item.custo,
        corLinx: item.corLinx,
        precoLinx: item.precoLinx,
        propriedades: item.propriedades,
        coresList: item.coresList,
        fornecedoresList: item.fornecedoresList,
        imagensList: item.imagensList,
      };
      setMaterials((previous) => [saved, ...previous]);
      setError('');
    } catch {
      setError('API indisponível. O novo item foi salvo neste navegador e aparece na seleção.');
    }
    setLocalMaterials((previous) => [
      { ...saved, type },
      ...previous.filter((existing) => existing.id !== saved.id),
    ]);
    setCreating(false);
    setSelected(saved);
    setPage(0);
  };

  return (
    <>
      {!creating && (
        <CollectionDialog
          title={`Selecionar ${type === 'TECIDO' ? 'tecido' : 'aviamento'}`}
          onClose={onClose}
          className="max-w-5xl"
        >
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <label className="text-xs font-semibold">
              Procure pelo nome ou código
              <input
                className={`${field} mt-1`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setPage(0);
                }}
                placeholder="Código ou nome"
              />
            </label>
            <label className="text-xs font-semibold">
              Procure pela cor
              <input
                className={`${field} mt-1`}
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setPage(0);
                }}
                placeholder="Nome da cor"
              />
            </label>
            <label className="text-xs font-semibold">
              Procure pelo fornecedor
              <input
                className={`${field} mt-1`}
                value={supplier}
                onChange={(e) => {
                  setSupplier(e.target.value);
                  setPage(0);
                }}
                placeholder="Fornecedor"
              />
            </label>
          </div>
          {error && (
            <CollectionNotice
              message={error}
              onRetry={() => setMaterialAttempt((value) => value + 1)}
              busy={loading}
            />
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="p-3">Imagem</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Cores</th>
                  <th className="p-3">Fornecedores</th>
                  <th className="p-3">Custo</th>
                  <th className="p-3">Seleção</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border ${selected?.id === item.id ? 'bg-accent-camel/10' : 'hover:bg-surface-muted'}`}
                  >
                    <td className="p-3">
                      {item.imagemUrl ? (
                        <img
                          src={item.imagemUrl}
                          alt=""
                          className="h-14 w-14 rounded-control object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-8 w-8 text-muted" />
                      )}
                    </td>
                    <td className="p-3 font-semibold">
                      {item.nome}
                      <span className="block font-normal text-muted">{item.codigo || '—'}</span>
                    </td>
                    <td className="p-3">
                      {item.coresList?.map((entry) => entry.nome).join(', ') || '—'}
                    </td>
                    <td className="p-3">{item.fornecedores || '—'}</td>
                    <td className="p-3">{item.custo || '—'}</td>
                    <td className="p-3">
                      <input
                        type="radio"
                        name="material"
                        aria-label={`Selecionar ${item.nome}`}
                        checked={selected?.id === item.id}
                        onChange={() => setSelected(item)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && rows.length === 0 && (
              <p className="p-8 text-center text-sm text-muted">
                Nenhum {type === 'TECIDO' ? 'tecido' : 'aviamento'} cadastrado para esta busca.
                Cadastre um novo item para selecioná-lo.
              </p>
            )}
            {loading && <p className="p-8 text-center text-sm text-muted">Carregando insumos...</p>}
          </div>
          {rows.length > 10 && (
            <div className="flex items-center justify-end gap-3 p-4 text-xs">
              <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Anterior
              </button>
              <span>
                {page + 1} de {Math.ceil(rows.length / 10)}
              </span>
              <button
                type="button"
                disabled={(page + 1) * 10 >= rows.length}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </button>
            </div>
          )}
          <div className={`${collectionFooter} !justify-between text-xs`}>
            <span>
              Selecionados: {selected ? 1 : 0} · {rows.length} item(ns)
            </span>
            <div className="flex gap-2">
              <button type="button" className={secondary} onClick={() => setCreating(true)}>
                + Novo {type === 'TECIDO' ? 'tecido' : 'aviamento'}
              </button>
              <button
                type="button"
                className={button}
                disabled={!selected}
                onClick={() => {
                  if (selected) onSelect(selected);
                }}
              >
                Confirmar seleção
              </button>
            </div>
          </div>
        </CollectionDialog>
      )}
      <CriarTecidoModal
        isOpen={creating}
        editingTecido={null}
        tipo={type === 'TECIDO' ? 'tecido' : 'aviamento'}
        onClose={() => setCreating(false)}
        onSave={(item) => {
          void saveMaterial(item);
        }}
      />
    </>
  );
}

export function CollectionThemesTab({
  collectionId,
  collectionName,
  pieces,
  savedThemes,
  onSaveTheme,
}: {
  collectionId: string;
  collectionName: string;
  pieces: PecaItem[];
  savedThemes: CollectionTheme[];
  onSaveTheme: (theme: CollectionTheme, previousId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [colors, setColors] = useState('');
  const [delivery, setDelivery] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [collectionColors] = usePersistedState<(TecidoCorItem & { collectionId: string })[]>(
    'modaflow_collection_colors',
    []
  );
  const colorOptions = collectionColors
    .filter((color) => color.collectionId === collectionId)
    .map((color) => color.nome);
  const themes = getCollectionThemes(collectionId, savedThemes, pieces);
  const openTheme = (theme?: CollectionTheme) => {
    setEditingId(theme?.id ?? null);
    setName(theme?.name ?? '');
    setColors(theme?.colors.join(', ') ?? '');
    setDelivery(theme?.delivery ?? '');
    setDeliveryDate(theme?.deliveryDate ?? '');
    setOpen(true);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (
      !trimmed ||
      themes.some(
        (theme) =>
          theme.id !== editingId && theme.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase()
      )
    )
      return;
    const next: CollectionTheme = {
      id: editingId?.startsWith('imported-') ? uuid() : (editingId ?? uuid()),
      collectionId,
      name: trimmed,
      colors: colors
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      delivery: delivery.trim(),
      deliveryDate,
    };
    onSaveTheme(next, editingId);
    setOpen(false);
  };
  return (
    <Card className="space-y-5">
      <SectionHeader
        title={`Temas · ${collectionName}`}
        description="Organize as peças, cores e prazos de cada tema."
        action={
          <button type="button" className={button} onClick={() => openTheme()}>
            <Plus aria-hidden="true" className="mr-1 inline h-4 w-4" />
            Tema
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => {
          const matched = pieces.filter(
            (piece) =>
              effectiveTheme(piece.tema).toLocaleLowerCase() === theme.name.toLocaleLowerCase()
          );
          const completed = matched.filter((piece) =>
            ['completa', 'concluída', 'concluida'].includes(piece.status.toLocaleLowerCase())
          ).length;
          const percent = matched.length ? Math.round((completed / matched.length) * 100) : 0;
          return (
            <article
              key={theme.id}
              className="rounded-xl border border-border bg-surface-muted p-5"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-primary">{theme.name}</h4>
                {theme.id !== 'base' && (
                  <button
                    type="button"
                    className="text-xs text-accent-camel"
                    onClick={() => openTheme(theme)}
                  >
                    Editar
                  </button>
                )}
              </div>
              <div
                className="my-4 flex gap-2 overflow-hidden"
                aria-label="Miniaturas das peças do tema"
              >
                {matched.slice(0, 4).map((piece) => (
                  <div
                    key={piece.id}
                    className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surface"
                    title={piece.nome}
                  >
                    <PecaImagem
                      peca={piece}
                      className="h-full w-full object-contain"
                      fallback={
                        <ImagePlus aria-label={piece.nome} className="h-5 w-5 text-muted" />
                      }
                    />
                  </div>
                ))}
                {!matched.length && (
                  <p className="py-5 text-sm text-muted">Nenhuma peça neste tema.</p>
                )}
                {matched.length > 4 && (
                  <span className="self-center text-xs text-muted">+{matched.length - 4}</span>
                )}
              </div>
              <p className="mt-4 text-xs text-muted">Progresso</p>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full bg-accent-camel" style={{ width: `${percent}%` }} />
                </div>
                <strong className="text-sm">{percent}%</strong>
              </div>
              <p className="mt-3 text-xs text-muted">
                Peças concluídas{' '}
                <strong className="text-primary">
                  {completed} / {matched.length}
                </strong>
              </p>
              <div className="mt-4 space-y-3 border-t border-border pt-3 text-xs">
                <div className="flex flex-wrap gap-2">
                  {theme.colors.map((name) => (
                    <span key={name} className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 rounded-full border border-border"
                        style={{
                          background: getMaterialColorAppearance(
                            collectionColors.find(
                              (color) =>
                                color.collectionId === collectionId &&
                                color.nome.toLocaleLowerCase() === name.toLocaleLowerCase()
                            ) ?? {
                              id: name,
                              nome: name,
                              hex: '',
                            }
                          ).background,
                        }}
                      />
                      {name}
                    </span>
                  ))}
                </div>
                {!!theme.colors.length && (
                  <span className="sr-only">Cores: {theme.colors.join(', ')}</span>
                )}
                <p className="text-muted">
                  Data de entrega:{' '}
                  <strong className="font-medium text-primary">
                    {collectionDate(theme.deliveryDate)?.toLocaleDateString('pt-BR') ?? 'A definir'}
                  </strong>
                </p>
                {theme.delivery && <p className="text-muted">Entrega: {theme.delivery}</p>}
              </div>
            </article>
          );
        })}
      </div>
      {open && (
        <Modal title={editingId ? 'Editar tema' : 'Criar tema'} onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-4">
            <label className="block text-xs font-semibold">
              Nome
              <input
                className={`${field} mt-1`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <CollectionColorChips value={colors} onChange={setColors} options={colorOptions} />
            <details className="rounded-control border border-border p-3 text-xs">
              <summary className="cursor-pointer font-medium">
                Detalhe complementar da entrega{delivery ? ' · preenchido' : ''}
              </summary>
              <label className="mt-3 block">
                Entrega
                <input
                  className={field}
                  value={delivery}
                  onChange={(event) => setDelivery(event.target.value)}
                />
              </label>
              <p className="mt-2 text-muted">Identificação do lote ou observação já cadastrada.</p>
            </details>
            <label className="block text-xs font-semibold">
              Data de entrega
              <input
                type="date"
                className={`${field} mt-1`}
                value={deliveryDate}
                onChange={(event) => setDeliveryDate(event.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className={secondary} onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className={button}>
                Salvar tema
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  );
}

export function CollectionColorsTab({ collectionId }: { collectionId: string }) {
  type CollectionColor = TecidoCorItem & { collectionId: string; paleta: string };
  const [allColors, setAllColors] = usePersistedState<CollectionColor[]>(
    'modaflow_collection_colors',
    []
  );
  const [portalColors, setPortalColors] = usePersistedState<TecidoCorItem[]>('modaflow_colors', []);
  const [localMaterials] = usePersistedState<(Material & { type: MaterialType })[]>(
    'modaflow_local_insumos',
    []
  );
  const [catalogNames, setCatalogNames] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [consulting, setConsulting] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [paletteFilter, setPaletteFilter] = useState('Todas');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [chosenColor, setChosenColor] = useState<TecidoCorItem | null>(null);
  const [colorName, setColorName] = useState('');
  const [colorCode, setColorCode] = useState('');
  const [palette, setPalette] = useState('');
  const [suppliers, setSuppliers] = useState<TecidoFornecedorItem[]>([]);
  const [pickerPosition, setPickerPosition] = useState<{ top: number; left: number } | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) {
          setError('');
          setConsulting(true);
        }
        return getLinxCoresCatalogo();
      })
      .then((names) => {
        if (active) setCatalogNames(names);
      })
      .catch(() => {
        if (active)
          setError(
            'Não foi possível consultar as cores do Linx. Você pode criar uma cor personalizada.'
          );
      })
      .finally(() => {
        if (active) setConsulting(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const catalog = new Map<string, TecidoCorItem>();
  for (const color of [
    ...portalColors,
    ...localMaterials.flatMap((material) => material.coresList ?? []),
  ]) {
    const key = color.nome.toLocaleLowerCase();
    if (!catalog.has(key)) catalog.set(key, color);
  }
  for (const name of catalogNames)
    if (!catalog.has(name.toLocaleLowerCase()))
      catalog.set(name.toLocaleLowerCase(), { id: 'linx-cor-' + name, nome: name, hex: '' });
  const colors = allColors.filter((color) => color.collectionId === collectionId);
  const palettes = [...new Set(allColors.map((color) => color.paleta).filter(Boolean))].sort();
  const filtered = colors.filter(
    (color) =>
      `${color.nome} ${color.codigo ?? ''} ${color.fornecedoresList?.map((supplier) => supplier.fornecedor).join(' ') ?? ''}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) &&
      (paletteFilter === 'Todas' ||
        (paletteFilter === 'Sem paleta' ? !color.paleta : color.paleta === paletteFilter))
  );
  const chooseColor = (color: TecidoCorItem | null) => {
    setChosenColor(color);
    setColorName(color?.nome ?? '');
    setColorCode(color?.codigo ?? '');
  };
  const openAdd = (color?: CollectionColor) => {
    setEditingId(color?.id ?? null);
    chooseColor(color ?? null);
    setPalette(color?.paleta ?? '');
    setSuppliers(structuredClone(color?.fornecedoresList ?? []));
    setAdding(true);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!chosenColor || !colorName.trim()) return;
    const identifiedColor: TecidoCorItem = {
      ...chosenColor,
      nome: colorName.trim(),
      codigo: colorCode.trim() || undefined,
    };
    const known = colors.find(
      (color) =>
        color.nome.toLocaleLowerCase() === identifiedColor.nome.toLocaleLowerCase() &&
        color.codigo === identifiedColor.codigo
    );
    const saved: CollectionColor = {
      ...identifiedColor,
      id: editingId ?? known?.id ?? uuid(),
      collectionId,
      paleta: palette.trim(),
      fornecedoresList: suppliers.filter((supplier) => supplier.fornecedor),
    };
    setAllColors((previous) => [...previous.filter((color) => color.id !== saved.id), saved]);
    const originalColor = colors.find((color) => color.id === editingId);
    setPortalColors((previous) => {
      const original = originalColor
        ? previous.find(
            (color) =>
              color.id === editingId ||
              (color.nome.toLocaleLowerCase() === originalColor.nome.toLocaleLowerCase() &&
                color.codigo === originalColor.codigo)
          )
        : undefined;
      const catalogColor: TecidoCorItem = {
        id: original?.id ?? saved.id,
        nome: identifiedColor.nome,
        codigo: identifiedColor.codigo,
        hex: identifiedColor.hex,
        pantone: identifiedColor.pantone,
        fornecedoresList: saved.fornecedoresList,
      };
      return [
        ...previous.filter(
          (color) =>
            color.id !== catalogColor.id &&
            (color.nome.toLocaleLowerCase() !== catalogColor.nome.toLocaleLowerCase() ||
              color.codigo !== catalogColor.codigo)
        ),
        catalogColor,
      ];
    });
    setAdding(false);
  };
  const allSelected =
    filtered.length > 0 && filtered.every((color) => selectedIds.includes(color.id));
  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <section
          aria-label="Filtros de cores"
          className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="mr-4 font-semibold">Paleta</span>
            {['Todas', 'Sem paleta', ...palettes].map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => setPaletteFilter(name)}
                className={`rounded border px-2 py-1 ${paletteFilter === name ? 'border-accent-camel bg-accent-camel text-on-camel' : 'border-border text-primary'}`}
              >
                {name}
              </button>
            ))}
          </div>
          <label className="block min-w-48 flex-1 text-xs font-semibold">
            Busca
            <input
              aria-label="Buscar cores"
              className={`${field} mt-2`}
              placeholder="Procurar cor pelo nome, código..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </section>
      )}
      <section className="space-y-5 rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <h3 className="font-editorial text-lg font-bold">
            Cores <span className="text-xs text-muted">({colors.length})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Visualizar cores em grade"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              Grade
            </Button>
            <Button
              aria-label="Visualizar cores em lista"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              Lista
            </Button>
            <button
              type="button"
              className={secondary}
              onClick={() =>
                setSelectedIds(
                  allSelected
                    ? selectedIds.filter((id) => !filtered.some((color) => color.id === id))
                    : [...new Set([...selectedIds, ...filtered.map((color) => color.id)])]
                )
              }
            >
              {allSelected ? 'Limpar seleção' : 'Selecionar todas'}
            </button>
            <div className="relative">
              <button
                type="button"
                className={secondary}
                aria-expanded={optionsOpen}
                onClick={() => setOptionsOpen(!optionsOpen)}
              >
                Opções <ChevronDown className="inline h-3 w-3" />
              </button>
              {optionsOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-surface p-1 shadow-lg">
                  <button
                    type="button"
                    disabled={!selectedIds.length}
                    onClick={() => {
                      setAllColors((previous) =>
                        previous.filter(
                          (color) =>
                            color.collectionId !== collectionId || !selectedIds.includes(color.id)
                        )
                      );
                      setSelectedIds([]);
                      setOptionsOpen(false);
                    }}
                    className="w-full rounded p-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-surface-muted disabled:opacity-50"
                  >
                    Remover selecionadas
                  </button>
                </div>
              )}
            </div>
            <button type="button" className={button} onClick={() => openAdd()}>
              <Plus className="mr-1 inline h-4 w-4" />
              Adicionar
            </button>
          </div>
        </div>
        {error && (
          <CollectionNotice
            message={error}
            onRetry={() => setAttempt((value) => value + 1)}
            busy={consulting}
          />
        )}
        {!filtered.length ? (
          <EmptyState
            title={
              colors.length
                ? 'Nenhuma cor encontrada para estes filtros.'
                : 'Nenhuma cor adicionada à coleção.'
            }
            description={
              colors.length
                ? 'Experimente outra paleta ou termo de busca.'
                : 'Reúna as cores que definem a identidade desta coleção.'
            }
            action={
              colors.length ? (
                <Button
                  onClick={() => {
                    setSearch('');
                    setPaletteFilter('Todas');
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button onClick={() => openAdd()}>Adicionar cor</Button>
              )
            }
          />
        ) : (
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4'
                : 'space-y-3'
            }
          >
            {filtered.map((color) => {
              const appearance = getMaterialColorAppearance(color);
              return (
                <article
                  key={color.id}
                  className={`space-y-3 rounded-lg border p-3 text-xs ${selectedIds.includes(color.id) ? 'border-accent-camel bg-accent-camel/5' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1 text-muted">
                      <input
                        aria-label={`Selecionar cor ${color.nome}`}
                        type="checkbox"
                        checked={selectedIds.includes(color.id)}
                        onChange={(event) =>
                          setSelectedIds(
                            event.target.checked
                              ? [...selectedIds, color.id]
                              : selectedIds.filter((id) => id !== color.id)
                          )
                        }
                      />
                      Selecionar
                    </label>
                    <button
                      type="button"
                      className="text-accent-camel"
                      onClick={() => openAdd(color)}
                    >
                      Editar
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <div
                      className={
                        view === 'grid'
                          ? 'h-28 w-24 shrink-0 rounded-control border border-border shadow-sm'
                          : 'h-12 w-12 shrink-0 rounded-control border border-border shadow-sm'
                      }
                      style={{ background: appearance.background }}
                      aria-label={`${appearance.exact ? 'Amostra' : 'Amostra aproximada'} de ${color.nome}`}
                    />
                    <div className="min-w-0">
                      <h4 className="break-words font-semibold">{color.nome}</h4>
                      <p className="mt-1 text-muted">Código: {color.codigo || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-muted">
                    <p>Pantone: {color.pantone || '—'}</p>
                    <p>Paleta: {color.paleta || '—'}</p>
                    {!!color.fornecedoresList?.length && (
                      <p>
                        Fornecedores:{' '}
                        {color.fornecedoresList
                          .map((supplier) => `${supplier.fornecedor} (${supplier.codigo})`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      {adding && !creating && !pickerPosition && (
        <Modal title={editingId ? 'Editar Cor' : 'Adicionar Cor'} onClose={() => setAdding(false)}>
          <form onSubmit={save} className="text-xs">
            <div className="grid gap-6 md:grid-cols-[.8fr_1.2fr]">
              <aside className="rounded-card border border-border bg-surface-muted p-5">
                <div
                  className="mb-5 h-40 rounded-control border border-border"
                  style={{
                    background: chosenColor
                      ? getMaterialColorAppearance(chosenColor).background
                      : 'var(--color-surface)',
                  }}
                />
                <h4 className="font-editorial text-xl">{colorName.trim() || 'Prévia da cor'}</h4>
                <p className="mt-2 text-muted">
                  Código: {colorCode.trim() || '—'} · Pantone: {chosenColor?.pantone || '—'}
                </p>
                <p className="mt-2 text-muted">Paleta: {palette || 'Sem paleta'}</p>
              </aside>
              <div className="space-y-5">
                <div>
                  <span className="mb-1 block font-semibold">Cor *</span>
                  <button
                    type="button"
                    aria-label="Selecionar cor"
                    className={`${field} flex items-center gap-3 text-left`}
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setPickerPosition({
                        top: Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 378)),
                        left: Math.max(8, Math.min(rect.left, window.innerWidth - 234)),
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    {chosenColor
                      ? `${chosenColor.nome}${chosenColor.codigo ? ' (' + chosenColor.codigo + ')' : ''}`
                      : 'Escolha uma cor'}
                  </button>
                  <button
                    type="button"
                    className="mt-2 text-accent-camel"
                    onClick={() => setCreating(true)}
                  >
                    Criar uma cor
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block font-semibold">
                    Nome da cor *
                    <input
                      className={`${field} mt-1 disabled:opacity-50`}
                      placeholder="Ex.: Azul céu"
                      required
                      disabled={!chosenColor}
                      value={colorName}
                      onChange={(event) => setColorName(event.target.value)}
                    />
                  </label>
                  <label className="block font-semibold">
                    Código da cor (opcional)
                    <input
                      className={`${field} mt-1 disabled:opacity-50`}
                      placeholder="Ex.: AZ-001"
                      disabled={!chosenColor}
                      value={colorCode}
                      onChange={(event) => setColorCode(event.target.value)}
                    />
                  </label>
                </div>
                <label className="block font-semibold">
                  Paleta
                  <input
                    className={`${field} mt-1`}
                    list="collection-color-palettes"
                    placeholder="Escolha ou digite uma paleta"
                    value={palette}
                    onChange={(event) => setPalette(event.target.value)}
                  />
                  <datalist id="collection-color-palettes">
                    {palettes.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </label>
                <fieldset className="space-y-3 border-t border-border pt-4">
                  <legend className="font-semibold">Fornecedores</legend>
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-end gap-2">
                      <LinxFornecedorPicker
                        value={supplier}
                        onChange={(value) =>
                          setSuppliers((previous) =>
                            previous.map((item) =>
                              item.id === supplier.id ? { ...item, ...value } : item
                            )
                          )
                        }
                      />
                      <button
                        type="button"
                        aria-label="Remover fornecedor da cor"
                        onClick={() =>
                          setSuppliers((previous) =>
                            previous.filter((item) => item.id !== supplier.id)
                          )
                        }
                        className="p-2 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={secondary}
                    onClick={() =>
                      setSuppliers((previous) => [
                        ...previous,
                        { id: uuid(), fornecedor: '', codigo: '' },
                      ])
                    }
                  >
                    + Fornecedor
                  </button>
                </fieldset>
              </div>
            </div>
            <div className={collectionFooter}>
              <button type="button" className={secondary} onClick={() => setAdding(false)}>
                Fechar
              </button>
              <button type="submit" className={button} disabled={!chosenColor || !colorName.trim()}>
                {editingId ? 'Salvar cor' : 'Adicionar cor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {pickerPosition && (
        <MaterialColorPicker
          position={pickerPosition}
          extraColors={[...catalog.values()]}
          onClose={() => setPickerPosition(null)}
          onSelect={chooseColor}
          onCreate={() => {
            setPickerPosition(null);
            setCreating(true);
          }}
        />
      )}
      {creating && (
        <CreateColorModal
          onClose={() => setCreating(false)}
          onCreate={(color) => {
            chooseColor(color);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

export function CollectionPrintsTab({ collectionId }: { collectionId: string }) {
  const [allPrints, setAllPrints] = usePersistedState<CollectionPrintItem[]>(
    'modaflow_collection_prints',
    []
  );
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [image, setImage] = useState<string | undefined>();
  const [type, setType] = useState('Sublimação listras');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [fabrics, setFabrics] = useState<CollectionPrintItem['fabrics']>([]);
  const [imageReading, setImageReading] = useState(false);
  const [uploadFocus, setUploadFocus] = useState(false);
  const prints = allPrints.filter((item) => item.collectionId === collectionId);
  const close = useCallback(() => {
    setOpen(false);
    setPicker(false);
  }, []);
  const edit = (item?: CollectionPrintItem) => {
    setUploadFocus(false);
    setEditingId(item?.id ?? null);
    setImage(item?.image);
    setType(item?.type ?? 'Sublimação listras');
    setReference(item?.reference ?? '');
    setNotes(item?.notes ?? '');
    setFabrics(item?.fabrics.map((fabric) => ({ ...fabric })) ?? []);
    setImageReading(false);
    setOpen(true);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!reference.trim() || imageReading) return;
    const changes = { image, type, reference: reference.trim(), notes: notes.trim(), fabrics };
    setAllPrints((previous) =>
      editingId
        ? previous.map((item) =>
            item.id === editingId && item.collectionId === collectionId
              ? { ...item, ...changes }
              : item
          )
        : [{ id: uuid(), collectionId, ...changes }, ...previous]
    );
    close();
  };
  return (
    <Card className="space-y-5">
      <SectionHeader
        title="Estampas"
        description="Imagens, referências e tecidos que compõem a coleção."
        action={
          <button type="button" className={button} onClick={() => edit()}>
            <Plus aria-hidden="true" className="mr-1 inline h-4 w-4" />
            Estampa
          </button>
        }
      />
      {prints.length === 0 ? (
        <EmptyState
          title="Nenhuma estampa cadastrada nesta coleção."
          description="Adicione uma referência e sua imagem para usar nas fichas técnicas."
          action={<Button onClick={() => edit()}>Criar primeira estampa</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prints.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-card border border-border bg-surface shadow-card"
            >
              <button
                type="button"
                aria-label={`Editar estampa ${item.reference}`}
                onClick={() => edit(item)}
                className="block w-full text-left hover:bg-surface-muted"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-border bg-surface-muted">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`Estampa ${item.reference}`}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="space-y-2 text-center text-muted">
                      <ImagePlus aria-hidden="true" className="mx-auto h-10 w-10" />
                      <p className="text-sm">Sem imagem de referência</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="break-words font-editorial text-xl font-semibold">
                      {item.reference}
                    </h4>
                    <span className="flex items-center gap-1 text-xs font-semibold text-accent-camel">
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                      Editar
                    </span>
                  </div>
                  <span className="inline-flex rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs">
                    {item.type}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.fabrics.length ? (
                      item.fabrics.map((fabric) => (
                        <span
                          key={fabric.id}
                          className="rounded-control border border-border px-2 py-1 text-xs"
                        >
                          {fabric.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-muted">Tecidos: —</p>
                    )}
                  </div>
                  {item.notes && <p className="break-words text-xs text-muted">{item.notes}</p>}
                </div>
              </button>
              {!item.image && (
                <div className="px-4 pb-4">
                  <Button
                    aria-label={`Adicionar imagem à estampa ${item.reference}`}
                    className="w-full"
                    onClick={() => {
                      edit(item);
                      setUploadFocus(true);
                    }}
                  >
                    <ImagePlus aria-hidden="true" className="h-4 w-4" />
                    Adicionar imagem
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {open && !picker && (
        <Dialog
          title={editingId ? 'Editar estampa' : 'Criar estampa'}
          onClose={close}
          closeLabel="Fechar estampa"
          className="collection-workspace max-w-5xl"
        >
          <form onSubmit={save}>
            <div className="grid gap-6 md:grid-cols-2">
              <CollectionPrintImageUpload
                focusUpload={uploadFocus}
                value={image}
                onChange={setImage}
                onReadingChange={setImageReading}
              />
              <div className="space-y-5">
                <fieldset className="space-y-3 rounded-lg border border-border p-3">
                  <legend className="px-1 text-xs font-semibold">Geral</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold">
                      Tipo de estampa
                      <select
                        className={`${field} mt-1`}
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                      >
                        <option>Sublimação listras</option>
                        <option>Digital</option>
                        <option>Rotativa</option>
                        <option>Localizada</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold">
                      Código de referência
                      <input
                        className={`${field} mt-1`}
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <label className="block text-xs font-semibold">
                    Observações
                    <textarea
                      className={`${field} mt-1`}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Escreva as suas observações aqui"
                    />
                  </label>
                </fieldset>
                <div className="rounded-lg border border-border">
                  <div className="flex items-center justify-between border-b border-border p-3">
                    <strong className="text-xs">Tecidos nesta estampa</strong>
                    <button
                      type="button"
                      className={`${button} disabled:opacity-50`}
                      disabled={imageReading}
                      onClick={() => setPicker(true)}
                    >
                      + Tecido
                    </button>
                  </div>
                  {fabrics.length ? (
                    fabrics.map((fabric) => (
                      <div
                        key={fabric.id}
                        className="flex justify-between border-b border-border p-3 text-xs"
                      >
                        <span>
                          {fabric.name} · {fabric.code || '—'}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remover ${fabric.name}`}
                          onClick={() =>
                            setFabrics((previous) =>
                              previous.filter((item) => item.id !== fabric.id)
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="p-5 text-center text-xs text-muted">Nenhum item listado</p>
                  )}
                </div>
              </div>
            </div>
            <div className={collectionFooter}>
              <button type="button" className={secondary} onClick={close}>
                Cancelar
              </button>
              <button
                className={`${button} disabled:opacity-50`}
                type="submit"
                disabled={imageReading}
              >
                {editingId ? 'Salvar alterações' : 'Adicionar'}
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {picker && (
        <MaterialPicker
          type="TECIDO"
          onClose={() => setPicker(false)}
          onSelect={(material) => {
            setFabrics((previous) =>
              previous.some((item) => item.id === material.id)
                ? previous
                : [...previous, { id: material.id, name: material.nome, code: material.codigo }]
            );
            setPicker(false);
          }}
        />
      )}
    </Card>
  );
}

export function CollectionReservationsTab({
  collectionId,
  type,
  pieces,
}: {
  collectionId: string;
  type: MaterialType;
  pieces: PecaItem[];
}) {
  const [allReservations, setAllReservations] = usePersistedState<Reservation[]>(
    'modaflow_collection_reservations',
    []
  );
  const [localMaterials] = usePersistedState<(Material & { type: MaterialType })[]>(
    'modaflow_local_insumos',
    []
  );
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [open, setOpen] = useState(false);
  const [picker, setPicker] = useState(false);
  const [material, setMaterial] = useState<Material | null>(null);
  const [color, setColor] = useState('');
  const [reserved, setReserved] = useState('');
  const [used, setUsed] = useState('');
  const [completed, setCompleted] = useState('');
  const [notes, setNotes] = useState('');
  const [stylist, setStylist] = useState('');
  const [responsible, setResponsible] = useState('');
  const [filterStylist, setFilterStylist] = useState('');
  const [filterResponsible, setFilterResponsible] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const title = type === 'TECIDO' ? 'Tecidos' : 'Aviamentos';
  const activeFilters = [filterStylist, filterResponsible, start, end, query].filter(
    Boolean
  ).length;
  const hasReservations = allReservations.some(
    (item) => item.collectionId === collectionId && item.type === type
  );
  const unit = material?.unidade || 'unidade a definir';
  const clearFilters = () => {
    setFilterStylist('');
    setFilterResponsible('');
    setStart('');
    setEnd('');
    setQuery('');
  };
  const reservations = allReservations.filter(
    (item) =>
      item.collectionId === collectionId &&
      item.type === type &&
      (!filterStylist || item.stylist === filterStylist) &&
      (!filterResponsible || item.responsible === filterResponsible) &&
      (!start || item.createdAt >= start) &&
      (!end || item.createdAt <= end) &&
      `${item.materialName} ${item.color} ${item.notes}`.toLowerCase().includes(query.toLowerCase())
  );
  const stylists = [
    ...new Set(
      [
        ...pieces.map((item) => item.estilista),
        ...allReservations.map((item) => item.stylist),
      ].filter(Boolean)
    ),
  ];
  const responsibles = [
    ...new Set(allReservations.map((item) => item.responsible).filter(Boolean)),
  ];
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!material) return;
    setAllReservations((previous) => [
      {
        id: uuid(),
        collectionId,
        type,
        materialId: material.id,
        materialName: material.nome,
        color,
        reserved,
        used,
        completed,
        notes,
        stylist,
        responsible,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...previous,
    ]);
    setOpen(false);
    setMaterial(null);
    setColor('');
    setReserved('');
    setUsed('');
    setCompleted('');
    setNotes('');
    setStylist('');
    setResponsible('');
  };
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <SectionHeader
          title={`Reservas de material · ${title}`}
          description="Quantidades e responsáveis pelas reservas da coleção."
          action={
            <Button variant="primary" onClick={() => setPicker(true)}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Reserva
            </Button>
          }
        />
        {hasReservations && (
          <details className="rounded-control border border-border bg-surface-muted/40 p-3">
            <summary className="cursor-pointer text-sm font-medium">
              Filtros de reservas{' '}
              <span className="ml-2 rounded-full bg-surface px-2 py-1 text-xs text-muted">
                {activeFilters ? `${activeFilters} ativos` : 'Nenhum ativo'}
              </span>
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-xs">
                Estilistas
                <select
                  className={`${field} mt-1`}
                  value={filterStylist}
                  onChange={(e) => setFilterStylist(e.target.value)}
                >
                  <option value="">Todos</option>
                  {stylists.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                Responsável pela reserva
                <select
                  className={`${field} mt-1`}
                  value={filterResponsible}
                  onChange={(e) => setFilterResponsible(e.target.value)}
                >
                  <option value="">Todos</option>
                  {responsibles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                Cadastro: início
                <input
                  type="date"
                  className={`${field} mt-1`}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label className="text-xs">
                Cadastro: fim
                <input
                  type="date"
                  className={`${field} mt-1`}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
              <label className="text-xs">
                Busca
                <input
                  className={`${field} mt-1`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar reserva"
                />
              </label>
            </div>
            {activeFilters > 0 && (
              <Button className="mt-3" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </details>
        )}

        {reservations.length === 0 ? (
          <EmptyState
            title="Nenhuma reserva encontrada."
            description={
              hasReservations
                ? 'Ajuste os filtros para encontrar outras reservas.'
                : `Selecione um ${type === 'TECIDO' ? 'tecido' : 'aviamento'} para começar a planejar o material.`
            }
            action={
              hasReservations ? (
                <Button onClick={clearFilters}>Limpar filtros</Button>
              ) : (
                <Button onClick={() => setPicker(true)}>Criar primeira reserva</Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {reservations.map((item) => (
              <CollectionReservationCard
                key={item.id}
                reservation={item}
                material={[
                  ...selectedMaterials,
                  ...localMaterials.filter((entry) => entry.type === type),
                ].find((entry) => entry.id === item.materialId)}
                expanded={expanded === item.id}
                onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              />
            ))}
          </div>
        )}
      </Card>
      {open && !picker && (
        <Modal
          title={`Criar reserva de ${type === 'TECIDO' ? 'tecido' : 'aviamento'}`}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={save}>
            <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr]">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <span>
                    {material
                      ? `${material.nome} · ${material.codigo}`
                      : `Nenhum ${type === 'TECIDO' ? 'tecido' : 'aviamento'} selecionado`}
                  </span>
                  <button type="button" className={secondary} onClick={() => setPicker(true)}>
                    Selecionar
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs">
                    Cor
                    <select
                      className={`${field} mt-1`}
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {material?.coresList?.map((entry) => (
                        <option key={entry.id} value={entry.nome}>
                          {entry.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">
                    Estilista
                    <input
                      className={`${field} mt-1`}
                      list="reservation-stylists"
                      value={stylist}
                      onChange={(e) => setStylist(e.target.value)}
                    />
                    <datalist id="reservation-stylists">
                      {stylists.map((item) => (
                        <option key={item} value={item} />
                      ))}
                    </datalist>
                  </label>
                  <label className="text-xs">
                    Reservado{' '}
                    <span aria-hidden="true" className="text-muted">
                      ({unit})
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={`${field} mt-1`}
                      value={reserved}
                      onChange={(e) => setReserved(e.target.value)}
                      required
                    />
                  </label>
                  <label className="text-xs">
                    Utilizado{' '}
                    <span aria-hidden="true" className="text-muted">
                      ({unit})
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={`${field} mt-1`}
                      value={used}
                      onChange={(e) => setUsed(e.target.value)}
                    />
                  </label>
                  <label className="text-xs">
                    Completos{' '}
                    <span aria-hidden="true" className="text-muted">
                      (unidade não definida)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className={`${field} mt-1`}
                      value={completed}
                      onChange={(e) => setCompleted(e.target.value)}
                    />
                  </label>
                  <label className="text-xs">
                    Responsável pela reserva
                    <input
                      className={`${field} mt-1`}
                      value={responsible}
                      onChange={(e) => setResponsible(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <label className="block text-xs">
                  Observações
                  <textarea
                    className={`${field} mt-1`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
                <p className="text-xs text-muted">
                  “Completos” mantém o valor do cadastro atual. A unidade desse campo ainda não foi
                  definida.
                </p>
              </div>
              <aside className="self-start rounded-card border border-border bg-surface-muted p-5 md:sticky md:top-0">
                <h4 className="mb-4 font-editorial text-lg font-semibold">Resumo da reserva</h4>
                <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-control border border-border bg-surface">
                  {material?.imagemUrl ? (
                    <img
                      src={material.imagemUrl}
                      alt={material.nome}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImagePlus aria-hidden="true" className="h-9 w-9 text-muted" />
                  )}
                </div>
                <strong className="block break-words text-lg">
                  {material?.nome || 'Escolha o material'}
                </strong>
                <p className="mt-1 text-xs text-muted">
                  {material?.codigo || 'Código a definir'} · {color || 'Cor a definir'}
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  {[
                    ['Reservado', reserved, unit],
                    ['Utilizado', used, unit],
                    ['Completos', completed, 'unidade não definida'],
                  ].map(([label, value, suffix]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted">{label}</dt>
                      <dd className="mt-1 font-medium">
                        {value || '—'}{' '}
                        <span className="text-xs font-normal text-muted">{suffix}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 text-xs text-muted">
                  Responsável: {responsible || 'A definir'}
                  <br />
                  Estilista: {stylist || 'A definir'}
                </p>
              </aside>
            </div>
            <div className={collectionFooter}>
              <button type="button" className={secondary} onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className={button} disabled={!material}>
                Salvar reserva
              </button>
            </div>
          </form>
        </Modal>
      )}
      {picker && (
        <MaterialPicker
          type={type}
          onClose={() => setPicker(false)}
          onSelect={(item) => {
            setSelectedMaterials((previous) => [
              ...previous.filter((entry) => entry.id !== item.id),
              item,
            ]);
            setMaterial(item);
            setColor('');
            setPicker(false);
            setOpen(true);
          }}
        />
      )}
    </div>
  );
}
