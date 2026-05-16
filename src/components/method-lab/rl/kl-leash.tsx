"use client";

export function KlLeash({ klBeta }: { klBeta: number }) {
  const W = 720;
  const H = 200;
  const pad = 30;
  // β → drift radius. Small β = far drift; large β = tight leash.
  // Map β in [0, 1] to radius in [maxR, minR] inversely.
  const maxR = 110;
  const minR = 14;
  const radius = minR + (1 - Math.min(klBeta, 1)) * (maxR - minR);

  const cx = pad + 90;
  const cy = H / 2;
  const policyX = cx + radius * 0.85;
  const policyY = cy - radius * 0.35;

  const verdict =
    klBeta >= 0.3
      ? "very tight — risk of underfitting the reward"
      : klBeta >= 0.1
        ? "balanced — typical RLHF range (β ≈ 0.05–0.2)"
        : klBeta >= 0.02
          ? "loose — policy can drift, watch for reward hacking"
          : "almost no leash — high reward, behavior may collapse";

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={20} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        β controls how far the policy may drift from the reference
      </text>

      {/* Reference + drift radius */}
      <circle cx={cx} cy={cy} fill="none" r={maxR} stroke="var(--line)" strokeDasharray="2 4" />
      <circle
        cx={cx}
        cy={cy}
        fill="var(--green)"
        opacity={0.08}
        r={radius}
        stroke="var(--green)"
        strokeWidth={1.2}
      />
      <circle
        cx={cx}
        cy={cy}
        fill="var(--surface-2)"
        r={14}
        stroke="var(--muted)"
        strokeWidth={1.2}
      />
      <text
        fill="var(--muted)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        textAnchor="middle"
        x={cx}
        y={cy - 22}
      >
        π_ref
      </text>

      {/* Policy point */}
      <line
        stroke="var(--green)"
        strokeDasharray="3 3"
        strokeWidth={1}
        x1={cx}
        x2={policyX}
        y1={cy}
        y2={policyY}
      />
      <circle cx={policyX} cy={policyY} fill="var(--green)" r={8} />
      <text
        fill="var(--green)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        textAnchor="middle"
        x={policyX}
        y={policyY - 14}
      >
        π
      </text>

      <text
        fill="var(--muted)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        textAnchor="middle"
        x={cx}
        y={cy + maxR + 16}
      >
        outer ring = β → 0 · inner ring = tight leash
      </text>

      {/* Readout */}
      <g transform={`translate(${W - 200}, 40)`}>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
          KL penalty
        </text>
        <text
          fill="var(--green)"
          fontFamily="var(--font-mono)"
          fontSize={28}
          fontWeight={600}
          y={32}
        >
          β = {klBeta.toFixed(3)}
        </text>
        <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10} y={54}>
          J = E[R] − β · KL(π ∥ π_ref)
        </text>
        <text fill="var(--text)" fontFamily="Inter, sans-serif" fontSize={12} y={84}>
          {verdict}
        </text>
      </g>

      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10.5} x={pad} y={H - 8}>
        bigger β = closer to π_ref, less reward gain · smaller β = more drift, more reward hacking
        risk
      </text>
    </svg>
  );
}
