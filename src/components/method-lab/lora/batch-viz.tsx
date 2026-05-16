"use client";

import { formatCompact } from "@/src/lib/format";

export function BatchViz({ batch, sequenceLength }: { batch: number; sequenceLength: number }) {
  const W = 720;
  const H = 200;
  const pad = 16;
  const innerW = W - pad * 2 - 80;
  const maxRows = 16;
  const visibleBatch = Math.min(batch, maxRows);
  const rowH = Math.min(18, (H - 60) / visibleBatch);
  const gap = 2;
  const totalTokens = batch * sequenceLength;
  const cellsToShow = Math.min(sequenceLength, 64);
  const cellW = innerW / cellsToShow;

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={16} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        batch · {batch} sequence{batch === 1 ? "" : "s"} processed in parallel
      </text>
      <g transform={`translate(${pad + 18}, 32)`}>
        {Array.from({ length: visibleBatch }).map((_, b) => (
          <g key={b} transform={`translate(0, ${b * (rowH + gap)})`}>
            <rect
              fill="var(--surface-2)"
              height={rowH}
              rx={2}
              stroke="var(--line)"
              width={innerW}
              x={0}
              y={0}
            />
            {Array.from({ length: cellsToShow }).map((_, i) => (
              <rect
                key={i}
                fill="var(--amber)"
                height={rowH - 3}
                opacity={0.18 + (i % 3) * 0.04}
                width={cellW - 1}
                x={i * cellW + 0.5}
                y={1.5}
              />
            ))}
            <text
              fill="var(--dim)"
              fontFamily="var(--font-mono)"
              fontSize={9}
              textAnchor="end"
              x={-6}
              y={rowH / 2 + 3}
            >
              {b}
            </text>
          </g>
        ))}
        {batch > maxRows ? (
          <text
            fill="var(--dim)"
            fontFamily="var(--font-mono)"
            fontSize={10}
            textAnchor="middle"
            x={innerW / 2}
            y={visibleBatch * (rowH + gap) + 14}
          >
            … +{batch - maxRows} more
          </text>
        ) : null}
        <line
          stroke="var(--amber)"
          strokeWidth={1}
          x1={0}
          x2={innerW}
          y1={visibleBatch * (rowH + gap) + 26}
          y2={visibleBatch * (rowH + gap) + 26}
        />
        <text
          fill="var(--amber)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="middle"
          x={innerW / 2}
          y={visibleBatch * (rowH + gap) + 40}
        >
          → sequence length ({sequenceLength.toLocaleString()} tokens)
        </text>
      </g>
      <g transform={`translate(${W - 96}, 36)`}>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10}>
          tokens / step
        </text>
        <text
          fill="var(--amber)"
          fontFamily="var(--font-mono)"
          fontSize={22}
          fontWeight={600}
          y={26}
        >
          {formatCompact(totalTokens)}
        </text>
        <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10} y={44}>
          = {batch} × {sequenceLength.toLocaleString()}
        </text>
      </g>
    </svg>
  );
}
