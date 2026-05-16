"use client";

const W = 720;
const H = 260;
const CX = 360;
const CY = 130;
const R = 96;

type Node = {
  angle: number;
  label: string;
  sub: string;
  color: string;
};

const NODES: Node[] = [
  { angle: -Math.PI / 2, label: "policy", sub: "the model", color: "var(--cyan)" },
  { angle: 0, label: "rollouts", sub: "sample N", color: "var(--amber)" },
  { angle: Math.PI / 2, label: "reward", sub: "score", color: "var(--pink)" },
  { angle: Math.PI, label: "update", sub: "policy grad", color: "var(--green)" }
];

export function PolicyLoop({ rollouts }: { rollouts: number }) {
  const positions = NODES.map((n) => ({
    ...n,
    x: CX + Math.cos(n.angle) * R,
    y: CY + Math.sin(n.angle) * R
  }));

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={20} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        the RL loop · sample → score → update → repeat
      </text>

      {/* Reference policy as a tethered ghost behind the loop */}
      <g>
        <circle
          cx={CX - 170}
          cy={CY}
          r={28}
          fill="none"
          stroke="var(--line-strong)"
          strokeDasharray="3 3"
          strokeWidth={1.2}
        />
        <text
          fill="var(--muted)"
          fontFamily="Inter, sans-serif"
          fontSize={11}
          fontWeight={500}
          textAnchor="middle"
          x={CX - 170}
          y={CY + 4}
        >
          reference
        </text>
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          textAnchor="middle"
          x={CX - 170}
          y={CY + 18}
        >
          frozen π_ref
        </text>
        <line
          stroke="var(--line-strong)"
          strokeDasharray="2 4"
          strokeWidth={1}
          x1={CX - 142}
          x2={CX - 22}
          y1={CY}
          y2={CY}
        />
        <text
          fill="var(--muted)"
          fontFamily="var(--font-mono)"
          fontSize={10}
          textAnchor="middle"
          x={CX - 82}
          y={CY - 6}
        >
          KL leash
        </text>
      </g>

      {/* Circle arrows between nodes */}
      {positions.map((n, i) => {
        const next = positions[(i + 1) % positions.length];
        const midAngle =
          (n.angle + (i === positions.length - 1 ? n.angle + Math.PI * 2 : next.angle)) / 2;
        const arrowR = R + 22;
        const ax = CX + Math.cos(midAngle) * arrowR;
        const ay = CY + Math.sin(midAngle) * arrowR;
        return (
          <g key={`arc-${i}`}>
            <path
              d={`M ${n.x} ${n.y} A ${R} ${R} 0 0 1 ${next.x} ${next.y}`}
              fill="none"
              stroke="var(--muted)"
              strokeOpacity={0.5}
              strokeWidth={1.2}
            />
            <text
              fill="var(--muted)"
              fontFamily="var(--font-mono)"
              fontSize={9.5}
              textAnchor="middle"
              x={ax}
              y={ay + 3}
            >
              →
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {positions.map((n, i) => (
        <g key={`n-${i}`} transform={`translate(${n.x}, ${n.y})`}>
          <circle fill="var(--surface-2)" r={42} stroke={n.color} strokeWidth={1.5} />
          <text
            fill="var(--text)"
            fontFamily="Inter, sans-serif"
            fontSize={13}
            fontWeight={600}
            textAnchor="middle"
            y={-4}
          >
            {n.label}
          </text>
          <text
            fill={n.color}
            fontFamily="var(--font-mono)"
            fontSize={10}
            textAnchor="middle"
            y={12}
          >
            {n.sub}
          </text>
        </g>
      ))}

      {/* Rollouts count badge */}
      <g transform={`translate(${CX + 170}, ${CY - 60})`}>
        <rect fill="var(--bg)" height={36} rx={6} stroke="var(--amber)" width={120} x={0} y={0} />
        <text
          fill="var(--amber)"
          fontFamily="var(--font-mono)"
          fontSize={14}
          fontWeight={600}
          textAnchor="middle"
          x={60}
          y={16}
        >
          N = {rollouts}
        </text>
        <text
          fill="var(--dim)"
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          textAnchor="middle"
          x={60}
          y={28}
        >
          rollouts / prompt
        </text>
      </g>

      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10.5} x={20} y={H - 10}>
        gradients flow only through the policy · reference + reward source stay frozen
      </text>
    </svg>
  );
}
