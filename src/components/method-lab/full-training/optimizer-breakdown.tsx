"use client";

import { formatBytes, formatCompact } from "@/src/lib/format";

type Seg = { label: string; bytesPerParam: number; color: string; note: string };

const SEGMENTS: Seg[] = [
  { label: "weights", bytesPerParam: 2, color: "var(--cyan)", note: "bf16" },
  { label: "gradients", bytesPerParam: 2, color: "var(--red)", note: "bf16" },
  { label: "Adam m + v", bytesPerParam: 8, color: "var(--amber)", note: "fp32 state" },
  { label: "fp32 master", bytesPerParam: 4, color: "var(--violet)", note: "mixed precision" }
];

export function OptimizerBreakdown({ modelParamsB }: { modelParamsB: number }) {
  const W = 720;
  const H = 200;
  const pad = 24;
  const N = modelParamsB * 1e9;
  const totalBytesPerParam = SEGMENTS.reduce((s, seg) => s + seg.bytesPerParam, 0);
  const totalBytes = N * totalBytesPerParam;

  const positions: Array<{ seg: Seg; x: number; w: number }> = [];
  const barW = W - pad * 2 - 200;
  let cursor = pad;
  for (const seg of SEGMENTS) {
    const w = (seg.bytesPerParam / totalBytesPerParam) * barW;
    positions.push({ seg, x: cursor, w });
    cursor += w;
  }

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={20} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        what {totalBytesPerParam} bytes / param actually pay for · mixed precision Adam
      </text>

      {/* Stacked bar */}
      {positions.map(({ seg, x, w }, i) => (
        <g key={i}>
          <rect fill={seg.color} height={42} opacity={0.55} width={w} x={x} y={48} />
          <rect
            fill="none"
            height={42}
            stroke={seg.color}
            strokeWidth={0.8}
            width={w}
            x={x}
            y={48}
          />
          <text
            fill="var(--text)"
            fontFamily="var(--font-mono)"
            fontSize={11}
            fontWeight={600}
            textAnchor="middle"
            x={x + w / 2}
            y={74}
          >
            {seg.bytesPerParam} B
          </text>
        </g>
      ))}
      <text
        fill="var(--text)"
        fontFamily="var(--font-mono)"
        fontSize={11.5}
        fontWeight={600}
        x={pad + barW + 12}
        y={62}
      >
        = {totalBytesPerParam} B / param
      </text>
      <text
        fill="var(--dim)"
        fontFamily="var(--font-mono)"
        fontSize={10}
        x={pad + barW + 12}
        y={78}
      >
        × {formatCompact(N)} params
      </text>
      <text
        fill="var(--text)"
        fontFamily="var(--font-mono)"
        fontSize={11.5}
        fontWeight={600}
        x={pad + barW + 12}
        y={94}
      >
        = {formatBytes(totalBytes)}
      </text>

      {/* Legend grid */}
      <g transform={`translate(${pad}, 120)`}>
        {SEGMENTS.map((seg, i) => (
          <g key={i} transform={`translate(${(i % 4) * 170}, 0)`}>
            <rect fill={seg.color} height={10} opacity={0.6} rx={2} width={10} x={0} y={0} />
            <text fill="var(--text)" fontFamily="var(--font-mono)" fontSize={10.5} x={16} y={9}>
              {seg.label}
            </text>
            <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={9.5} x={16} y={22}>
              {seg.note}
            </text>
          </g>
        ))}
      </g>

      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10.5} x={pad} y={H - 12}>
        gradient checkpointing + ZeRO can cut this further — at the cost of recompute or comms
      </text>
    </svg>
  );
}
