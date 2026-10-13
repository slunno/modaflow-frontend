import { useState } from 'react';
import type { PointerEvent } from 'react';
import { hexToHsv, hsvToHex } from './colorUtils';

export function ColorToneEditor({
  hex,
  onChange,
  showRgb = false,
  showHex = true,
}: {
  hex: string;
  onChange: (hex: string) => void;
  showRgb?: boolean;
  showHex?: boolean;
}) {
  const [previousHex, setPreviousHex] = useState(hex);
  const [hsv, setHsv] = useState(() => hexToHsv(hex));
  if (previousHex !== hex) {
    setPreviousHex(hex);
    setHsv(hexToHsv(hex));
  }
  const update = (next: typeof hsv) => {
    const value = hsvToHex(next.h, next.s, next.v);
    setHsv(next);
    setPreviousHex(value);
    onChange(value);
  };
  const pointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    update({
      ...hsv,
      s: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      v: Math.max(0, Math.min(100, (1 - (event.clientY - rect.top) / rect.height) * 100)),
    });
  };
  const validHex = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#456286';
  const rgb = [1, 3, 5].map((index) => Number.parseInt(validHex.slice(index, index + 2), 16));
  return (
    <div className="space-y-2">
      <div
        role="slider"
        tabIndex={0}
        aria-label="Saturação e brilho"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s)}
        aria-valuetext={`${Math.round(hsv.s)}% saturação, ${Math.round(hsv.v)}% brilho`}
        className="relative h-32 w-full touch-none cursor-crosshair overflow-hidden rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent-camel"
        style={{ backgroundColor: hsvToHex(hsv.h, 100, 100) }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) pointer(event);
        }}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 10 : 1;
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            update({
              ...hsv,
              s: Math.max(
                0,
                Math.min(
                  100,
                  hsv.s +
                    (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0)
                )
              ),
              v: Math.max(
                0,
                Math.min(
                  100,
                  hsv.v + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0)
                )
              ),
            });
          }
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to right, #fff, transparent)' }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to top, #000, transparent)' }}
        />
        <span
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
        />
      </div>
      <label className="block">
        <span className="sr-only">Matiz</span>
        <input
          type="range"
          min="0"
          max="359"
          value={hsv.h % 360}
          onChange={(event) => update({ ...hsv, h: Number(event.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-transparent"
          style={{ background: 'linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)' }}
        />
      </label>
      {showHex && (
        <label className="block text-xs text-muted">
          Hex
          <input
            aria-label="Hexadecimal da cor"
            value={hex.replace(/^#/, '')}
            onChange={(event) => onChange('#' + event.target.value.replace(/^#/, ''))}
            className="mt-1 w-full rounded border border-border bg-surface px-2 py-1 text-xs text-primary"
          />
        </label>
      )}
      {showRgb && (
        <div className="grid grid-cols-3 gap-1">
          {['R', 'G', 'B'].map((channel, index) => (
            <label key={channel} className="text-center text-[10px] text-muted">
              {channel}
              <input
                aria-label={`RGB ${channel}`}
                type="number"
                min="0"
                max="255"
                value={rgb[index] ?? 0}
                onChange={(event) => {
                  const channels = rgb.map((value, position) =>
                    position === index
                      ? Math.min(255, Math.max(0, Number(event.target.value)))
                      : value
                  );
                  onChange(
                    '#' + channels.map((value) => value.toString(16).padStart(2, '0')).join('')
                  );
                }}
                className="block w-full rounded border border-border bg-surface px-1 py-1 text-center text-xs text-primary"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
