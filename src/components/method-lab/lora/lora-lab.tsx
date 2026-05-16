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
import { AlphaGain } from "./alpha-gain";
import { BatchViz } from "./batch-viz";
import { ContextViz } from "./context-viz";
import { MatrixDecomp } from "./matrix-decomp";
import { LoraSynthesis } from "./synthesis";

const NODES: RelationshipNode[] = [
  { id: "ctx", x: 120, y: 50, label: "context size", color: "var(--cyan)", sub: "architectural" },
  { id: "seq", x: 120, y: 230, label: "sequence length", color: "var(--cyan)", sub: "per example" },
  { id: "batch", x: 360, y: 50, label: "batch size", color: "var(--amber)", sub: "parallelism" },
  { id: "mem", x: 360, y: 230, label: "memory", color: "var(--red)", sub: "GPU constraint" },
  { id: "rank", x: 600, y: 50, label: "LoRA rank", color: "var(--violet)", sub: "capacity" },
  { id: "alpha", x: 600, y: 230, label: "LoRA alpha", color: "var(--violet)", sub: "gain" },
  { id: "elr", x: 480, y: 140, label: "effective LR", color: "var(--violet)", sub: "α / r" },
  { id: "tps", x: 240, y: 140, label: "tokens / step", color: "var(--amber)", sub: "throughput" }
];

const EDGES: RelationshipEdge[] = [
  { from: "ctx", to: "seq", color: "var(--cyan)", label: "≤" },
  { from: "seq", to: "tps", color: "var(--amber)" },
  { from: "batch", to: "tps", color: "var(--amber)" },
  { from: "tps", to: "mem", color: "var(--red)" },
  { from: "seq", to: "mem", color: "var(--red)", label: "seq²" },
  { from: "rank", to: "elr", color: "var(--violet)" },
  { from: "alpha", to: "elr", color: "var(--violet)" },
  { from: "rank", to: "mem", color: "var(--violet)", dash: true }
];

export function LoraLab({ method, values }: { method: { accent: string }; values: Values }) {
  const contextSize = Math.round(values.contextSize);
  // Sequence can never exceed context. Clamp visually without mutating state.
  const sequenceLength = Math.min(Math.round(values.sequenceLength), contextSize);
  const batch = Math.round(values.batchSize);
  const rank = Math.round(values.rank);
  const alpha = Math.round(values.alpha);

  return (
    <section
      className="workbench-section method-lab lora-lab"
      style={{ "--accent": method.accent } as React.CSSProperties}
    >
      <SectionHeader
        kicker="lora lab"
        title="The five knobs & how they pull on each other"
        copy="Drag the sliders. Every visual updates live so you can feel the geometry: what fits in context, what costs memory, what controls adapter capacity, and what controls adapter loudness."
      />

      <div className="estimate-disclaimer" role="note">
        <AlertTriangle size={14} aria-hidden />
        <span>
          <strong>Rough estimates, not capacity planning.</strong> Base shape assumed (d=4096,
          layers=32, 32-head attention, 4 projections per layer). Real numbers depend on
          architecture, framework, and recompute strategy.
        </span>
      </div>

      <NumberedSubsection
        num="01"
        title="Context size ⊇ sequence length"
        formula="sequence ≤ context"
        takeaway="Context is the ceiling baked into the base model. Sequence length is what you actually pack into each example — it can be shorter, never longer. Padding to context wastes compute; truncating loses signal."
      >
        <ContextViz contextSize={contextSize} sequenceLength={sequenceLength} />
      </NumberedSubsection>

      <NumberedSubsection
        num="02"
        title="Batch × sequence = tokens per step"
        formula="tokens/step = B · S"
        takeaway="Throughput is the product. But memory grows differently along each axis: linearly in batch, roughly quadratically in sequence (attention is S²). Halving sequence often saves more than halving batch."
      >
        <BatchViz batch={batch} sequenceLength={sequenceLength} />
      </NumberedSubsection>

      <NumberedSubsection
        num="03"
        title="LoRA rank — the bottleneck of ΔW"
        formula="ΔW = (α/r) · B · A, B ∈ ℝᵈˣʳ, A ∈ ℝʳˣᵈ"
        takeaway={
          <>
            Rank caps how much new information the adapter can encode. r={rank} means only {rank}{" "}
            dimensions of update — LoRA trains many orders of magnitude fewer parameters than full
            fine-tuning of the same matrices. Low rank = cheap and regularized; high rank = more
            capacity but bigger and overfit-prone.
          </>
        }
      >
        <MatrixDecomp rank={rank} alpha={alpha} />
      </NumberedSubsection>

      <NumberedSubsection
        num="04"
        title="LoRA alpha — the gain on the adapter"
        formula="scaling = α / r"
        takeaway="Alpha alone isn't meaningful — only α/r is. A common heuristic is α = r (gain 1) or α = 2r (gain 2). Bump rank, bump alpha proportionally to keep the effective learning rate steady — otherwise your update suddenly gets weaker."
      >
        <AlphaGain rank={rank} alpha={alpha} />
      </NumberedSubsection>

      <NumberedSubsection
        num="05"
        title="Live readouts"
        formula="all five interacting"
        takeaway="Notice: pushing sequence length is the most expensive lever (quadratic). Pushing rank barely moves memory but moves capacity a lot. Alpha is free — it costs nothing, it just rescales."
      >
        <LoraSynthesis
          contextSize={contextSize}
          sequenceLength={sequenceLength}
          batch={batch}
          rank={rank}
          alpha={alpha}
        />
      </NumberedSubsection>

      <RelationshipsGraph title="How they pull on each other" nodes={NODES} edges={EDGES} />
    </section>
  );
}
