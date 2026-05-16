"use client";

export function ContextViz({
  contextSize,
  sequenceLength
}: {
  contextSize: number;
  sequenceLength: number;
}) {
  const W = 720;
  const H = 120;
  const pad = 16;
  const barH = 48;
  const innerW = W - pad * 2;
  const seqPct = Math.min(sequenceLength / Math.max(contextSize, 1), 1);
  const seqW = innerW * seqPct;
  const cellSize = 8;
  const cellsPerRow = Math.floor(seqW / cellSize);
  const tokenCount = Math.min(sequenceLength, cellsPerRow);

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        context window · {contextSize.toLocaleString()} tokens
      </text>
      <text
        fill="var(--cyan)"
        fontFamily="var(--font-mono)"
        fontSize={11}
        textAnchor="middle"
        x={pad + seqW / 2}
        y={H - 8}
      >
        sequence · {sequenceLength.toLocaleString()}
      </text>
      <rect
        fill="var(--surface-2)"
        height={barH}
        rx={4}
        stroke="var(--line)"
        width={innerW}
        x={pad}
        y={28}
      />
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          stroke="var(--line)"
          strokeDasharray="2 4"
          x1={pad + innerW * t}
          x2={pad + innerW * t}
          y1={28}
          y2={28 + barH}
        />
      ))}
      <rect fill="var(--cyan)" height={barH} opacity={0.18} width={seqW} x={pad} y={28} />
      <rect
        fill="none"
        height={barH}
        stroke="var(--cyan)"
        strokeWidth={1.5}
        width={seqW}
        x={pad}
        y={28}
      />
      <g>
        {Array.from({ length: Math.min(tokenCount, 80) }).map((_, i) => (
          <rect
            key={i}
            fill="var(--cyan)"
            height={cellSize - 2}
            opacity={0.65}
            rx={1}
            width={cellSize - 2}
            x={pad + 3 + i * cellSize}
            y={28 + barH / 2 - cellSize / 2}
          />
        ))}
        {tokenCount > 80 ? (
          <text
            fill="var(--cyan)"
            fontFamily="var(--font-mono)"
            fontSize={10}
            x={pad + 3 + 80 * cellSize + 6}
            y={28 + barH / 2 + 4}
          >
            …+{(sequenceLength - 80).toLocaleString()}
          </text>
        ) : null}
      </g>
      <line stroke="var(--cyan)" strokeWidth={1} x1={pad} x2={pad + seqW} y1={88} y2={88} />
      <line stroke="var(--cyan)" strokeWidth={1} x1={pad} x2={pad} y1={86} y2={90} />
      <line stroke="var(--cyan)" strokeWidth={1} x1={pad + seqW} x2={pad + seqW} y1={86} y2={90} />
      {seqPct < 1 ? (
        <>
          <line
            stroke="var(--dim)"
            strokeDasharray="3 3"
            strokeWidth={1}
            x1={pad + seqW}
            x2={pad + innerW}
            y1={88}
            y2={88}
          />
          <text
            fill="var(--dim)"
            fontFamily="var(--font-mono)"
            fontSize={10.5}
            textAnchor="middle"
            x={pad + seqW + (innerW - seqW) / 2}
            y={H - 8}
          >
            unused capacity · {(contextSize - sequenceLength).toLocaleString()}
          </text>
        </>
      ) : null}
    </svg>
  );
}
