"use client";

import type { RlAlgorithm } from "@/src/data/training";
import { formatCompact } from "@/src/lib/format";

function StatCard({
  label,
  value,
  sub,
  color = "var(--text)"
}: {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="lab-stat">
      <div className="lab-stat-label">{label}</div>
      <div className="lab-stat-value" style={{ color }}>
        {value}
      </div>
      <div className="lab-stat-sub">{sub}</div>
    </div>
  );
}

const ALGO_LABEL: Record<RlAlgorithm, string> = {
  ppo: "PPO · reward model + value head",
  dpo: "DPO · preferences only",
  grpo: "GRPO · group baseline",
  rlaif: "RLAIF · AI feedback"
};

export function RlSynthesis({
  policyParamsB,
  rollouts,
  rewardSignal,
  klBeta,
  algorithm,
  sequenceLength
}: {
  policyParamsB: number;
  rollouts: number;
  rewardSignal: number;
  klBeta: number;
  algorithm: RlAlgorithm;
  sequenceLength: number;
}) {
  const policyParams = policyParamsB * 1e9;
  const samplesPerStep = rollouts * sequenceLength;
  // Hackiness 0..1 proxy used in the curve viz
  const hackiness = Math.max(0, 1 - rewardSignal / 100) * (1 - Math.min(klBeta * 10, 1));
  const stability =
    klBeta >= 0.3
      ? "very stable, possibly under-fit"
      : klBeta >= 0.1
        ? "balanced"
        : klBeta >= 0.02
          ? "loose — watch drift"
          : "almost free — collapse risk";
  const explorationLabel =
    rollouts >= 32
      ? "wide"
      : rollouts >= 8
        ? "moderate"
        : rollouts >= 2
          ? "narrow"
          : "single sample";

  return (
    <div className="lab-stat-grid">
      <StatCard
        label="algorithm"
        value={algorithm.toUpperCase()}
        sub={ALGO_LABEL[algorithm]}
        color="var(--green)"
      />
      <StatCard
        label="policy"
        value={`${formatCompact(policyParams)}`}
        sub="trainable model"
        color="var(--cyan)"
      />
      <StatCard
        label="samples / step"
        value={formatCompact(samplesPerStep)}
        sub={`${rollouts} × ${sequenceLength.toLocaleString()}`}
        color="var(--amber)"
      />
      <StatCard
        label="exploration width"
        value={`${rollouts}`}
        sub={explorationLabel}
        color="var(--amber)"
      />
      <StatCard
        label="reward quality"
        value={`${rewardSignal}%`}
        sub="clean preference signal"
        color="var(--pink)"
      />
      <StatCard label="KL leash β" value={klBeta.toFixed(3)} sub={stability} color="var(--green)" />
      <StatCard
        label="hacking risk"
        value={`${(hackiness * 100).toFixed(0)}%`}
        sub="low reward + loose β"
        color="var(--red)"
      />
      <StatCard label="reference policy" value="frozen" sub="KL anchor only" color="var(--muted)" />
    </div>
  );
}
