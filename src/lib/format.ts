import type { ControlConfig } from "@/src/data/training";

export function formatCompact(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return Math.round(n).toString();
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.max(bytes, 0).toFixed(0)} B`;
}

export function formatControlValue(value: number, control: ControlConfig): string {
  if (control.format === "percent") return `${Math.round(value * 100)}%`;
  if (control.format === "oneDecimal") return value.toFixed(1);
  if (control.format === "decimal") return value.toFixed(2);
  return Math.round(value).toLocaleString();
}
