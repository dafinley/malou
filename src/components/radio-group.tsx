"use client";

import type { SelectorOption } from "@/src/data/training";

export function RadioGroup({
  label,
  value,
  options,
  onChange,
  hint
}: {
  label: string;
  value: string;
  options: SelectorOption[];
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div className="radio-group">
      <span className="radio-group-label">{label}</span>
      <div className="radio-group-options" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              aria-checked={active}
              className="radio-option"
              data-active={active}
              key={option.value}
              onClick={() => onChange(option.value)}
              role="radio"
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {hint ? <small className="radio-group-hint">{hint}</small> : null}
    </div>
  );
}
