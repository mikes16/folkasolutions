const COLOR_KEYWORDS: [string, string][] = [
  ["negro", "#1a1a1a"],
  ["black", "#1a1a1a"],
  ["blanco", "#ffffff"],
  ["white", "#ffffff"],
  ["bronce", "#8B6914"],
  ["oro rosa", "#B76E79"],
  ["oro", "#C5A135"],
  ["gold", "#C5A135"],
  ["plata", "#A8A9AD"],
  ["plateado", "#C0C0C0"],
  ["chrome", "#C0C0C0"],
  ["inox", "#B0B0B0"],
  ["acero", "#8D8D8D"],
  ["gris piedra", "#8A8A7B"],
  ["gris", "#808080"],
  ["rojo", "#C0392B"],
  ["azul marino", "#1B2A4A"],
  ["azul nebuloso", "#5B7FA5"],
  ["azul", "#2E6DB4"],
  ["índigo", "#3F51B5"],
  ["verde humo", "#6B7F5E"],
  ["verde lima", "#8DC53E"],
  ["verde cargo", "#5C6B4E"],
  ["verde", "#2D7D46"],
  ["esmeralda", "#1F8A5C"],
  ["salvia", "#9CAF88"],
  ["café", "#6F4E37"],
  ["walnut", "#5C4033"],
  ["maple", "#C19A6B"],
  ["nogal", "#5C4033"],
  ["beige", "#D5C4A1"],
  ["perla", "#EAE0C8"],
  ["amarillo", "#F1C40F"],
  ["canario", "#FFEF00"],
  ["naranja", "#E67E22"],
  ["rosa", "#E091A3"],
  ["ruibarbo", "#8B2252"],
  ["púrpura", "#7B2D8B"],
  ["pervinca", "#9C8FCA"],
  ["loto", "#E8B4CB"],
  ["ocean", "#1A6B7C"],
  ["cian", "#00BCD4"],
  ["ámbar", "#D4920B"],
  ["unicornio", "conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff, #ff6b6b)"],
  ["multicolor", "conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff, #ff6b6b)"],
  ["clear galaxy", "conic-gradient(from 0deg, #2c1654, #4a1942, #1a1a2e, #16213e, #2c1654)"],
];

export function getSwatchColor(value: string): string | null {
  const lower = value.toLowerCase();
  for (const [keyword, color] of COLOR_KEYWORDS) {
    if (lower.includes(keyword)) return color;
  }
  return null;
}

export function isColorOption(optionName: string): boolean {
  return optionName.toLowerCase() === "color";
}
