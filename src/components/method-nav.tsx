"use client";

import { useRef } from "react";
import { methods, type MethodKey } from "@/src/data/training";

export function MethodNav({
  active,
  onChange
}: {
  active: MethodKey;
  onChange: (key: MethodKey) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = methods[(index + direction + methods.length) % methods.length];
    onChange(next.key);

    const button = containerRef.current?.querySelector<HTMLButtonElement>(
      `[data-method="${next.key}"]`
    );
    button?.focus();
  }

  return (
    <div aria-label="Training methods" className="method-nav" ref={containerRef} role="group">
      {methods.map((method, index) => {
        const Icon = method.icon;
        const isActive = method.key === active;

        return (
          <button
            aria-pressed={isActive}
            className="method-tab"
            data-active={isActive}
            data-method={method.key}
            key={method.key}
            onClick={() => onChange(method.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            style={{ "--accent": method.accent } as React.CSSProperties}
            type="button"
          >
            <Icon size={18} />
            <span>
              <strong>{method.label}</strong>
              <small>{method.eyebrow}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
