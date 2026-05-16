"use client";

import { AlertTriangle } from "lucide-react";
import { NumberedSubsection } from "@/src/components/numbered-subsection";
import {
  RelationshipsGraph,
  type RelationshipEdge,
  type RelationshipNode
} from "@/src/components/relationships-graph";
import { SectionHeader } from "@/src/components/section-header";
import type { DistillFlavor, SelectorKey } from "@/src/data/training";
import type { Values } from "@/src/lib/derive-stats";
import { ComputeViz } from "./compute-viz";
import { FlavorViz } from "./flavor-viz";
import { LossMix } from "./loss-mix";
import { EXAMPLE_LOGITS, softmaxT } from "./math";
import { SizeViz } from "./size-viz";
import { DistillationSynthesis } from "./synthesis";
import { TemperatureViz } from "./temperature-viz";

const NODES: RelationshipNode[] = [
  { id: "teacher", x: 120, y: 50, label: "teacher size", color: "var(--violet)", sub: "capacity" },
  { id: "student", x: 120, y: 160, label: "student size", color: "var(--cyan)", sub: "capacity" },
  { id: "temp", x: 120, y: 270, label: "temperature T", color: "var(--amber)", sub: "softness" },
  { id: "comp", x: 360, y: 50, label: "compression", color: "var(--amber)", sub: "T / S ratio" },
  {
    id: "fit",
    x: 360,
    y: 160,
    label: "student fit",
    color: "var(--cyan)",
    sub: "how well it learns"
  },
  {
    id: "alpha",
    x: 360,
    y: 270,
    label: "α (soft/hard mix)",
    color: "var(--violet)",
    sub: "loss balance"
  },
  {
    id: "infer",
    x: 600,
    y: 90,
    label: "inference cost",
    color: "var(--green)",
    sub: "what you ship"
  },
  {
    id: "qual",
    x: 600,
    y: 230,
    label: "final quality",
    color: "var(--green)",
    sub: "student accuracy"
  }
];

const EDGES: RelationshipEdge[] = [
  { from: "teacher", to: "comp", color: "var(--amber)", label: "÷" },
  { from: "student", to: "comp", color: "var(--amber)", dash: true },
  { from: "student", to: "fit", color: "var(--cyan)" },
  { from: "temp", to: "fit", color: "var(--violet)", label: "softens" },
  { from: "temp", to: "alpha", color: "var(--violet)" },
  { from: "fit", to: "qual", color: "var(--green)" },
  { from: "comp", to: "infer", color: "var(--green)", label: "∝" },
  { from: "alpha", to: "qual", color: "var(--green)", dash: true }
];

const KNOWN_FLAVORS = ["logits", "hidden", "attention", "all"] as const;

function asFlavor(value: string): DistillFlavor {
  return (KNOWN_FLAVORS as readonly string[]).includes(value) ? (value as DistillFlavor) : "logits";
}

export function DistillationLab({
  method,
  values,
  selectors
}: {
  method: { accent: string };
  values: Values;
  selectors: Record<SelectorKey, string>;
}) {
  const teacherParams = values.teacherSizeB * 1e9;
  const studentParams = values.studentSizeB * 1e9;
  const temperature = values.temperature;
  const alpha = values.softTargetWeight;
  const flavor = asFlavor(selectors.distillFlavor);

  const probsT1 = softmaxT(EXAMPLE_LOGITS, 1);
  const probs = softmaxT(EXAMPLE_LOGITS, temperature);
  const topT1 = Math.max(...probsT1);
  const top = Math.max(...probs);

  return (
    <section
      className="workbench-section method-lab distillation-lab"
      style={{ "--accent": method.accent } as React.CSSProperties}
    >
      <SectionHeader
        kicker="distillation lab"
        title="Compressing a model by learning from its outputs"
        copy={
          <>
            A small student learns to mimic a large teacher. The teacher&apos;s softened
            probabilities carry more information than the raw label — &quot;this image is 80% cat,
            15% dog, 4% tiger&quot; tells the student about class similarity in a way &quot;cat=1,
            else=0&quot; cannot. Drag the sliders to feel it.
          </>
        }
      />

      <div className="estimate-disclaimer" role="note">
        <AlertTriangle size={14} aria-hidden />
        <span>
          <strong>Rough estimates, not capacity planning.</strong> Compute uses the standard 2N
          (fwd) / 6N (fwd+bwd) FLOPs approximation; the temperature viz uses a fixed 10-class
          example. Real distillation depends heavily on task, recipe, and teacher quality.
        </span>
      </div>

      <NumberedSubsection
        num="01"
        title="Teacher → Student · the capacity gap"
        formula="compression = teacher_params / student_params"
        takeaway="The student is the model you'll deploy — small, fast, cheap. The teacher is a one-time investment whose only job is to generate richer training signal. The bigger the gap, the harder the compression, but you save on every inference forever."
      >
        <SizeViz teacherParams={teacherParams} studentParams={studentParams} />
      </NumberedSubsection>

      <NumberedSubsection
        num="02"
        title="Temperature · softening the teacher"
        formula="p_i = exp(z_i / T) / Σ exp(z_j / T)"
        takeaway={
          <>
            At T=1 the teacher&apos;s prediction is sharp and one class dominates. Higher T flattens
            it, surfacing the ratios between non-top classes — &quot;this looks more like a tiger
            than a truck.&quot; That&apos;s the &quot;dark knowledge&quot; the student learns from.
            T={temperature.toFixed(1)} keeps the top class at {(top * 100).toFixed(1)}%; at T=1 it
            would be {(topT1 * 100).toFixed(1)}%.
          </>
        }
      >
        <TemperatureViz temperature={temperature} />
      </NumberedSubsection>

      <NumberedSubsection
        num="03"
        title="Loss mixing · α blends soft and hard targets"
        formula="L = α · T² · KL(s ∥ t) + (1 − α) · CE(s, y)"
        takeaway="α=0 is plain supervised training, α=1 is pure mimicry (no ground-truth labels needed). The T² factor is Hinton's correction: gradients of the soft loss shrink as 1/T², so you multiply them back so changing T doesn't accidentally also change the effective learning rate."
      >
        <LossMix alpha={alpha} temperature={temperature} />
      </NumberedSubsection>

      <NumberedSubsection
        num="04"
        title="What to match · three flavors of distillation"
        formula="logits vs hidden states vs attention"
        takeaway="Logits-only (Hinton's original): cheapest, model-agnostic. Hidden-state matching (FitNets, DistilBERT): more signal per token, requires student/teacher dims to be projectable. Attention transfer (TinyBERT, MiniLM): the most signal, only works for transformers. Each level you add tightens the student but couples the architectures."
      >
        <FlavorViz flavor={flavor} />
      </NumberedSubsection>

      <NumberedSubsection
        num="05"
        title="The compute deal"
        formula="train: 2·T + 6·S    infer: 2·S"
        takeaway="Each training step needs the teacher to do a forward pass — adds cost, but no gradients flow through it. That's the price you pay during training. The payoff is at inference: you ship only the student, paying a fraction of teacher FLOPs for every request, forever."
      >
        <ComputeViz teacherParams={teacherParams} studentParams={studentParams} />
      </NumberedSubsection>

      <NumberedSubsection
        num="06"
        title="Live readouts"
        formula="everything interacting"
        takeaway="Try the 'no teacher' preset (T=1, α=0): you've completely turned off distillation and you're just doing supervised training on the student. Then ramp α up and T to 4 — watch the soft-label share take over, and entropy gain climb as the teacher's softened distribution starts carrying more bits of signal per example."
      >
        <DistillationSynthesis
          teacherParams={teacherParams}
          studentParams={studentParams}
          temperature={temperature}
          alpha={alpha}
          flavor={flavor}
        />
      </NumberedSubsection>

      <RelationshipsGraph title="The four knobs & their tradeoffs" nodes={NODES} edges={EDGES} />
    </section>
  );
}
