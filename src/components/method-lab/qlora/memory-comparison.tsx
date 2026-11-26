"use client";

import type { DerivedStats, Segment } from "@/src/lib/derive-stats";
import { formatBytes, formatCompact } from "@/src/lib/format";

const LABEL_COL = 140;
const PAD = 24;
const W = 720;
const BAR_W = W - PAD * 2 - LABEL_COL - 90;

function MemoryBar({
  y,
  segs,
  total,
  label,
  sub,
  maxTotal
}: {
  y: number;
  segs: Segment[];
  total: number;
  label: string;
  sub: string;
  maxTotal: number;
}) {
  const positions: Array<{ seg: Segment; x: number; w: number }> = [];
  let cursor = PAD + LABEL_COL;
  for (const seg of segs) {
    const w = (seg.value / maxTotal) * BAR_W;
    positions.push({ seg, x: cursor, w });
    cursor += w;
  }
  const endX = cursor;

  return (
    <g>
      <text
        fill="var(--text)"
        fontFamily="Inter, sans-serif"
        fontSize={12}
        fontWeight={500}
        x={PAD}
        y={y + 18}
      >
        {label}
      </text>
      <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10} x={PAD} y={y + 33}>
        {sub}
      </text>
      {positions.map(({ seg, x, w }, i) => (
        <g key={i}>
          <rect fill={seg.color} height={32} opacity={0.45} width={w} x={x} y={y} />
          <rect
            fill="none"
            height={32}
            stroke={seg.color}
            strokeWidth={0.8}
            width={w}
            x={x}
            y={y}
          />
          {w > 38 ? (
            <text
              fill="var(--text)"
              fontFamily="var(--font-mono)"
              fontSize={9.5}
              textAnchor="middle"
              x={x + w / 2}
              y={y + 19}
            >
              {formatBytes(seg.value)}
            </text>
          ) : null}
        </g>
      ))}
      <text
        fill="var(--text)"
        fontFamily="var(--font-mono)"
        fontSize={13}
        fontWeight={600}
        x={endX + 12}
        y={y + 13}
      >
        {formatBytes(total)}
      </text>
      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={9.5} x={endX + 12} y={y + 27}>
        total
      </text>
    </g>
  );
}

export function MemoryComparison({
  bits,
  stats,
  fullStats
}: {
  bits: number;
  stats: DerivedStats;
  fullStats: DerivedStats | null;
}) {
  const H = fullStats ? 240 : 130;
  const total = stats.memoryBytes;
  const maxTotal = Math.max(total, fullStats?.memoryBytes ?? 0);
  const params = formatCompact(stats.modelParams);

  return (
    <div className="qlora-memory">
      <svg className="qlora-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
        <MemoryBar
          y={20}
          segs={stats.stack}
          total={total}
          label="QLoRA training"
          sub={`${params} params · ${bits}-bit`}
          maxTotal={maxTotal}
        />
        {fullStats ? (
          <>
            <MemoryBar
              y={120}
              segs={fullStats.stack}
              total={fullStats.memoryBytes}
              label="full fine-tune (bf16)"
              sub={`${params} params · 16-bit`}
              maxTotal={maxTotal}
            />
            <text
              fill="var(--green)"
              fontFamily="var(--font-mono)"
              fontSize={11.5}
              fontWeight={600}
              x={PAD + LABEL_COL}
              y={H - 12}
            >
              {(fullStats.memoryBytes / total).toFixed(1)}× less memory · saves{" "}
              {formatBytes(fullStats.memoryBytes - total)}
            </text>
          </>
        ) : null}
      </svg>
      <div className="qlora-memory-legend">
        {stats.stack.map((s) => (
          <div key={s.label}>
            <span style={{ background: s.color }} />
            <strong>{s.label}</strong>
            <small>{formatBytes(s.value)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
