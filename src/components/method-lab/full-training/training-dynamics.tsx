"use client";

// Stylized loss curve: warmup, fast descent, slow tail. Annotates the three
// canonical phases of a pretraining run. Not data — just shape.
export function TrainingDynamics({ datasetTokensB }: { datasetTokensB: number }) {
  const W = 720;
  const H = 220;
  const pad = 44;
  const plotW = W - pad * 2 - 60;
  const plotH = H - 80;
  const baseY = pad + plotH;
  const points = 80;

  const curve: Array<[number, number]> = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    // Loss: high at start, drops fast, asymptotes
    const loss = 0.95 * Math.exp(-3 * t) + 0.05;
    curve.push([pad + t * plotW, baseY - (1 - loss) * plotH * 0.92]);
  }

  const path = "M " + curve.map((p) => p.join(" ")).join(" L ");
  const fillPath = path + ` L ${pad + plotW} ${baseY} L ${pad} ${baseY} Z`;

  // Phase markers
  const phases = [
    { t: 0.05, label: "warmup", color: "var(--amber)" },
    { t: 0.45, label: "fast descent", color: "var(--cyan)" },
    { t: 0.85, label: "long tail", color: "var(--violet)" }
  ];

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={20} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        training dynamics · shape only, not real data
      </text>
      <line stroke="var(--line)" x1={pad} x2={pad + plotW} y1={baseY} y2={baseY} />
      <line stroke="var(--line)" x1={pad} x2={pad} y1={pad} y2={baseY} />
      <text
        fill="var(--dim)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        textAnchor="middle"
        x={pad + plotW / 2}
        y={baseY + 18}
      >
        {datasetTokensB}B tokens of training →
      </text>
      <text
        fill="var(--dim)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        transform={`rotate(-90, ${pad - 24}, ${pad + plotH / 2})`}
        x={pad - 24}
        y={pad + plotH / 2}
      >
        loss ↓
      </text>

      <path d={fillPath} fill="var(--red)" opacity={0.1} />
      <path d={path} fill="none" stroke="var(--red)" strokeWidth={2} />

      {phases.map((phase) => {
        const x = pad + phase.t * plotW;
        return (
          <g key={phase.label}>
            <line stroke={phase.color} strokeDasharray="3 3" x1={x} x2={x} y1={pad} y2={baseY} />
            <text
              fill={phase.color}
              fontFamily="var(--font-mono)"
              fontSize={10}
              textAnchor="middle"
              x={x}
              y={pad - 4}
            >
              {phase.label}
            </text>
          </g>
        );
      })}

      <g transform={`translate(${W - 60}, ${pad + 8})`}>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={9.5}>
          eval
        </text>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={9.5} y={14}>
          checkpoint
        </text>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={9.5} y={28}>
          rinse
        </text>
      </g>

      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10.5} x={pad} y={H - 10}>
        the tail is where most production runs live — diminishing loss per token, but downstream
        evals still climb
      </text>
    </svg>
  );
}
