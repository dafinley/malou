"use client";

export function MatrixDecomp({ rank, alpha }: { rank: number; alpha: number }) {
  const W = 720;
  const H = 240;
  const Wsize = 150;
  const Bw = Math.max(8, Math.min(60, rank * 1.8));
  const Bh = Wsize;
  const Aw = Wsize;
  const Ah = Math.max(8, Math.min(60, rank * 1.8));
  const scaling = alpha / Math.max(rank, 1);
  const cx = 60;
  const cy = 50;

  const aSparkles = Array.from({ length: 14 }, (_, i) => ({
    cx: 4 + ((i * 19.7) % (Aw - 8)),
    cy: 2 + ((i * 7.3) % (Ah - 4))
  }));
  const bSparkles = Array.from({ length: 20 }, (_, i) => ({
    cx: 2 + ((i * 13.7) % (Bw - 4)),
    cy: 4 + ((i * 23.3) % (Bh - 8))
  }));

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <pattern
          id="frozen-hatch"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--dim)" strokeWidth="0.6" opacity="0.5" />
        </pattern>
      </defs>

      {/* Frozen W₀ */}
      <g transform={`translate(${cx}, ${cy})`}>
        <rect
          fill="var(--surface-2)"
          height={Wsize}
          rx={3}
          stroke="var(--line)"
          width={Wsize}
          x={0}
          y={0}
        />
        <rect fill="url(#frozen-hatch)" height={Wsize} width={Wsize} x={0} y={0} />
        <text
          fill="var(--muted)"
          fontFamily="var(--font-mono)"
          fontSize={11}
          textAnchor="middle"
          x={Wsize / 2}
          y={-8}
        >
          W₀ · frozen
        </text>
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="middle"
          x={Wsize / 2}
          y={Wsize + 18}
        >
          d × d
        </text>
      </g>

      <text
        fill="var(--text)"
        fontSize={22}
        textAnchor="middle"
        x={cx + Wsize + 24}
        y={cy + Wsize / 2 + 6}
      >
        +
      </text>

      {/* Scaling factor */}
      <g transform={`translate(${cx + Wsize + 50}, ${cy + Wsize / 2})`}>
        <rect
          fill="var(--bg)"
          height={36}
          rx={6}
          stroke="var(--violet)"
          width={44}
          x={-22}
          y={-18}
        />
        <text
          fill="var(--violet)"
          fontFamily="var(--font-mono)"
          fontSize={13}
          fontWeight={600}
          textAnchor="middle"
          y={5}
        >
          {scaling.toFixed(2)}×
        </text>
        <text
          fill="var(--muted)"
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          textAnchor="middle"
          y={-26}
        >
          α / r
        </text>
      </g>

      {/* B matrix (d × r) */}
      <g transform={`translate(${cx + Wsize + 110}, ${cy})`}>
        <rect
          fill="var(--violet)"
          height={Bh}
          opacity={0.22}
          rx={2}
          stroke="var(--violet)"
          width={Bw}
          x={0}
          y={0}
        />
        {bSparkles.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} fill="var(--violet)" opacity={0.7} r={1.1} />
        ))}
        <text
          fill="var(--violet)"
          fontFamily="var(--font-mono)"
          fontSize={11}
          textAnchor="middle"
          x={Bw / 2}
          y={-8}
        >
          B
        </text>
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="middle"
          x={Bw / 2}
          y={Bh + 18}
        >
          d × r
        </text>
      </g>

      <text
        fill="var(--text)"
        fontSize={18}
        textAnchor="middle"
        x={cx + Wsize + 110 + Bw + 16}
        y={cy + Wsize / 2 + 6}
      >
        ×
      </text>

      {/* A matrix (r × d) */}
      <g transform={`translate(${cx + Wsize + 110 + Bw + 36}, ${cy + Wsize / 2 - Ah / 2})`}>
        <rect
          fill="var(--violet)"
          height={Ah}
          opacity={0.22}
          rx={2}
          stroke="var(--violet)"
          width={Aw}
          x={0}
          y={0}
        />
        {aSparkles.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} fill="var(--violet)" opacity={0.7} r={1.1} />
        ))}
        <text
          fill="var(--violet)"
          fontFamily="var(--font-mono)"
          fontSize={11}
          textAnchor="middle"
          x={Aw / 2}
          y={-8}
        >
          A
        </text>
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="middle"
          x={Aw / 2}
          y={Ah + 18}
        >
          r × d
        </text>
      </g>

      {/* Rank bottleneck label */}
      <g transform={`translate(${cx + Wsize + 110}, ${cy + Wsize + 38})`}>
        <line
          opacity={0.5}
          stroke="var(--violet)"
          strokeWidth={1}
          x1={0}
          x2={Bw + 36 + Aw}
          y1={0}
          y2={0}
        />
        <text
          fill="var(--violet)"
          fontFamily="var(--font-mono)"
          fontSize={10.5}
          textAnchor="middle"
          x={(Bw + 36 + Aw) / 2}
          y={16}
        >
          rank r = {rank} · the bottleneck
        </text>
      </g>

      {/* Effective ΔW */}
      <g transform={`translate(${W - 130}, ${cy})`}>
        <text
          fill="var(--muted)"
          fontFamily="var(--font-mono)"
          fontSize={11}
          textAnchor="middle"
          x={50}
          y={-8}
        >
          ΔW (effective)
        </text>
        <rect
          fill="var(--violet)"
          height={100}
          opacity={Math.min(0.7, 0.15 + scaling * 0.08)}
          rx={3}
          stroke="var(--violet)"
          width={100}
          x={0}
          y={25}
        />
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="middle"
          x={50}
          y={140}
        >
          gain ∝ α / r
        </text>
      </g>
    </svg>
  );
}
