"use client";

export function BlockQuant({
  blockSize,
  doubleQuant
}: {
  blockSize: number;
  doubleQuant: boolean;
}) {
  const W = 720;
  const H = 220;
  const pad = 20;
  const numBlocks = Math.max(2, Math.round(512 / blockSize));
  const blockW = (W - pad * 2 - 40) / numBlocks;
  const weightsPerBlock = Math.max(2, Math.min(16, Math.round(blockSize / 8)));
  const cellW = (blockW - 6) / weightsPerBlock;
  const cellH = 16;
  const fp32Overhead = 32 / blockSize;
  const dqOverhead = 8 / blockSize + 32 / (blockSize * 256);

  return (
    <svg className="qlora-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={16} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        weights split into blocks of {blockSize} · each block carries its own scale factor
      </text>

      <g transform={`translate(${pad + 18}, 36)`}>
        {Array.from({ length: numBlocks }).map((_, b) => (
          <g key={b} transform={`translate(${b * blockW}, 0)`}>
            <rect
              fill="var(--surface-2)"
              height={cellH + 8}
              rx={3}
              stroke="var(--violet)"
              width={blockW - 4}
              x={0}
              y={0}
            />
            {Array.from({ length: weightsPerBlock }).map((_, w) => (
              <rect
                key={w}
                fill="var(--violet)"
                height={cellH}
                opacity={0.25 + ((b + w) % 5) * 0.08}
                width={cellW - 1}
                x={3 + w * cellW}
                y={4}
              />
            ))}
          </g>
        ))}
        <text
          fill="var(--muted)"
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          textAnchor="end"
          x={-6}
          y={cellH / 2 + 6}
        >
          w
        </text>
      </g>

      <g transform={`translate(${pad + 18}, 70)`}>
        {Array.from({ length: numBlocks }).map((_, b) => (
          <line
            key={b}
            opacity={0.5}
            stroke="var(--amber)"
            strokeWidth={0.8}
            x1={(blockW - 4) / 2 + b * blockW}
            x2={(blockW - 4) / 2 + b * blockW}
            y1={0}
            y2={20}
          />
        ))}
      </g>

      <g transform={`translate(${pad + 18}, 96)`}>
        {Array.from({ length: numBlocks }).map((_, b) => (
          <g key={b} transform={`translate(${b * blockW}, 0)`}>
            <rect
              fill="var(--amber)"
              height={20}
              opacity={0.35}
              rx={2}
              stroke="var(--amber)"
              width={blockW - 10}
              x={3}
              y={0}
            />
            <text
              fill="var(--text)"
              fontFamily="var(--font-mono)"
              fontSize={9.5}
              textAnchor="middle"
              x={(blockW - 4) / 2}
              y={14}
            >
              s{b}
            </text>
          </g>
        ))}
        <text
          fill="var(--amber)"
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          textAnchor="end"
          x={-6}
          y={14}
        >
          scales{doubleQuant ? "" : " fp32"}
        </text>
        {!doubleQuant ? (
          <text
            fill="var(--amber)"
            fontFamily="var(--font-mono)"
            fontSize={10}
            x={numBlocks * blockW + 20}
            y={14}
          >
            32-bit each · {fp32Overhead.toFixed(2)} bits/weight overhead
          </text>
        ) : null}
      </g>

      {doubleQuant ? (
        <>
          <g transform={`translate(${W / 2}, 122)`}>
            <line stroke="var(--pink)" strokeWidth={1.2} x1={0} x2={0} y1={0} y2={16} />
            <polygon fill="var(--pink)" points="0,18 -4,12 4,12" />
            <text fill="var(--pink)" fontFamily="var(--font-mono)" fontSize={10} x={10} y={12}>
              quantize the scales
            </text>
          </g>
          <g transform={`translate(${pad + 18}, 146)`}>
            {Array.from({ length: numBlocks }).map((_, b) => (
              <rect
                key={b}
                fill="var(--pink)"
                height={14}
                opacity={0.4}
                rx={2}
                stroke="var(--pink)"
                width={blockW - 16}
                x={b * blockW + 6}
                y={0}
              />
            ))}
            <text
              fill="var(--pink)"
              fontFamily="var(--font-mono)"
              fontSize={9.5}
              textAnchor="end"
              x={-6}
              y={10}
            >
              scales-of-scales
            </text>
            <text
              fill="var(--pink)"
              fontFamily="var(--font-mono)"
              fontSize={10}
              x={numBlocks * blockW + 20}
              y={10}
            >
              ~{dqOverhead.toFixed(3)} bits/weight overhead
            </text>
          </g>
        </>
      ) : null}

      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10.5} x={pad} y={H - 14}>
        dequantize: w ≈ s · w_int
        {doubleQuant ? " · (and s itself is dequantized from a smaller code)" : ""}
      </text>
    </svg>
  );
}
