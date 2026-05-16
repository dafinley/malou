"use client";

type Stage = { label: string; sub: string; color: string; w: number };

export function Dataflow({ bits, computeBits = 16 }: { bits: number; computeBits?: number }) {
  const W = 720;
  const H = 200;
  const pad = 20;
  const boxH = 56;
  const storedLabel =
    bits === 4
      ? "4-bit nf4"
      : bits === 8
        ? "8-bit int8"
        : bits === 16
          ? "16-bit bf16"
          : `${bits}-bit`;
  const showsDequant = bits < 16;

  const stages: Stage[] = [
    { label: "W₀ stored", sub: storedLabel, color: "var(--violet)", w: 110 },
    ...(showsDequant
      ? [{ label: "dequant", sub: `→ ${computeBits}-bit`, color: "var(--amber)", w: 90 }]
      : []),
    { label: "matmul", sub: "x · W₀ + ΔW", color: "var(--cyan)", w: 130 },
    { label: "output", sub: `${computeBits}-bit activation`, color: "var(--green)", w: 120 }
  ];

  const totalW = stages.reduce((s, st) => s + st.w, 0);
  const gap = (W - pad * 2 - totalW - 70) / (stages.length - 1);
  let xCursor = pad;
  const positions = stages.map((s) => {
    const p = xCursor;
    xCursor += s.w + gap;
    return p;
  });
  const matmulIdx = stages.findIndex((s) => s.label === "matmul");

  return (
    <svg className="qlora-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={16} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        {showsDequant
          ? `forward pass · storage stays in ${bits}-bit, compute happens in bf16`
          : "forward pass · no quantization — weights computed directly in bf16"}
      </text>
      {stages.map((s, i) => (
        <g key={i} transform={`translate(${positions[i]}, 50)`}>
          <rect
            fill="var(--surface-2)"
            height={boxH}
            rx={6}
            stroke={s.color}
            width={s.w}
            x={0}
            y={0}
          />
          <text
            fill="var(--text)"
            fontFamily="Inter, sans-serif"
            fontSize={12.5}
            fontWeight={500}
            textAnchor="middle"
            x={s.w / 2}
            y={24}
          >
            {s.label}
          </text>
          <text
            fill={s.color}
            fontFamily="var(--font-mono)"
            fontSize={10.5}
            textAnchor="middle"
            x={s.w / 2}
            y={42}
          >
            {s.sub}
          </text>
        </g>
      ))}
      {stages.slice(0, -1).map((_, i) => {
        const x1 = positions[i] + stages[i].w;
        const x2 = positions[i + 1];
        const y = 50 + boxH / 2;
        return (
          <g key={`a-${i}`}>
            <line stroke="var(--muted)" strokeWidth={1.2} x1={x1 + 4} x2={x2 - 8} y1={y} y2={y} />
            <polygon
              fill="var(--muted)"
              points={`${x2 - 8},${y} ${x2 - 14},${y - 4} ${x2 - 14},${y + 4}`}
            />
          </g>
        );
      })}
      {matmulIdx > -1 ? (
        <g transform={`translate(${positions[matmulIdx] - 30}, 130)`}>
          <rect
            fill="var(--surface-2)"
            height={36}
            rx={6}
            stroke="var(--violet)"
            width={140}
            x={0}
            y={0}
          />
          <text
            fill="var(--text)"
            fontFamily="Inter, sans-serif"
            fontSize={11}
            textAnchor="middle"
            x={70}
            y={16}
          >
            LoRA adapter
          </text>
          <text
            fill="var(--violet)"
            fontFamily="var(--font-mono)"
            fontSize={10}
            textAnchor="middle"
            x={70}
            y={30}
          >
            B·A in {computeBits}-bit (trainable)
          </text>
          <line
            stroke="var(--violet)"
            strokeDasharray="3 3"
            strokeWidth={1}
            x1={70}
            x2={70}
            y1={0}
            y2={-22}
          />
        </g>
      ) : null}
      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10.5} x={pad} y={H - 8}>
        gradients only flow through B, A · base W₀ never touched · paged optimizer states handle the
        spikes
      </text>
    </svg>
  );
}
