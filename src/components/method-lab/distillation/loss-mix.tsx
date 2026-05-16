"use client";

export function LossMix({ alpha, temperature }: { alpha: number; temperature: number }) {
  const W = 720;
  const H = 200;
  const pad = 24;
  const barW = W - pad * 2 - 200;
  const softWeight = alpha;
  const hardWeight = 1 - alpha;
  const softEffective = softWeight * temperature * temperature;
  const total = softEffective + hardWeight;
  const softPct = total > 0 ? softEffective / total : 0;
  const hardPct = total > 0 ? hardWeight / total : 0;
  const softWidth = barW * softPct;
  const hardWidth = barW * hardPct;

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        L = α · T² · KL(student ∥ teacher) + (1 − α) · CE(student, y_true)
      </text>

      <g transform={`translate(${pad}, 42)`}>
        <rect
          fill="var(--violet)"
          height={36}
          opacity={0.25}
          rx={6}
          stroke="var(--violet)"
          width={120}
          x={0}
          y={0}
        />
        <text
          fill="var(--text)"
          fontFamily="Inter, sans-serif"
          fontSize={11.5}
          fontWeight={500}
          textAnchor="middle"
          x={60}
          y={16}
        >
          soft target
        </text>
        <text
          fill="var(--violet)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="middle"
          x={60}
          y={29}
        >
          teacher logits / T
        </text>
      </g>

      <g transform={`translate(${pad}, 122)`}>
        <rect
          fill="var(--amber)"
          height={36}
          opacity={0.25}
          rx={6}
          stroke="var(--amber)"
          width={120}
          x={0}
          y={0}
        />
        <text
          fill="var(--text)"
          fontFamily="Inter, sans-serif"
          fontSize={11.5}
          fontWeight={500}
          textAnchor="middle"
          x={60}
          y={16}
        >
          hard target
        </text>
        <text
          fill="var(--amber)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="middle"
          x={60}
          y={29}
        >
          ground truth y
        </text>
      </g>

      <line
        stroke="var(--violet)"
        strokeWidth={1.2}
        x1={pad + 120}
        x2={pad + 170}
        y1={60}
        y2={100}
      />
      <line
        stroke="var(--amber)"
        strokeWidth={1.2}
        x1={pad + 120}
        x2={pad + 170}
        y1={140}
        y2={100}
      />

      <g transform={`translate(${pad + 170}, 80)`}>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10} x={0} y={-4}>
          effective loss contribution
        </text>
        <rect
          fill="var(--surface-2)"
          height={40}
          rx={3}
          stroke="var(--line)"
          width={barW}
          x={0}
          y={0}
        />
        <rect fill="var(--violet)" height={40} opacity={0.55} width={softWidth} x={0} y={0} />
        <rect
          fill="var(--amber)"
          height={40}
          opacity={0.55}
          width={hardWidth}
          x={softWidth}
          y={0}
        />
        {softPct > 0.08 ? (
          <text
            fill="var(--text)"
            fontFamily="var(--font-mono)"
            fontSize={11}
            fontWeight={600}
            textAnchor="middle"
            x={softWidth / 2}
            y={24}
          >
            {(softPct * 100).toFixed(0)}%
          </text>
        ) : null}
        {hardPct > 0.08 ? (
          <text
            fill="var(--text)"
            fontFamily="var(--font-mono)"
            fontSize={11}
            fontWeight={600}
            textAnchor="middle"
            x={softWidth + hardWidth / 2}
            y={24}
          >
            {(hardPct * 100).toFixed(0)}%
          </text>
        ) : null}
        <text x={0} y={58} fill="var(--violet)" fontFamily="var(--font-mono)" fontSize={10}>
          α · T² = {alpha.toFixed(2)} × {(temperature * temperature).toFixed(1)} ={" "}
          {(alpha * temperature * temperature).toFixed(2)}
        </text>
        <text
          fill="var(--amber)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="end"
          x={barW}
          y={58}
        >
          (1 − α) = {(1 - alpha).toFixed(2)}
        </text>
      </g>
    </svg>
  );
}
