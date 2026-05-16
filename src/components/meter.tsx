export function Meter({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="meter">
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <div>
        <i style={{ width: `${Math.max(Math.min(value, 100), 3)}%` }} />
      </div>
    </div>
  );
}
