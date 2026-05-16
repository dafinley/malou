"use client";

// Show a stylized "measured reward" curve climbing while "true quality"
// plateaus or drops. The gap is widened by low reward quality (rewardSignal) and
// loose KL (small klBeta).
export function RewardHacking({ rewardSignal, klBeta }: { rewardSignal: number; klBeta: number }) {
  const W = 720;
  const H = 220;
  const pad = 40;
  const plotW = W - pad * 2;
  const plotH = H - 80;
  const baseY = pad + plotH;
  const points = 60;

  // Hackiness 0..1: high when reward quality is low and β is tiny.
  const hackiness = Math.max(0, 1 - rewardSignal / 100) * (1 - Math.min(klBeta * 10, 1));
  const trueCurve: Array<[number, number]> = [];
  const measuredCurve: Array<[number, number]> = [];

  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const x = pad + t * plotW;
    // Measured reward — always saturates upward
    const measured = 1 - Math.exp(-3 * t);
    // True quality — climbs alongside measured at first, then diverges
    // proportional to hackiness as t grows
    const trueQ = measured - hackiness * Math.pow(t, 1.6) * 0.85;
    measuredCurve.push([x, baseY - measured * plotH * 0.85]);
    trueCurve.push([x, baseY - Math.max(trueQ, 0) * plotH * 0.85]);
  }

  const toPath = (pts: Array<[number, number]>) => "M " + pts.map((p) => p.join(" ")).join(" L ");
  const fillPath = (pts: Array<[number, number]>) =>
    toPath(pts) + ` L ${pad + plotW} ${baseY} L ${pad} ${baseY} Z`;

  const gapPct = hackiness * 100;
  const verdict =
    hackiness < 0.1
      ? "trustworthy reward — curves stay aligned"
      : hackiness < 0.3
        ? "small gap opening — usually fine, monitor evals"
        : hackiness < 0.6
          ? "real divergence — Goodhart territory"
          : "reward is being gamed — policy gets clever, behavior gets worse";

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={20} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        what we measure vs what we want · the gap is reward hacking
      </text>
      {/* Axes */}
      <line stroke="var(--line)" x1={pad} x2={pad + plotW} y1={baseY} y2={baseY} />
      <line stroke="var(--line)" x1={pad} x2={pad} y1={pad} y2={baseY} />
      <text
        fill="var(--dim)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        textAnchor="middle"
        x={pad + plotW / 2}
        y={baseY + 18}
      >
        training steps →
      </text>
      <text
        fill="var(--dim)"
        fontFamily="var(--font-mono)"
        fontSize={9.5}
        transform={`rotate(-90, ${pad - 22}, ${pad + plotH / 2})`}
        x={pad - 22}
        y={pad + plotH / 2}
      >
        score
      </text>

      {/* Measured (reward) */}
      <path d={fillPath(measuredCurve)} fill="var(--amber)" opacity={0.12} />
      <path d={toPath(measuredCurve)} fill="none" stroke="var(--amber)" strokeWidth={2} />
      {/* True quality */}
      <path d={fillPath(trueCurve)} fill="var(--cyan)" opacity={0.12} />
      <path d={toPath(trueCurve)} fill="none" stroke="var(--cyan)" strokeWidth={2} />

      {/* Legend */}
      <g transform={`translate(${pad + 12}, ${pad + 4})`}>
        <line stroke="var(--amber)" strokeWidth={2} x1={0} x2={20} y1={0} y2={0} />
        <text fill="var(--amber)" fontFamily="var(--font-mono)" fontSize={10.5} x={26} y={4}>
          measured reward
        </text>
        <line stroke="var(--cyan)" strokeWidth={2} x1={0} x2={20} y1={18} y2={18} />
        <text fill="var(--cyan)" fontFamily="var(--font-mono)" fontSize={10.5} x={26} y={22}>
          true quality
        </text>
      </g>

      {/* Gap readout */}
      <g transform={`translate(${W - 200}, ${pad + 4})`}>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10.5}>
          divergence
        </text>
        <text fill="var(--red)" fontFamily="var(--font-mono)" fontSize={22} fontWeight={600} y={26}>
          {gapPct.toFixed(0)}%
        </text>
        <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={9.5} y={44}>
          reward quality: {rewardSignal}%
        </text>
        <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={9.5} y={58}>
          β: {klBeta.toFixed(3)}
        </text>
      </g>

      <text fill="var(--text)" fontFamily="Inter, sans-serif" fontSize={12} x={pad} y={H - 8}>
        {verdict}
      </text>
    </svg>
  );
}
