"use client";

import { formatCompact } from "@/src/lib/format";

export function SizeViz({
  teacherParams,
  studentParams
}: {
  teacherParams: number;
  studentParams: number;
}) {
  const W = 720;
  const H = 200;
  const pad = 20;
  const maxLog = Math.log10(Math.max(teacherParams, studentParams, 10));
  const teacherBar = (Math.log10(Math.max(teacherParams, 10)) / maxLog) * (W - pad * 2 - 180);
  const studentBar = (Math.log10(Math.max(studentParams, 10)) / maxLog) * (W - pad * 2 - 180);
  const ratio = teacherParams / Math.max(studentParams, 1);

  const teacherDots = Array.from({ length: Math.min(60, Math.floor(teacherBar / 8)) }, (_, i) => ({
    cx: 124 + ((i * 11.3) % (teacherBar - 4)),
    cy: 4 + ((i * 17) % 28)
  }));
  const studentDots = Array.from({ length: Math.min(30, Math.floor(studentBar / 8)) }, (_, i) => ({
    cx: 124 + ((i * 11.3) % Math.max(studentBar - 4, 8)),
    cy: 4 + ((i * 17) % 28)
  }));

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        capacity gap · what the student must compress
      </text>

      <g transform={`translate(${pad}, 40)`}>
        <text
          x={0}
          y={14}
          fill="var(--violet)"
          fontFamily="Inter, sans-serif"
          fontSize={12.5}
          fontWeight={500}
        >
          teacher
        </text>
        <text x={0} y={28} fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10}>
          large, frozen
        </text>
        <rect fill="var(--violet)" height={36} opacity={0.45} width={teacherBar} x={120} y={0} />
        <rect
          fill="none"
          height={36}
          stroke="var(--violet)"
          strokeWidth={1.2}
          width={teacherBar}
          x={120}
          y={0}
        />
        {teacherDots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} fill="var(--violet)" r={1.4} />
        ))}
        <text
          fill="var(--text)"
          fontFamily="var(--font-mono)"
          fontSize={14}
          fontWeight={600}
          x={120 + teacherBar + 14}
          y={16}
        >
          {formatCompact(teacherParams)}
        </text>
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          x={120 + teacherBar + 14}
          y={30}
        >
          params
        </text>
      </g>

      <g transform={`translate(${pad + 60}, 96)`}>
        <line stroke="var(--amber)" strokeWidth={1.5} x1={0} x2={0} y1={0} y2={28} />
        <polygon fill="var(--amber)" points="0,30 -5,22 5,22" />
        <text x={12} y={20} fill="var(--amber)" fontFamily="var(--font-mono)" fontSize={10.5}>
          distill
        </text>
      </g>

      <g transform={`translate(${pad}, 134)`}>
        <text
          x={0}
          y={14}
          fill="var(--cyan)"
          fontFamily="Inter, sans-serif"
          fontSize={12.5}
          fontWeight={500}
        >
          student
        </text>
        <text x={0} y={28} fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10}>
          small, trainable
        </text>
        <rect fill="var(--cyan)" height={36} opacity={0.45} width={studentBar} x={120} y={0} />
        <rect
          fill="none"
          height={36}
          stroke="var(--cyan)"
          strokeWidth={1.2}
          width={studentBar}
          x={120}
          y={0}
        />
        {studentDots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} fill="var(--cyan)" r={1.4} />
        ))}
        <text
          fill="var(--text)"
          fontFamily="var(--font-mono)"
          fontSize={14}
          fontWeight={600}
          x={120 + studentBar + 14}
          y={16}
        >
          {formatCompact(studentParams)}
        </text>
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          x={120 + studentBar + 14}
          y={30}
        >
          params · {((100 * studentParams) / Math.max(teacherParams, 1)).toFixed(1)}% of teacher
        </text>
      </g>

      <g transform={`translate(${W - 120}, 90)`}>
        <rect fill="var(--bg)" height={36} rx={6} stroke="var(--amber)" width={100} x={0} y={0} />
        <text
          fill="var(--amber)"
          fontFamily="var(--font-mono)"
          fontSize={14}
          fontWeight={600}
          textAnchor="middle"
          x={50}
          y={16}
        >
          {ratio >= 10 ? `${ratio.toFixed(0)}×` : `${ratio.toFixed(1)}×`}
        </text>
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={9}
          textAnchor="middle"
          x={50}
          y={28}
        >
          compression
        </text>
      </g>
    </svg>
  );
}
