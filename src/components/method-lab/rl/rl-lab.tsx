"use client";

import { AlertTriangle } from "lucide-react";
import { NumberedSubsection } from "@/src/components/numbered-subsection";
import {
  RelationshipsGraph,
  type RelationshipEdge,
  type RelationshipNode
} from "@/src/components/relationships-graph";
import { SectionHeader } from "@/src/components/section-header";
import type { RlAlgorithm, SelectorKey } from "@/src/data/training";
import type { Values } from "@/src/lib/derive-stats";
import { AlgorithmCompare } from "./algorithm-compare";
import { KlLeash } from "./kl-leash";
import { PolicyLoop } from "./policy-loop";
import { RewardHacking } from "./reward-hacking";
import { RlSynthesis } from "./synthesis";

const NODES: RelationshipNode[] = [
  { id: "policy", x: 120, y: 60, label: "policy π", color: "var(--cyan)", sub: "trainable" },
  {
    id: "ref",
    x: 120,
    y: 180,
    label: "reference π_ref",
    color: "var(--muted)",
    sub: "frozen anchor"
  },
  {
    id: "reward",
    x: 360,
    y: 60,
    label: "reward source",
    color: "var(--pink)",
    sub: "RM / verifier / pref"
  },
  { id: "kl", x: 360, y: 180, label: "KL leash β", color: "var(--green)", sub: "drift penalty" },
  {
    id: "behavior",
    x: 600,
    y: 60,
    label: "behavior change",
    color: "var(--amber)",
    sub: "what users see"
  },
  {
    id: "hack",
    x: 600,
    y: 180,
    label: "reward hacking",
    color: "var(--red)",
    sub: "what we don't see"
  }
];

const EDGES: RelationshipEdge[] = [
  { from: "policy", to: "reward", color: "var(--pink)", label: "rollouts" },
  { from: "ref", to: "kl", color: "var(--green)" },
  { from: "policy", to: "kl", color: "var(--green)", label: "drift" },
  { from: "reward", to: "behavior", color: "var(--amber)" },
  { from: "kl", to: "behavior", color: "var(--green)" },
  { from: "reward", to: "hack", color: "var(--red)", dash: true, label: "if noisy" },
  { from: "kl", to: "hack", color: "var(--red)", dash: true, label: "if small" }
];

const KNOWN: readonly RlAlgorithm[] = ["ppo", "dpo", "grpo", "rlaif"];
function asAlgo(value: string): RlAlgorithm {
  return (KNOWN as readonly string[]).includes(value) ? (value as RlAlgorithm) : "ppo";
}

export function RlLab({
  method,
  values,
  selectors
}: {
  method: { accent: string };
  values: Values;
  selectors: Record<SelectorKey, string>;
}) {
  const algorithm = asAlgo(selectors.rlAlgorithm);
  const rollouts = Math.round(values.rollouts);
  const rewardSignal = Math.round(values.rewardSignal);
  const klBeta = values.klBeta;
  const policyParamsB = values.modelSizeB;
  const sequenceLength = Math.round(values.sequenceLength);

  return (
    <section
      className="workbench-section method-lab rl-lab"
      style={{ "--accent": method.accent } as React.CSSProperties}
    >
      <SectionHeader
        kicker="rl lab"
        title="Optimizing behavior under a leash"
        copy="Supervised loss tells the model what to copy. Reward tells it what to prefer. RL closes a loop — sample, score, update — and a KL term keeps the policy from wandering away from a sane reference."
      />

      <div className="estimate-disclaimer" role="note">
        <AlertTriangle size={14} aria-hidden />
        <span>
          <strong>Rough estimates, not capacity planning.</strong> The reward-hacking curve is
          stylized: real divergence depends on the specific reward model, prompt distribution, and
          eval suite. Use this to build intuition; profile and human-eval before shipping.
        </span>
      </div>

      <NumberedSubsection
        num="01"
        title="The RL loop · sample → score → update"
        formula="π_new = π_old + η · ∇ J(π)"
        takeaway="Every step samples N completions from the current policy, scores them, then nudges the policy toward higher-scoring ones. The reference policy stays frozen — it only exists so the KL term has something to measure against."
      >
        <PolicyLoop rollouts={rollouts} />
      </NumberedSubsection>

      <NumberedSubsection
        num="02"
        title="KL leash β · how far can the policy drift?"
        formula="J(π) = E[R(x, y)] − β · KL(π ∥ π_ref)"
        takeaway="β is the most underrated knob. Tight β collapses behavior toward the reference; loose β lets the policy chase reward into places no one wants. Most production recipes live in β ≈ 0.05–0.2."
      >
        <KlLeash klBeta={klBeta} />
      </NumberedSubsection>

      <NumberedSubsection
        num="03"
        title="Reward hacking · the gap between measure and want"
        formula="Goodhart: when a measure becomes a target, it stops being a good measure"
        takeaway="Reward goes up; behavior gets worse. This is the central failure mode of RL on language models. Defenses: human evals in the loop, multiple uncorrelated reward sources, KL leash, frequent checkpointing, and refusing to push past the divergence point."
      >
        <RewardHacking klBeta={klBeta} rewardSignal={rewardSignal} />
      </NumberedSubsection>

      <NumberedSubsection
        num="04"
        title="Algorithm family · same skeleton, different ingredients"
        formula="signal · advantage / preference · KL-bounded update"
        takeaway="PPO needs a reward model and a value head; it's stable but expensive. DPO does away with both — it's a closed-form loss on preference pairs. GRPO drops the value head and uses the group as its own baseline. RLAIF is any of these with AI-generated preferences. The picker on the left switches between them."
      >
        <AlgorithmCompare algorithm={algorithm} />
      </NumberedSubsection>

      <NumberedSubsection
        num="05"
        title="Live readouts"
        formula="everything interacting"
        takeaway="Try the 'reward hacking risk' preset to see what a noisy reward + loose β does to the divergence curve. Then switch to 'DPO' and watch rollouts drop to 1 — preference data doesn't need exploration, just contrasts."
      >
        <RlSynthesis
          algorithm={algorithm}
          klBeta={klBeta}
          policyParamsB={policyParamsB}
          rewardSignal={rewardSignal}
          rollouts={rollouts}
          sequenceLength={sequenceLength}
        />
      </NumberedSubsection>

      <RelationshipsGraph title="What pulls on what during alignment" nodes={NODES} edges={EDGES} />
    </section>
  );
}
