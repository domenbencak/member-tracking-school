import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function collapseWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function nullableText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = collapseWhitespace(String(value));
  return normalized === "" ? null : normalized;
}

export function dateInputValueInSlovenia(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Ljubljana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatSlovenianDate(value: Date | string | null | undefined) {
  if (!value) return "Ni podatka";
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("sl-SI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("sl-SI", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Ljubljana",
  }).format(value instanceof Date ? value : new Date(value));
}

export function boolLabel(value: boolean | null) {
  return value === null ? "Ni podatka" : value ? "Da" : "Ne";
}

export function safeReturnPath(value: unknown, fallback = "/") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : fallback;
}
