import { describe, expect, test } from "bun:test";
import { defaultSelectors, defaultToggles, defaultValues, methods } from "@/src/data/training";
import { parseTrainingParams, serializeTrainingParams } from "./url-state";

const defaults = {
  method: "adapter-finetuning",
  architecture: "decoder",
  values: defaultValues,
  toggles: defaultToggles,
  selectors: defaultSelectors
};

describe("shareable presets", () => {
  for (const method of methods) {
    for (const preset of method.presets ?? []) {
      test(`${method.label}: ${preset.name}`, () => {
        const state = {
          ...defaults,
          method: method.key,
          values: { ...defaults.values, ...preset.values },
          toggles: { ...defaults.toggles, ...preset.toggles },
          selectors: { ...defaults.selectors, ...preset.selectors }
        };
        const params = serializeTrainingParams(state, defaults);
        const restored = parseTrainingParams(new URLSearchParams(params.toString()));

        expect(restored.method ?? defaults.method).toBe(state.method);
        expect({ ...defaults.values, ...restored.values }).toEqual(state.values);
        expect({ ...defaults.toggles, ...restored.toggles }).toEqual(state.toggles);
        expect({ ...defaults.selectors, ...restored.selectors }).toEqual(state.selectors);

        for (const { key, min, max, step } of method.controls) {
          const value = state.values[key];
          expect(value).toBeGreaterThanOrEqual(min);
          expect(value).toBeLessThanOrEqual(max);
          const steps = (value - min) / step;
          expect(steps).toBeCloseTo(Math.round(steps), 7);
        }
      });
    }
  }
});

test("serialization keeps unrelated query parameters and removes stale defaults", () => {
  const query = new URLSearchParams("arch=moe&teacherSizeB=bad&ref=docs&ref=lesson");
  expect(serializeTrainingParams(defaults, defaults, query).getAll("ref")).toEqual([
    "docs",
    "lesson"
  ]);
  expect(serializeTrainingParams(defaults, defaults, query).toString()).toBe("ref=docs&ref=lesson");
  expect(parseTrainingParams(query)).toEqual({ architecture: "moe" });
});
