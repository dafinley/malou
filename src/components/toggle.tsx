"use client";

export function Toggle({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="toggle-control">
      <button
        aria-pressed={value}
        className="toggle-button"
        data-active={value}
        onClick={() => onChange(!value)}
        type="button"
      >
        <span className="toggle-thumb" />
      </button>
      <div className="toggle-text">
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </div>
    </div>
  );
}
