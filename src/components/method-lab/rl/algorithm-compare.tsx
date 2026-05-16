"use client";

import type { RlAlgorithm } from "@/src/data/training";

type AlgoSpec = {
  key: RlAlgorithm;
  label: string;
  stages: string[];
  needs: string;
  note: string;
};

const ALGOS: AlgoSpec[] = [
  {
    key: "ppo",
    label: "PPO",
    stages: ["prompt", "rollouts", "reward model", "advantage (value head)", "clipped update"],
    needs: "reward model + value head + ref policy",
    note: "the InstructGPT recipe — stable, expensive"
  },
  {
    key: "dpo",
    label: "DPO",
    stages: ["prompt", "chosen / rejected", "log-prob ratio", "preference loss"],
    needs: "pairwise prefs + ref policy",
    note: "no reward model — closed-form on preferences"
  },
  {
    key: "grpo",
    label: "GRPO",
    stages: ["prompt", "N rollouts", "verifier scores", "group baseline", "update"],
    needs: "verifier (rule / model) + ref policy",
    note: "PPO without a value head — group acts as the baseline"
  },
  {
    key: "rlaif",
    label: "RLAIF",
    stages: ["prompt", "rollouts", "AI judge", "reward model", "PPO / DPO"],
    needs: "AI feedback model + ref policy",
    note: "swap humans for an AI judge — cheaper, noisier"
  }
];

const W = 720;
const ROW_H = 56;
const PAD = 20;

export function AlgorithmCompare({ algorithm }: { algorithm: RlAlgorithm }) {
  const algo = ALGOS.find((a) => a.key === algorithm) ?? ALGOS[0];
  const stageW = (W - PAD * 2 - 20) / algo.stages.length;
  const H = 180;

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={PAD} y={18} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        {algo.label} pipeline · needs: {algo.needs}
      </text>

      <g transform={`translate(${PAD + 10}, 40)`}>
        {algo.stages.map((stage, i) => (
          <g key={i} transform={`translate(${i * stageW}, 0)`}>
            <rect
              fill="var(--surface-2)"
              height={ROW_H}
              rx={6}
              stroke="var(--green)"
              width={stageW - 12}
              x={0}
              y={0}
            />
            <text
              fill="var(--text)"
              fontFamily="Inter, sans-serif"
              fontSize={12}
              fontWeight={500}
              textAnchor="middle"
              x={(stageW - 12) / 2}
              y={ROW_H / 2 + 4}
            >
              {stage}
            </text>
            {i < algo.stages.length - 1 ? (
              <g transform={`translate(${stageW - 12}, ${ROW_H / 2})`}>
                <line stroke="var(--muted)" strokeWidth={1.2} x1={0} x2={10} y1={0} y2={0} />
                <polygon fill="var(--muted)" points="10,0 4,-4 4,4" />
              </g>
            ) : null}
          </g>
        ))}
      </g>

      <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={11} x={PAD} y={H - 30}>
        {algo.note}
      </text>
      <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10} x={PAD} y={H - 10}>
        all four share the same skeleton: signal · advantage / preference · KL-bounded update
      </text>
    </svg>
  );
}
