import type { BadgeProps } from "../adaptor/index";

export type PickArrayItem<T> = T extends (infer P)[] ? P : unknown;

const statusColors = {
  // status
  success: "green",
  processing: "blue",
  error: "red",
  warning: "gold",
  default: "#f1f1f1",
} as const;

export const colors = {
  length: 11,
  0: "magenta",
  1: "green",
  2: "cyan",
  3: "dodgerblue",
  4: "purple",
  5: "red",
  6: "orange",
  7: "lime",
  8: "blue",
  9: "volcano",
  10: "gold",
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
  ...statusColors,
} as const;

export const colorByStatus = (a?: ColorsKey) => (statusColors as any)[a!] ?? a;

export const isColorStatus = (x = ""): x is keyof typeof statusColors => {
  return Boolean((statusColors as any)[x]);
};

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type CSSColor = RGB | RGBA | HEX;

export type ColorsKey<T = typeof colors, K = keyof T> = K extends number
  ? never
  : K extends "length"
    ? never
    : K | CSSColor;
