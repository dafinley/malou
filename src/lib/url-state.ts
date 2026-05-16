"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  architectures,
  defaultSelectors,
  defaultToggles,
  defaultValues,
  methods,
  type ArchitectureKey,
  type ControlKey,
  type MethodKey,
  type SelectorKey,
  type ToggleKey
} from "@/src/data/training";

export type SerializedState = {
  method: MethodKey;
  architecture: ArchitectureKey;
  values: Record<ControlKey, number>;
  toggles: Record<ToggleKey, boolean>;
  selectors: Record<SelectorKey, string>;
};

const methodKeys = methods.map((m) => m.key) as [MethodKey, ...MethodKey[]];
const architectureKeys = architectures.map((a) => a.key) as [ArchitectureKey, ...ArchitectureKey[]];

const controlBounds = (() => {
  const bounds: Partial<Record<ControlKey, { min: number; max: number }>> = {};
  for (const method of methods) {
    for (const control of method.controls) {
      const existing = bounds[control.key];
      bounds[control.key] = existing
        ? {
            min: Math.min(existing.min, control.min),
            max: Math.max(existing.max, control.max)
          }
        : { min: control.min, max: control.max };
    }
  }
  return bounds as Record<ControlKey, { min: number; max: number }>;
})();

type NumberFromString = z.ZodType<number, unknown>;
type BoolFromString = z.ZodType<boolean, unknown>;
type StringEnum = z.ZodType<string, unknown>;

const controlSchemas = (Object.keys(defaultValues) as ControlKey[]).reduce(
  (acc, key) => {
    const bounds = controlBounds[key];
    // Some keys (e.g. alpha, contextSize, blockSize) may only appear in a subset
    // of methods. Fall back to wide-but-finite bounds for those.
    const min = bounds?.min ?? 0;
    const max = bounds?.max ?? Number.MAX_SAFE_INTEGER;
    acc[key] = z.coerce.number().finite().min(min).max(max);
    return acc;
  },
  {} as Record<ControlKey, NumberFromString>
);

const toggleSchema: BoolFromString = z
  .union([z.literal("1"), z.literal("0"), z.literal("true"), z.literal("false")])
  .transform((v) => v === "1" || v === "true");

const selectorSchemas: Record<SelectorKey, StringEnum> = {
  distillFlavor: z.enum(["logits", "hidden", "attention", "all"]),
  rlAlgorithm: z.enum(["ppo", "dpo", "grpo", "rlaif"])
};

const methodSchema = z.enum(methodKeys);
const architectureSchema = z.enum(architectureKeys);

function parseParam<T>(schema: z.ZodSchema<T>, raw: string | null): T | undefined {
  if (raw === null) return undefined;
  const result = schema.safeParse(raw);
  return result.success ? result.data : undefined;
}

function readFromUrl(): Partial<SerializedState> | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if ([...params.keys()].length === 0) return null;

  const out: Partial<SerializedState> = {};
  const method = parseParam(methodSchema, params.get("method"));
  if (method) out.method = method;
  const architecture = parseParam(architectureSchema, params.get("arch"));
  if (architecture) out.architecture = architecture;

  const values: Partial<Record<ControlKey, number>> = {};
  for (const key of Object.keys(defaultValues) as ControlKey[]) {
    const parsed = parseParam(controlSchemas[key], params.get(key));
    if (parsed !== undefined) values[key] = parsed;
  }
  if (Object.keys(values).length > 0) out.values = values as Record<ControlKey, number>;

  const toggles: Partial<Record<ToggleKey, boolean>> = {};
  for (const key of Object.keys(defaultToggles) as ToggleKey[]) {
    const parsed = parseParam(toggleSchema, params.get(key));
    if (parsed !== undefined) toggles[key] = parsed;
  }
  if (Object.keys(toggles).length > 0) out.toggles = toggles as Record<ToggleKey, boolean>;

  const selectors: Partial<Record<SelectorKey, string>> = {};
  for (const key of Object.keys(defaultSelectors) as SelectorKey[]) {
    const parsed = parseParam(selectorSchemas[key], params.get(key));
    if (parsed !== undefined) selectors[key] = parsed;
  }
  if (Object.keys(selectors).length > 0) out.selectors = selectors as Record<SelectorKey, string>;

  return out;
}

function writeToUrl(state: SerializedState, defaults: SerializedState) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();

  if (state.method !== defaults.method) params.set("method", state.method);
  if (state.architecture !== defaults.architecture) params.set("arch", state.architecture);

  for (const [key, value] of Object.entries(state.values) as Array<[ControlKey, number]>) {
    if (defaults.values[key] !== value) params.set(key, String(value));
  }
  for (const [key, value] of Object.entries(state.toggles) as Array<[ToggleKey, boolean]>) {
    if (defaults.toggles[key] !== value) params.set(key, value ? "1" : "0");
  }
  for (const [key, value] of Object.entries(state.selectors) as Array<[SelectorKey, string]>) {
    if (defaults.selectors[key] !== value) params.set(key, value);
  }

  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", next);
}

export type StatePatch = {
  method?: MethodKey;
  architecture?: ArchitectureKey;
  values?: Partial<Record<ControlKey, number>>;
  toggles?: Partial<Record<ToggleKey, boolean>>;
  selectors?: Partial<Record<SelectorKey, string>>;
};

export function useUrlState(defaults: SerializedState) {
  const [state, setState] = useState<SerializedState>(defaults);
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Hydrate from URL after mount. SSR cannot read window, so we accept the
    // intentional second render to avoid hydration mismatches with the static
    // shell. The react-hooks rule flags this generic pattern, but it is the
    // canonical way to sync from a non-React source like window.location.
    const fromUrl = readFromUrl();
    if (fromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((current) => ({
        method: fromUrl.method ?? current.method,
        architecture: fromUrl.architecture ?? current.architecture,
        values: { ...current.values, ...(fromUrl.values ?? {}) },
        toggles: { ...current.toggles, ...(fromUrl.toggles ?? {}) },
        selectors: { ...current.selectors, ...(fromUrl.selectors ?? {}) }
      }));
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    writeToUrl(state, defaults);
  }, [state, defaults]);

  const update = useCallback((patch: StatePatch) => {
    setState((current) => ({
      method: patch.method ?? current.method,
      architecture: patch.architecture ?? current.architecture,
      values: { ...current.values, ...(patch.values ?? {}) },
      toggles: { ...current.toggles, ...(patch.toggles ?? {}) },
      selectors: { ...current.selectors, ...(patch.selectors ?? {}) }
    }));
  }, []);

  return [state, update] as const;
}
