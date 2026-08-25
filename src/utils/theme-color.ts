export function hexToRgb(str: string): [number, number, number] {
  const hex = str.replace("#", "");
  const parts = hex.match(/../g);
  const first = parts?.[0];
  const second = parts?.[1];
  const third = parts?.[2];
  if (first === undefined || second === undefined || third === undefined) {
    throw new Error(`invalid hex color: ${str}`);
  }
  return [
    Number.parseInt(first, 16),
    Number.parseInt(second, 16),
    Number.parseInt(third, 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const hexs = [r.toString(16), g.toString(16), b.toString(16)];
  const padded = hexs.map((part) => (part.length === 1 ? `0${part}` : part));
  return `#${padded.join("")}`;
}

export function mixHexColors(fg: string, bg: string, t: number): string {
  const a = hexToRgb(String(fg).replace("#", ""));
  const b = hexToRgb(String(bg).replace("#", ""));
  const out = [0, 1, 2].map((i) => {
    const left = a[i] ?? 0;
    const right = b[i] ?? 0;
    return Math.round(left * (1 - t) + right * t);
  });
  return rgbToHex(out[0] ?? 0, out[1] ?? 0, out[2] ?? 0);
}

export function softenPrimaryForDark(theme: string): string {
  return mixHexColors(theme, "#2d3036", 0.34);
}

export function getLightColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  const next: [number, number, number] = [
    Math.floor((255 - rgb[0]) * level + rgb[0]),
    Math.floor((255 - rgb[1]) * level + rgb[1]),
    Math.floor((255 - rgb[2]) * level + rgb[2]),
  ];
  return rgbToHex(next[0], next[1], next[2]);
}

export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  const next: [number, number, number] = [
    Math.floor(rgb[0] * (1 - level)),
    Math.floor(rgb[1] * (1 - level)),
    Math.floor(rgb[2] * (1 - level)),
  ];
  return rgbToHex(next[0], next[1], next[2]);
}
