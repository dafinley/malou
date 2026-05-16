"use client";

import { Play, RotateCcw, SlidersHorizontal } from "lucide-react";
import { RadioGroup } from "@/src/components/radio-group";
import { Term } from "@/src/components/term";
import { Toggle } from "@/src/components/toggle";
import type {
  ControlConfig,
  ControlKey,
  Method,
  MethodPreset,
  SelectorKey,
  ToggleKey
} from "@/src/data/training";
import type { Toggles, Values } from "@/src/lib/derive-stats";
import { formatControlValue } from "@/src/lib/format";

export function ControlPanel({
  method,
  values,
  toggles,
  selectors,
  setValue,
  setToggle,
  setSelector,
  applyPreset,
  resetAll
}: {
  method: Method;
  values: Values;
  toggles: Toggles;
  selectors: Record<SelectorKey, string>;
  setValue: (key: ControlKey, value: number) => void;
  setToggle: (key: ToggleKey, value: boolean) => void;
  setSelector: (key: SelectorKey, value: string) => void;
  applyPreset: (preset: MethodPreset) => void;
  resetAll: () => void;
}) {
  return (
    <aside className="control-panel" aria-label={`${method.label} controls`}>
      <div className="panel-title">
        <SlidersHorizontal size={17} />
        <span>Controls</span>
      </div>

      <div className="control-list">
        {method.controls.map((control) => (
          <SliderControl
            control={control}
            key={control.key}
            setValue={setValue}
            value={values[control.key]}
          />
        ))}
      </div>

      {method.toggles && method.toggles.length > 0 ? (
        <div className="control-toggles">
          {method.toggles.map((t) => (
            <Toggle
              hint={t.hint}
              key={t.key}
              label={t.label}
              onChange={(v) => setToggle(t.key, v)}
              value={toggles[t.key]}
            />
          ))}
        </div>
      ) : null}

      {method.selectors && method.selectors.length > 0 ? (
        <div className="control-selectors">
          {method.selectors.map((s) => (
            <RadioGroup
              hint={s.hint ? s.hint(selectors[s.key]) : undefined}
              key={s.key}
              label={s.label}
              onChange={(v) => setSelector(s.key, v)}
              options={s.options}
              value={selectors[s.key]}
            />
          ))}
        </div>
      ) : null}

      {method.presets && method.presets.length > 0 ? (
        <div className="control-presets">
          <p className="control-presets-label">Presets</p>
          <div className="control-presets-grid">
            {method.presets.map((preset) => (
              <button
                className="preset-button"
                key={preset.name}
                onClick={() => applyPreset(preset)}
                title={preset.description}
                type="button"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="control-actions">
        <button
          className="secondary-button"
          onClick={() => {
            if (method.presets && method.presets.length > 0) applyPreset(method.presets[0]);
          }}
          type="button"
        >
          <Play size={16} />
          <span>Load default preset</span>
        </button>
        <button className="secondary-button" onClick={resetAll} type="button">
          <RotateCcw size={15} />
          <span>Reset all</span>
        </button>
      </div>
    </aside>
  );
}

function SliderControl({
  control,
  value,
  setValue
}: {
  control: ControlConfig;
  value: number;
  setValue: (key: ControlKey, value: number) => void;
}) {
  const percent = ((value - control.min) / (control.max - control.min)) * 100;
  const inputId = `control-${control.key}`;

  return (
    <div className="slider-control">
      <label className="slider-label" htmlFor={inputId}>
        <span>{control.term ? <Term id={control.term}>{control.label}</Term> : control.label}</span>
        <strong>
          {formatControlValue(value, control)}
          {control.unit ? <small>{control.unit}</small> : null}
        </strong>
      </label>
      <span className="slider-track" style={{ "--pct": `${percent}%` } as React.CSSProperties}>
        <input
          aria-label={`${control.label}${control.unit ? `, ${control.unit}` : ""}`}
          id={inputId}
          max={control.max}
          min={control.min}
          onChange={(event) => setValue(control.key, Number(event.target.value))}
          step={control.step}
          type="range"
          value={value}
        />
      </span>
    </div>
  );
}
