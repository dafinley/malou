"use client";

const NF4_LEVELS = [
  -1.0, -0.6961928009986877, -0.5250730514526367, -0.39491748809814453, -0.28444138169288635,
  -0.18477343022823334, -0.09105003625154495, 0.0, 0.07958029955625534, 0.16093020141124725,
  0.24611230194568634, 0.33791524171829224, 0.44070982933044434, 0.5626170039176941,
  0.7229568362236023, 1.0
];

function phi(x: number) {
  return Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);
}

export function NF4Pdf({ bits }: { bits: number }) {
  const W = 720;
  const H = 240;
  const pad = 30;
  const plotW = W - pad * 2;
  const plotH = 140;
  const baseY = 30 + plotH;
  const xRange = 5;
  const xToPx = (x: number) => pad + ((x + xRange / 2) / xRange) * plotW;

  const curvePts: Array<[number, number]> = [];
  for (let i = 0; i <= 100; i++) {
    const x = -xRange / 2 + (i / 100) * xRange;
    curvePts.push([xToPx(x), baseY - phi(x) * plotH * 2.4]);
  }
  const curvePath =
    "M " +
    curvePts.map((p) => p.join(" ")).join(" L ") +
    ` L ${W - pad} ${baseY} L ${pad} ${baseY} Z`;
  const curveStroke = "M " + curvePts.map((p) => p.join(" ")).join(" L ");

  const showLevels = bits === 4 ? 16 : Math.min(2 ** bits, 16);
  const levels =
    bits === 4
      ? NF4_LEVELS.map((v) => v * 2)
      : Array.from(
          { length: showLevels },
          (_, i) => -xRange / 2 + (xRange * (i + 0.5)) / showLevels
        );
  const lvColor = bits === 4 ? "var(--violet)" : "var(--amber)";

  return (
    <svg className="qlora-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        {bits === 4
          ? "NF4 · 16 levels placed at quantiles of N(0,1) — dense near zero where weights cluster"
          : `${bits}-bit uniform · ${showLevels >= 16 ? "showing 16 of " : ""}${2 ** bits} evenly-spaced levels`}
      </text>
      <line stroke="var(--line)" x1={pad} x2={W - pad} y1={baseY} y2={baseY} />
      <path d={curveStroke} fill="none" opacity={0.85} stroke="var(--cyan)" strokeWidth={1.5} />
      <path d={curvePath} fill="var(--cyan)" opacity={0.08} />
      {levels.map((lv, i) => {
        const x = xToPx(lv);
        const yTop = baseY - phi(lv / 2) * plotH * 2.4;
        return (
          <g key={i}>
            <line stroke={lvColor} strokeWidth={1.2} x1={x} x2={x} y1={baseY - 6} y2={baseY + 14} />
            <circle cx={x} cy={yTop} fill={lvColor} r={2.5} />
          </g>
        );
      })}
      <text
        fill="var(--muted)"
        fontFamily="var(--font-mono)"
        fontSize={10}
        textAnchor="middle"
        x={W / 2}
        y={baseY + 32}
      >
        weight value (normalized)
      </text>
      <text x={pad + 6} y={48} fill="var(--cyan)" fontFamily="var(--font-mono)" fontSize={10}>
        ↑ density of pre-trained weights
      </text>
      {bits === 4 ? (
        <g transform={`translate(${W - 200}, ${baseY - plotH + 10})`}>
          <rect
            fill="var(--bg)"
            height={56}
            rx={6}
            stroke="var(--violet)"
            width={186}
            x={0}
            y={0}
          />
          <text
            x={10}
            y={18}
            fill="var(--violet)"
            fontFamily="var(--font-mono)"
            fontSize={11}
            fontWeight={600}
          >
            information-theoretically
          </text>
          <text x={10} y={32} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10.5}>
            optimal for normally
          </text>
          <text x={10} y={46} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10.5}>
            distributed data
          </text>
        </g>
      ) : null}
    </svg>
  );
}
