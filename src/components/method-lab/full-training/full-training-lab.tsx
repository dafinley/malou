"use client";

import { AlertTriangle } from "lucide-react";
import { NumberedSubsection } from "@/src/components/numbered-subsection";
import {
  RelationshipsGraph,
  type RelationshipEdge,
  type RelationshipNode
} from "@/src/components/relationships-graph";
import { SectionHeader } from "@/src/components/section-header";
import type { Values } from "@/src/lib/derive-stats";
import { ComputeBudget } from "./compute-budget";
import { OptimizerBreakdown } from "./optimizer-breakdown";
import { FullTrainingSynthesis } from "./synthesis";
import { TrainingDynamics } from "./training-dynamics";

const NODES: RelationshipNode[] = [
  { id: "N", x: 120, y: 60, label: "model size N", color: "var(--cyan)", sub: "parameters" },
  { id: "D", x: 120, y: 200, label: "data D", color: "var(--amber)", sub: "tokens" },
  { id: "compute", x: 360, y: 60, label: "compute", color: "var(--red)", sub: "6 · N · D" },
  {
    id: "memory",
    x: 360,
    y: 200,
    label: "training memory",
    color: "var(--violet)",
    sub: "~16 B / param"
  },
  { id: "loss", x: 600, y: 60, label: "loss", color: "var(--green)", sub: "next-token CE" },
  {
    id: "quality",
    x: 600,
    y: 200,
    label: "downstream quality",
    color: "var(--green)",
    sub: "what you ship"
  }
];

const EDGES: RelationshipEdge[] = [
  { from: "N", to: "compute", color: "var(--red)" },
  { from: "D", to: "compute", color: "var(--red)" },
  { from: "N", to: "memory", color: "var(--violet)" },
  { from: "compute", to: "loss", color: "var(--green)" },
  { from: "loss", to: "quality", color: "var(--green)" },
  { from: "D", to: "quality", color: "var(--green)", label: "saturates" },
  { from: "N", to: "quality", color: "var(--green)", dash: true }
];

export function FullTrainingLab({
  method,
  values
}: {
  method: { accent: string };
  values: Values;
}) {
  const modelParamsB = values.modelSizeB;
  const datasetTokensB = values.datasetTokensB;
  const sequenceLength = Math.round(values.sequenceLength);
  const batch = Math.round(values.batchSize);

  return (
    <section
      className="workbench-section method-lab full-training-lab"
      style={{ "--accent": method.accent } as React.CSSProperties}
    >
      <SectionHeader
        kicker="full training lab"
        title="Pretraining mechanics — the upstream of every other method"
        copy="Every other technique starts from a checkpoint someone full-trained. The interesting questions here are about compute, data, and the regime you're operating in."
      />

      <div className="estimate-disclaimer" role="note">
        <AlertTriangle size={14} aria-hidden />
        <span>
          <strong>Rough estimates, not capacity planning.</strong> Compute uses the 6 · N · D
          approximation; H100-days assume ~300 TFLOPS sustained on a single GPU. Real pretraining is
          multi-node, comms-bound, and depends on parallelism strategy.
        </span>
      </div>

      <NumberedSubsection
        num="01"
        title="Compute budget · Chinchilla as the reference point"
        formula="FLOPs ≈ 6 · N · D"
        takeaway="Hoffmann et al. (2022) showed that for a fixed compute budget, scaling N and D together is dramatically better than just scaling N. The 20-tokens-per-parameter rule is the Chinchilla optimum; modern models (Llama 3) deliberately overtrain so inference cost stays low."
      >
        <ComputeBudget modelParamsB={modelParamsB} datasetTokensB={datasetTokensB} />
      </NumberedSubsection>

      <NumberedSubsection
        num="02"
        title="Memory · what mixed-precision Adam actually costs"
        formula="weights (2) + grads (2) + Adam (8) + fp32 master (4) = 16 B / param"
        takeaway="A 7B model needs ~112 GB just for training state, before activations or optimizer parallelism. This is why ZeRO, FSDP, and tensor parallelism exist — to spread that footprint across devices."
      >
        <OptimizerBreakdown modelParamsB={modelParamsB} />
      </NumberedSubsection>

      <NumberedSubsection
        num="03"
        title="Training dynamics · warmup, descent, long tail"
        formula="loss = -E[log p_θ(x_t | x_<t)]"
        takeaway="The loss curve is misleadingly tame. Real runs spike, stall, and recover; warmup avoids divergence at the start, the fast descent is the body of the work, and the long tail is where downstream eval gains actually accrue. Checkpoint frequently — you'll want to roll back."
      >
        <TrainingDynamics datasetTokensB={datasetTokensB} />
      </NumberedSubsection>

      <NumberedSubsection
        num="04"
        title="Live readouts"
        formula="N · D · compute · memory"
        takeaway="Try 'Chinchilla 7B' vs 'Llama 3 8B' — same parameter count, ~10× more data, very different downstream quality. Then try 'GPT-3 175B' for what 'undertrained' looked like circa 2020."
      >
        <FullTrainingSynthesis
          batch={batch}
          datasetTokensB={datasetTokensB}
          modelParamsB={modelParamsB}
          sequenceLength={sequenceLength}
        />
      </NumberedSubsection>

      <RelationshipsGraph
        title="What pulls on what during pretraining"
        nodes={NODES}
        edges={EDGES}
      />
    </section>
  );
}
