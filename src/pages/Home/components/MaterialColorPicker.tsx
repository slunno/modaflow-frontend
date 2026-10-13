import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { TecidoCorItem } from '../../../types/gestao';
import { getLinxCoresBasicas } from '../../../services/linxService';
import { usePersistedState } from '../../../hooks/usePersistedState';
import { getMaterialColorAppearance } from './materialColorAppearance';

import { ColorToneEditor } from './ColorToneEditor';

interface Props {
  position: { top: number; left: number };
  onSelect: (color: TecidoCorItem) => void;
  onClose: () => void;
  onCreate?: () => void;
  extraColors?: TecidoCorItem[];
}

export function MaterialColorPicker({
  position,
  onSelect,
  onClose,
  onCreate,
  extraColors = [],
}: Props) {
  const [searchColorQuery, setSearchColorQuery] = useState('');
  const [visibleColorCount, setVisibleColorCount] = useState(10);
  const [selectedHex, setSelectedHex] = useState('#456286');
  const [customColorNome, setCustomColorNome] = useState('');
  const [customColorCodigo, setCustomColorCodigo] = useState('');
  const [coresDbOptions, setCoresDbOptions] = useState<TecidoCorItem[]>([]);
  const [coresStatus, setCoresStatus] = useState('Buscando cores…');
  const [formError, setFormError] = useState('');
  const [localColors, setLocalColors] = usePersistedState<TecidoCorItem[]>('modaflow_colors', []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      getLinxCoresBasicas(searchColorQuery)
        .then((names) => {
          if (!active) return;
          setCoresDbOptions(names.map((name) => ({ id: 'linx-cor-' + name, nome: name, hex: '' })));
          setCoresStatus('');
        })
        .catch(() => {
          if (active) setCoresStatus('Não foi possível consultar as cores do Linx.');
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchColorQuery]);

  const uniqueColors = new Map<string, TecidoCorItem>();
  for (const color of [...extraColors, ...localColors, ...coresDbOptions]) {
    const key = color.nome.trim().toLocaleLowerCase();
    if (!uniqueColors.has(key)) uniqueColors.set(key, color);
  }
  const filteredCoresDb = [...uniqueColors.values()].filter((color) =>
    `${color.nome} ${color.codigo ?? ''}`
      .toLocaleLowerCase()
      .includes(searchColorQuery.toLocaleLowerCase())
  );
  const handleAddPresetCor = (color: TecidoCorItem) => {
    onSelect(color);
    onClose();
  };
  const handleAddCustomCor = () => {
    if (!/^#[0-9a-f]{6}$/i.test(selectedHex)) {
      setFormError('Informe uma cor hexadecimal válida, como #445b80.');
      return;
    }
    const color: TecidoCorItem = {
      id: crypto.randomUUID(),
      nome: customColorNome.trim() || `Cor ${selectedHex}`,
      codigo: customColorCodigo.trim() || undefined,
      hex: selectedHex,
    };
    setLocalColors((previous) => [
      ...previous.filter(
        (item) => item.nome.toLocaleLowerCase() !== color.nome.toLocaleLowerCase()
      ),
      color,
    ]);
    onSelect(color);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 bg-black/25 z-60"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar ou criar cor"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
          if (event.key === 'Tab') {
            const inputs = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>('button, input')
            );
            const first = inputs[0],
              last = inputs[inputs.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            }
            if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
        style={{ top: position.top, left: position.left }}
        className="fixed w-[226px] max-h-[min(370px,calc(100vh-16px))] overflow-y-auto rounded-md border border-border bg-surface p-2 text-primary shadow-2xl"
      >
        {/* 1. BARRA DE PESQUISA */}
        <div className="relative">
          <input
            type="text"
            value={searchColorQuery}
            autoFocus
            onChange={(e) => {
              setSearchColorQuery(e.target.value);
              setCoresStatus('Buscando cores…');
              setCoresDbOptions([]);
              setVisibleColorCount(10);
            }}
            placeholder="Procure pelo nome da cor"
            className="w-full bg-surface border border-accent-camel rounded-lg px-3 py-2 text-xs text-primary focus:ring-2 focus:ring-accent-camel/20 outline-none"
          />
        </div>

        {coresStatus && (
          <p role="status" className="text-xs">
            {coresStatus}
          </p>
        )}
        <p className="text-[9px] text-muted-foreground">Cores do Linx: tonalidades ilustrativas.</p>
        {formError && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {formError}
          </p>
        )}
        {/* 2. LISTA DE CORES DO BANCO DE DADOS */}
        <div className="max-h-32 overflow-y-auto pr-1 scrollbar-thin">
          {filteredCoresDb.length === 0 ? (
            <div className="text-[11px] text-muted-foreground text-center py-2 italic">
              Nenhuma cor pré-cadastrada no banco de dados. Utilize o campo abaixo para adicionar.
            </div>
          ) : (
            <div className="flex flex-wrap content-start gap-1">
              {filteredCoresDb.slice(0, visibleColorCount).map((preset) => {
                const appearance = getMaterialColorAppearance(preset);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleAddPresetCor(preset)}
                    title={`${preset.nome} — tonalidade ilustrativa`}
                    className="inline-flex max-w-full items-center gap-1 rounded px-1.5 py-1 text-left text-[9px] font-bold leading-none transition hover:brightness-90"
                    style={{
                      backgroundColor: appearance.background,
                      color: appearance.foreground,
                    }}
                  >
                    <Plus className="h-2.5 w-2.5 shrink-0" strokeWidth={2} />
                    <span className="truncate uppercase">{preset.nome}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredCoresDb.length > visibleColorCount && (
            <button
              type="button"
              onClick={() => setVisibleColorCount((prev) => prev + 10)}
              className="w-full py-1.5 text-center text-xs font-semibold text-accent-camel hover:text-accent-camel/80 hover:underline cursor-pointer"
            >
              Mostrar mais ({filteredCoresDb.length - visibleColorCount} restantes)
            </button>
          )}
        </div>

        {/* 3. SELETOR DE COR 2D + HUE SLIDER + CAMPOS BRANCOS */}
        <div className="pt-3 border-t border-border space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div
                className="h-6 rounded border border-border"
                style={{
                  backgroundColor: /^#[0-9a-f]{6}$/i.test(selectedHex) ? selectedHex : '#456286',
                }}
              />
              <ColorToneEditor hex={selectedHex} onChange={setSelectedHex} showHex={false} />
            </div>
            <div className="space-y-2">
              <input
                aria-label="Hexadecimal da cor"
                value={selectedHex}
                onChange={(event) => setSelectedHex(event.target.value)}
                className="w-full rounded border border-border bg-surface px-2 py-1 text-xs"
              />
              <input
                aria-label="Nome da cor"
                placeholder="Nome da cor"
                value={customColorNome}
                onChange={(event) => setCustomColorNome(event.target.value)}
                className="w-full rounded border border-border bg-surface px-2 py-1 text-xs"
              />
              <input
                aria-label="Código da cor"
                placeholder="Código da cor"
                value={customColorCodigo}
                onChange={(event) => setCustomColorCodigo(event.target.value)}
                className="w-full rounded border border-border bg-surface px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomCor}
                className="w-full rounded bg-accent-camel py-2 text-xs font-semibold text-on-camel"
              >
                Adicionar
              </button>
            </div>
          </div>
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="w-full rounded border border-border py-2 text-xs font-semibold text-accent-camel"
            >
              Criar uma cor
            </button>
          )}

          {/* BOTÃO FECHAR */}
          <button
            type="button"
            onClick={() => onClose()}
            className="w-full py-2 bg-surface border border-border hover:bg-surface-muted text-primary font-semibold rounded-lg text-xs transition cursor-pointer text-center"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
