import type { TecidoCorItem } from '../../../types/gestao';

const approximateColors: Array<[RegExp, string]> = [
  [/\b(AZUL|BLUE|MARINHO)\b/, '#143b72'],
  [/\b(BEGE|BEIGE|AREIA)\b/, '#c8bdab'],
  [/\b(MARROM|BROWN|CAFE)\b/, '#66534b'],
  [/\b(VERDE|GREEN|MUSGO|OLIVA)\b/, '#69745e'],
  [/\b(PRETO|BLACK|GRAFITE)\b/, '#242936'],
  [/\b(BRANCO|WHITE|OFF WHITE)\b/, '#f5f3ed'],
  [/\b(CINZA|GREY|GRAY)\b/, '#a4a5a6'],
  [/\b(AMARELO|YELLOW)\b/, '#d8bb61'],
  [/\b(VERMELHO|RED|BORDO|VINHO)\b/, '#a4454c'],
  [/\b(ROSA|PINK)\b/, '#d99db0'],
  [/\b(LARANJA|ORANGE)\b/, '#d99055'],
  [/\b(ROXO|PURPLE|LILAS)\b/, '#86709d'],
];

export function getMaterialColorAppearance(color: TecidoCorItem) {
  const exact = /^#[0-9a-f]{6}$/i.test(color.hex);
  const normalized = color.nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  const approximate =
    approximateColors.find(([pattern]) => pattern.test(normalized))?.[1] ?? '#edf0f3';
  const contrastColor = exact ? color.hex : approximate;
  const whiteMix = exact
    ? 0
    : /\b(CL|CLARO|LIGHT)\b/.test(normalized)
      ? 0.65
      : /\bSUAVE\b/.test(normalized)
        ? 0.35
        : 0;
  const channels = [1, 3, 5].map((position) =>
    Math.round(
      Number.parseInt(contrastColor.slice(position, position + 2), 16) * (1 - whiteMix) +
        255 * whiteMix
    )
  );
  const background =
    '#' + channels.map((channel) => channel.toString(16).padStart(2, '0')).join('');
  const luminance =
    ((channels[0] ?? 0) * 299 + (channels[1] ?? 0) * 587 + (channels[2] ?? 0) * 114) / 1000;
  return { background, foreground: luminance < 155 ? '#ffffff' : '#172033', exact };
}
