import type { ProEnumItem } from "./pro-enum";

export const BUILTIN_COLOR = {
  success: "green",
  processing: "blue",
  error: "red",
  warning: "gold",
  normal: "#f1f1f1",
  magenta: "magenta",
  green: "green",
  cyan: "cyan",
  dodgerblue: "dodgerblue",
  purple: "purple",
  red: "red",
  orange: "orange",
  lime: "lime",
  blue: "blue",
  volcano: "volcano",
  gold: "gold",
} as const;

export const fillColors = (options: ProEnumItem[]) => {
  let acc = 0;
  const withColors = options.map((item) => {
    if (item.color) {
      const color =
        BUILTIN_COLOR[item.color as keyof typeof BUILTIN_COLOR] ?? item.color;
      item.color = color;
    } else {
      const keys = Object.keys(BUILTIN_COLOR);
      acc++;
      const idx = acc % keys.length;
      const colorKey = keys[idx] as keyof typeof BUILTIN_COLOR;
      item.color = BUILTIN_COLOR[colorKey];
    }
    return item;
  });
  return withColors;
};
