"use client";

import { useCallback, useEffect, useState } from "react";
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

export type StatePatch = {
  method?: MethodKey;
  architecture?: ArchitectureKey;
  values?: Partial<Record<ControlKey, number>>;
  toggles?: Partial<Record<ToggleKey, boolean>>;
  selectors?: Partial<Record<SelectorKey, string>>;
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
  if (!raw?.trim()) return undefined;
  const result = schema.safeParse(raw);
  return result.success ? result.data : undefined;
}

export function parseTrainingParams(params: URLSearchParams): StatePatch {
  const out: StatePatch = {};
  const method = parseParam(methodSchema, params.get("method"));
  if (method) out.method = method;
  const architecture = parseParam(architectureSchema, params.get("arch"));
  if (architecture) out.architecture = architecture;

  const values: Partial<Record<ControlKey, number>> = {};
  for (const key of Object.keys(defaultValues) as ControlKey[]) {
    const parsed = parseParam(controlSchemas[key], params.get(key));
    if (parsed !== undefined) values[key] = parsed;
  }
  if (Object.keys(values).length > 0) out.values = values;

  const toggles: Partial<Record<ToggleKey, boolean>> = {};
  for (const key of Object.keys(defaultToggles) as ToggleKey[]) {
    const parsed = parseParam(toggleSchema, params.get(key));
    if (parsed !== undefined) toggles[key] = parsed;
  }
  if (Object.keys(toggles).length > 0) out.toggles = toggles;

  const selectors: Partial<Record<SelectorKey, string>> = {};
  for (const key of Object.keys(defaultSelectors) as SelectorKey[]) {
    const parsed = parseParam(selectorSchemas[key], params.get(key));
    if (parsed !== undefined) selectors[key] = parsed;
  }
  if (Object.keys(selectors).length > 0) out.selectors = selectors;

  return out;
}

export function serializeTrainingParams(
  state: SerializedState,
  defaults: SerializedState,
  existingParams?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(existingParams);
  function setParam(key: string, value: string | number | boolean, fallback: typeof value) {
    if (value === fallback) params.delete(key);
    else params.set(key, typeof value === "boolean" ? String(Number(value)) : String(value));
  }

  setParam("method", state.method, defaults.method);
  setParam("arch", state.architecture, defaults.architecture);

  for (const [key, value] of Object.entries(state.values) as Array<[ControlKey, number]>) {
    setParam(key, value, defaults.values[key]);
  }
  for (const [key, value] of Object.entries(state.toggles) as Array<[ToggleKey, boolean]>) {
    setParam(key, value, defaults.toggles[key]);
  }
  for (const [key, value] of Object.entries(state.selectors) as Array<[SelectorKey, string]>) {
    setParam(key, value, defaults.selectors[key]);
  }

  return params;
}

function mergeState(current: SerializedState, patch: StatePatch): SerializedState {
  return {
    method: patch.method ?? current.method,
    architecture: patch.architecture ?? current.architecture,
    values: { ...current.values, ...patch.values },
    toggles: { ...current.toggles, ...patch.toggles },
    selectors: { ...current.selectors, ...patch.selectors }
  };
}

export function useUrlState(defaults: SerializedState) {
  const [state, setState] = useState<SerializedState | null>(null);

  useEffect(() => {
    // The static shell uses defaults until the client can read the URL.
    const patch = parseTrainingParams(new URLSearchParams(window.location.search));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((current) => current ?? mergeState(defaults, patch));
  }, [defaults]);

  useEffect(() => {
    if (!state) return;
    const url = new URL(window.location.href);
    const query = serializeTrainingParams(state, defaults, url.searchParams).toString();
    if (query === url.searchParams.toString()) return;
    url.search = query;
    window.history.replaceState(window.history.state, "", url);
  }, [state, defaults]);

  const update = useCallback(
    (patch: StatePatch) => setState((current) => mergeState(current ?? defaults, patch)),
    [defaults]
  );

  return [state ?? defaults, update] as const;
}
