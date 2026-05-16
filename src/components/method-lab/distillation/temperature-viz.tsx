"use client";

import { entropy, EXAMPLE_LABELS, EXAMPLE_LOGITS, softmaxT } from "./math";

export function TemperatureViz({ temperature }: { temperature: number }) {
  const W = 720;
  const H = 240;
  const pad = 30;
  const plotW = W - pad * 2;
  const plotH = 160;
  const n = EXAMPLE_LOGITS.length;
  const probs = softmaxT(EXAMPLE_LOGITS, temperature);
  const probsRef = softmaxT(EXAMPLE_LOGITS, 1);
  const argmax = Math.max(...probs);
  const ent = entropy(probs);
  const maxEnt = Math.log(n);
  const barW = (plotW - (n - 1) * 4) / n;
  const baseY = pad + 20 + plotH;
  const refTopIndex = probsRef.indexOf(Math.max(...probsRef));

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        teacher&apos;s softmax over classes · T = {temperature.toFixed(1)} · entropy{" "}
        {(ent / Math.log(2)).toFixed(2)} bits
      </text>
      <line stroke="var(--line)" x1={pad} x2={W - pad} y1={baseY} y2={baseY} />

      {probsRef.map((p, i) => {
        const x = pad + i * (barW + 4);
        const h = p * plotH;
        return (
          <rect
            key={`ref-${i}`}
            fill="none"
            height={h}
            opacity={0.6}
            stroke="var(--dim)"
            strokeDasharray="2 3"
            strokeWidth={0.7}
            width={barW}
            x={x}
            y={baseY - h}
          />
        );
      })}

      {probs.map((p, i) => {
        const x = pad + i * (barW + 4);
        const h = p * plotH;
        const color = i === refTopIndex ? "var(--amber)" : "var(--violet)";
        return (
          <g key={i}>
            <rect fill={color} height={h} opacity={0.55} rx={2} width={barW} x={x} y={baseY - h} />
            <rect
              fill="none"
              height={h}
              stroke={color}
              strokeWidth={1}
              width={barW}
              x={x}
              y={baseY - h}
            />
            <text
              fill="var(--muted)"
              fontFamily="var(--font-mono)"
              fontSize={9.5}
              textAnchor="middle"
              x={x + barW / 2}
              y={baseY + 14}
            >
              {EXAMPLE_LABELS[i]}
            </text>
            {p > 0.04 ? (
              <text
                fill="var(--text)"
                fontFamily="var(--font-mono)"
                fontSize={9.5}
                textAnchor="middle"
                x={x + barW / 2}
                y={baseY - h - 4}
              >
                {(p * 100).toFixed(p > 0.1 ? 0 : 1)}%
              </text>
            ) : null}
          </g>
        );
      })}

      <g transform={`translate(${W - 90}, 36)`}>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={9.5}>
          peakiness
        </text>
        <rect fill="var(--surface-2)" height={6} rx={3} width={70} x={0} y={14} />
        <rect fill="var(--amber)" height={6} rx={3} width={70 * argmax} x={0} y={14} />
        <text fill="var(--amber)" fontFamily="var(--font-mono)" fontSize={11} y={36}>
          top: {(argmax * 100).toFixed(1)}%
        </text>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={9.5} y={56}>
          dark knowledge
        </text>
        <rect fill="var(--surface-2)" height={6} rx={3} width={70} x={0} y={62} />
        <rect fill="var(--violet)" height={6} rx={3} width={70 * (ent / maxEnt)} x={0} y={62} />
        <text fill="var(--violet)" fontFamily="var(--font-mono)" fontSize={11} y={84}>
          {((ent / maxEnt) * 100).toFixed(0)}% of max
        </text>
      </g>

      <g transform={`translate(${pad}, ${H - 8})`}>
        <line
          stroke="var(--dim)"
          strokeDasharray="2 3"
          strokeWidth={1}
          x1={0}
          x2={20}
          y1={-2}
          y2={-2}
        />
        <text x={26} y={2} fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10}>
          T=1 reference (the &quot;true&quot; posterior)
        </text>
      </g>
    </svg>
  );
}
