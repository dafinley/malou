"use client";

import { formatBytes, formatCompact } from "@/src/lib/format";

const LEVELS = [
  { bits: 32, name: "fp32", color: "var(--dim)", label: "pretrain default" },
  { bits: 16, name: "fp16 / bf16", color: "var(--cyan)", label: "mixed precision" },
  { bits: 8, name: "int8", color: "var(--amber)", label: "LLM.int8()" },
  { bits: 4, name: "nf4", color: "var(--violet)", label: "QLoRA storage" }
];

export function PrecisionLadder({ bits, params }: { bits: number; params: number }) {
  const W = 720;
  const rowH = 32;
  const gap = 6;
  const labelCol = 130;
  const memCol = 130;
  const barCol = W - 40 - labelCol - memCol - 20;

  return (
    <svg className="qlora-viz" role="img" viewBox={`0 0 ${W} 200`}>
      <text x={20} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        memory to store {formatCompact(params)} weights at each precision
      </text>
      {LEVELS.map((lv, i) => {
        const y = 38 + i * (rowH + gap);
        const memBytes = (params * lv.bits) / 8;
        const width = (lv.bits / 32) * barCol;
        const active = lv.bits === bits;
        return (
          <g key={lv.bits}>
            <text
              fill={active ? lv.color : "var(--muted)"}
              fontFamily="var(--font-mono)"
              fontSize={12}
              fontWeight={active ? 600 : 400}
              x={20}
              y={y + rowH / 2 + 4}
            >
              {lv.name}
            </text>
            <text
              fill="var(--dim)"
              fontFamily="var(--font-mono)"
              fontSize={10}
              x={20 + 86}
              y={y + rowH / 2 + 4}
            >
              {lv.bits} bit
            </text>
            <rect
              fill="var(--surface-2)"
              height={rowH}
              rx={3}
              stroke="var(--line)"
              width={barCol}
              x={20 + labelCol}
              y={y}
            />
            <rect
              fill={lv.color}
              height={rowH}
              opacity={active ? 0.55 : 0.22}
              width={width}
              x={20 + labelCol}
              y={y}
            />
            {active ? (
              <rect
                fill="none"
                height={rowH}
                rx={3}
                stroke={lv.color}
                strokeWidth={1.5}
                width={width}
                x={20 + labelCol}
                y={y}
              />
            ) : null}
            <text
              fill={active ? "var(--text)" : "var(--muted)"}
              fontFamily="var(--font-mono)"
              fontSize={12}
              fontWeight={active ? 600 : 400}
              x={20 + labelCol + barCol + 14}
              y={y + rowH / 2 - 2}
            >
              {formatBytes(memBytes)}
            </text>
            <text
              fill="var(--dim)"
              fontFamily="var(--font-mono)"
              fontSize={9.5}
              x={20 + labelCol + barCol + 14}
              y={y + rowH / 2 + 12}
            >
              {lv.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
