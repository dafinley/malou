"use client";

export function AlphaGain({ rank, alpha }: { rank: number; alpha: number }) {
  const W = 720;
  const H = 150;
  const scaling = alpha / Math.max(rank, 1);
  const maxScale = 8;
  const pct = Math.min(1, scaling / maxScale);
  const pad = 24;
  const trackW = W - pad * 2 - 140;
  const pointerX = pad + trackW * pct;

  const heuristic =
    scaling < 0.5
      ? "weak update — adapter barely contributes"
      : scaling < 2
        ? "balanced — common starting point (α ≈ r or α = 2r)"
        : scaling < 4
          ? "aggressive — adapter dominates, may overfit"
          : "very aggressive — likely unstable, scale LR down";

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={20} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        effective scaling on adapter output
      </text>
      <rect
        fill="var(--surface-2)"
        height={28}
        rx={4}
        stroke="var(--line)"
        width={trackW}
        x={pad}
        y={48}
      />
      {[0.5, 1, 2, 4, 8].map((v) => {
        const x = pad + trackW * (v / maxScale);
        return (
          <g key={v}>
            <line stroke="var(--line)" x1={x} x2={x} y1={44} y2={80} />
            <text
              fill="var(--dim)"
              fontFamily="var(--font-mono)"
              fontSize={9}
              textAnchor="middle"
              x={x}
              y={96}
            >
              {v}×
            </text>
          </g>
        );
      })}
      <rect fill="var(--violet)" height={28} opacity={0.35} width={trackW * pct} x={pad} y={48} />
      <g transform={`translate(${pointerX}, 32)`}>
        <polygon fill="var(--violet)" points="0,12 -6,0 6,0" />
        <text
          fill="var(--violet)"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fontWeight={600}
          textAnchor="middle"
          y={-4}
        >
          {scaling.toFixed(2)}×
        </text>
      </g>
      <g transform={`translate(${W - 130}, 48)`}>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10}>
          α = {alpha}
        </text>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10} y={14}>
          r = {rank}
        </text>
        <text
          fill="var(--violet)"
          fontFamily="var(--font-mono)"
          fontSize={16}
          fontWeight={600}
          y={32}
        >
          α / r = {scaling.toFixed(2)}
        </text>
      </g>
      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10} x={pad} y={H - 6}>
        {heuristic}
      </text>
    </svg>
  );
}
