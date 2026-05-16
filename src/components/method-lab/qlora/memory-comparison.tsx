"use client";

import { adapterParams, blockScaleBytes, layersForParams } from "@/src/lib/derive-stats";
import { formatBytes, formatCompact } from "@/src/lib/format";

export type QLoraMemoryProps = {
  params: number;
  bits: number;
  blockSize: number;
  doubleQuant: boolean;
  rank: number;
  sequenceLength: number;
  batchSize: number;
  showCompare: boolean;
};

type Seg = { label: string; value: number; color: string };

function computeStacks(p: QLoraMemoryProps) {
  const isQuantized = p.bits < 16;
  const layers = layersForParams(p.params);
  const adapter = adapterParams(p.params, p.rank);

  const baseQ = (p.params * p.bits) / 8;
  const scales = isQuantized ? blockScaleBytes(p.params, p.blockSize, p.doubleQuant) : 0;
  const baseFull16 = p.params * 2;
  const loraBytes = adapter * 2;
  const loraOpt = adapter * 10;
  const fullOpt = p.params * 10;
  const acts = p.params * 0.05;

  const qloraSegs: Seg[] = [
    {
      label:
        p.bits === 4
          ? "base · nf4"
          : p.bits === 8
            ? "base · int8"
            : p.bits === 16
              ? "base · bf16"
              : `base · ${p.bits}-bit`,
      value: baseQ,
      color: "var(--violet)"
    },
    ...(scales > 0
      ? [
          {
            label: p.doubleQuant ? "quant scales (dq)" : "quant scales (fp32)",
            value: scales,
            color: "var(--pink)"
          }
        ]
      : []),
    { label: "LoRA adapters", value: loraBytes, color: "var(--cyan)" },
    { label: "optimizer (paged)", value: loraOpt, color: "var(--amber)" },
    { label: "activations", value: acts, color: "var(--green)" }
  ];
  const fullSegs: Seg[] = [
    { label: "base · bf16", value: baseFull16, color: "var(--violet)" },
    { label: "optimizer (Adam)", value: fullOpt, color: "var(--amber)" },
    { label: "activations", value: acts, color: "var(--green)" }
  ];
  const totalQ = qloraSegs.reduce((a, b) => a + b.value, 0);
  const totalFull = fullSegs.reduce((a, b) => a + b.value, 0);
  return { qloraSegs, fullSegs, totalQ, totalFull, layers };
}

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
  segs: Seg[];
  total: number;
  label: string;
  sub: string;
  maxTotal: number;
}) {
  const positions: Array<{ seg: Seg; x: number; w: number }> = [];
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

export function MemoryComparison(props: QLoraMemoryProps) {
  const { qloraSegs, fullSegs, totalQ, totalFull } = computeStacks(props);
  const H = props.showCompare ? 240 : 130;
  const maxTotal = Math.max(totalQ, totalFull);

  return (
    <div className="qlora-memory">
      <svg className="qlora-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
        <MemoryBar
          y={20}
          segs={qloraSegs}
          total={totalQ}
          label="QLoRA training"
          sub={`${formatCompact(props.params)} params · ${props.bits}-bit`}
          maxTotal={maxTotal}
        />
        {props.showCompare ? (
          <>
            <MemoryBar
              y={120}
              segs={fullSegs}
              total={totalFull}
              label="full fine-tune (bf16)"
              sub={`${formatCompact(props.params)} params · 16-bit`}
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
              {(totalFull / totalQ).toFixed(1)}× less memory · saves{" "}
              {formatBytes(totalFull - totalQ)}
            </text>
          </>
        ) : null}
      </svg>
      <div className="qlora-memory-legend">
        {qloraSegs.map((s) => (
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
