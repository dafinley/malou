"use client";

import { formatCompact } from "@/src/lib/format";

type Seg = { value: number; label: string; color: string };

const W = 720;
const H = 200;
const PAD = 24;
const LABEL_COL = 140;
const BAR_W = W - PAD * 2 - LABEL_COL - 60;

function FlopsBar({
  y,
  segs,
  total,
  label,
  sub,
  maxFlops
}: {
  y: number;
  segs: Seg[];
  total: number;
  label: string;
  sub: string;
  maxFlops: number;
}) {
  const positions: Array<{ seg: Seg; x: number; w: number }> = [];
  let cursor = PAD + LABEL_COL;
  for (const seg of segs) {
    const w = (seg.value / Math.max(maxFlops, 1)) * BAR_W;
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
      <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10} x={PAD} y={y + 32}>
        {sub}
      </text>
      {positions.map(({ seg, x, w }, i) => (
        <g key={i}>
          <rect fill={seg.color} height={28} opacity={0.5} width={w} x={x} y={y} />
          <rect
            fill="none"
            height={28}
            stroke={seg.color}
            strokeWidth={0.8}
            width={w}
            x={x}
            y={y}
          />
          {w > 50 ? (
            <text
              fill="var(--text)"
              fontFamily="var(--font-mono)"
              fontSize={10}
              textAnchor="middle"
              x={x + w / 2}
              y={y + 18}
            >
              {seg.label}
            </text>
          ) : null}
        </g>
      ))}
      <text
        fill="var(--text)"
        fontFamily="var(--font-mono)"
        fontSize={12}
        fontWeight={600}
        x={endX + 10}
        y={y + 18}
      >
        {formatCompact(total)}
      </text>
    </g>
  );
}

export function ComputeViz({
  teacherParams,
  studentParams,
  useTeacher
}: {
  teacherParams: number;
  studentParams: number;
  useTeacher: boolean;
}) {
  // Standard 2N (fwd) / 6N (fwd+bwd) FLOPs-per-token approximations.
  const teacherFlops = useTeacher ? 2 * teacherParams : 0;
  const studentFlops = 6 * studentParams;
  const fullFlops = 6 * teacherParams;
  const distillFlops = teacherFlops + studentFlops;
  const inferenceRatio = teacherParams / Math.max(studentParams, 1);
  const maxFlops = Math.max(fullFlops, distillFlops) * 1.05;

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={PAD} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        FLOPs per training token
      </text>
      <FlopsBar
        y={36}
        segs={[
          ...(useTeacher
            ? [{ value: teacherFlops, label: "teacher fwd", color: "var(--violet)" }]
            : []),
          { value: studentFlops, label: "student fwd+bwd", color: "var(--cyan)" }
        ]}
        total={distillFlops}
        label={useTeacher ? "distillation step" : "student-only step"}
        sub={useTeacher ? "2× teacher + 6× student" : "6× student"}
        maxFlops={maxFlops}
      />
      <FlopsBar
        y={108}
        segs={[{ value: fullFlops, label: "train teacher from scratch", color: "var(--red)" }]}
        total={fullFlops}
        label="full training (teacher)"
        sub="6× teacher (counterfactual)"
        maxFlops={maxFlops}
      />
      <text
        fill="var(--green)"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fontWeight={600}
        x={PAD + LABEL_COL}
        y={170}
      >
        ↓ inference: {inferenceRatio.toFixed(1)}× cheaper · uses{" "}
        {(100 / Math.max(inferenceRatio, 1)).toFixed(1)}% of teacher&apos;s FLOPs/token
      </text>
    </svg>
  );
}
