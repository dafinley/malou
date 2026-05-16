"use client";

import type { DistillFlavor } from "@/src/data/training";

const W = 720;
const H = 260;
const PAD = 24;
const BLOCKS = 5;
const BLOCK_H = 28;
const BLOCK_GAP = 8;
const STACK_Y = 60;
const STACK_X_T = PAD + 60;
const STACK_X_S = W - PAD - 100 - 60;
const LOGITS_Y = STACK_Y + BLOCKS * (BLOCK_H + BLOCK_GAP) + 18;

function blockCenterY(index: number) {
  return STACK_Y + index * (BLOCK_H + BLOCK_GAP) + BLOCK_H / 2;
}

type Line = { y1: number; y2: number; label: string | null; color: string };

function linesForFlavor(flavor: DistillFlavor): Line[] {
  const result: Line[] = [];
  if (flavor === "logits" || flavor === "all") {
    result.push({
      y1: LOGITS_Y,
      y2: LOGITS_Y,
      label: "KL on output logits",
      color: "var(--violet)"
    });
  }
  if (flavor === "hidden" || flavor === "all") {
    for (const i of [0, 2, 4]) {
      result.push({
        y1: blockCenterY(i),
        y2: blockCenterY(i),
        label: i === 2 ? "MSE on hidden states" : null,
        color: "var(--cyan)"
      });
    }
  }
  if (flavor === "attention" || flavor === "all") {
    for (const i of [1, 3]) {
      result.push({
        y1: blockCenterY(i),
        y2: blockCenterY(i),
        label: i === 3 ? "attention map match" : null,
        color: "var(--amber)"
      });
    }
  }
  return result;
}

function Stack({
  x,
  label,
  color,
  isStudent
}: {
  x: number;
  label: string;
  color: string;
  isStudent?: boolean;
}) {
  return (
    <g>
      <text
        fill={color}
        fontFamily="Inter, sans-serif"
        fontSize={12}
        fontWeight={500}
        textAnchor="middle"
        x={x + 40}
        y={STACK_Y - 14}
      >
        {label}
      </text>
      {Array.from({ length: BLOCKS }).map((_, i) => (
        <g key={i}>
          <rect
            fill={color}
            height={BLOCK_H}
            opacity={isStudent ? 0.22 + i * 0.04 : 0.32 + i * 0.04}
            rx={3}
            stroke={color}
            strokeWidth={0.8}
            width={80}
            x={x}
            y={STACK_Y + i * (BLOCK_H + BLOCK_GAP)}
          />
          <text
            fill="var(--text)"
            fontFamily="var(--font-mono)"
            fontSize={10}
            textAnchor="middle"
            x={x + 40}
            y={STACK_Y + i * (BLOCK_H + BLOCK_GAP) + 18}
          >
            L{i + 1}
          </text>
        </g>
      ))}
      <rect
        fill={color}
        height={20}
        opacity={0.6}
        rx={3}
        stroke={color}
        width={60}
        x={x + 10}
        y={STACK_Y + BLOCKS * (BLOCK_H + BLOCK_GAP) + 8}
      />
      <text
        fill="var(--bg)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        fontWeight={600}
        textAnchor="middle"
        x={x + 40}
        y={STACK_Y + BLOCKS * (BLOCK_H + BLOCK_GAP) + 22}
      >
        logits
      </text>
    </g>
  );
}

export function FlavorViz({ flavor }: { flavor: DistillFlavor }) {
  const lines = linesForFlavor(flavor);

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={PAD} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        what signal does the student match against? — three flavors
      </text>

      <Stack x={STACK_X_T} label="teacher" color="var(--violet)" />
      <Stack x={STACK_X_S} label="student" color="var(--cyan)" isStudent />

      <text
        fill="var(--dim)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        textAnchor="middle"
        x={STACK_X_T + 40}
        y={H - 10}
      >
        frozen · forward only
      </text>
      <text
        fill="var(--cyan)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        textAnchor="middle"
        x={STACK_X_S + 40}
        y={H - 10}
      >
        trainable · backprop
      </text>

      {lines.map((ln, i) => {
        const x1 = STACK_X_T + 80;
        const x2 = STACK_X_S;
        return (
          <g key={i}>
            <line
              opacity={0.8}
              stroke={ln.color}
              strokeDasharray="4 3"
              strokeWidth={1.4}
              x1={x1}
              x2={x2}
              y1={ln.y1}
              y2={ln.y2}
            />
            <circle cx={x1} cy={ln.y1} fill={ln.color} r={2.5} />
            <circle cx={x2} cy={ln.y2} fill={ln.color} r={2.5} />
            {ln.label ? (
              <text
                fill={ln.color}
                fontFamily="var(--font-mono)"
                fontSize={10}
                textAnchor="middle"
                x={(x1 + x2) / 2}
                y={(ln.y1 + ln.y2) / 2 - 6}
              >
                {ln.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
