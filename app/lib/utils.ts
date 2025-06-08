import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDecimal(params: { value: number; decimals: number }) {
  const { value, decimals } = params;

  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
