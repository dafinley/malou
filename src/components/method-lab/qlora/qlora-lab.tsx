"use client";

import { AlertTriangle } from "lucide-react";
import { NumberedSubsection } from "@/src/components/numbered-subsection";
import {
  RelationshipsGraph,
  type RelationshipEdge,
  type RelationshipNode
} from "@/src/components/relationships-graph";
import { SectionHeader } from "@/src/components/section-header";
import type { Toggles, Values } from "@/src/lib/derive-stats";
import { BlockQuant } from "./block-quant";
import { Dataflow } from "./dataflow";
import { MemoryComparison } from "./memory-comparison";
import { NF4Pdf } from "./nf4-pdf";
import { PrecisionLadder } from "./precision-ladder";
import { QloraSynthesis } from "./synthesis";

const QLORA_NODES: RelationshipNode[] = [
  {
    id: "nf4",
    x: 120,
    y: 50,
    label: "NF4 storage",
    color: "var(--violet)",
    sub: "4-bit base weights"
  },
  {
    id: "block",
    x: 120,
    y: 170,
    label: "block-wise quant",
    color: "var(--amber)",
    sub: "per-block scales"
  },
  {
    id: "dq",
    x: 120,
    y: 280,
    label: "double quant",
    color: "var(--pink)",
    sub: "quantize the scales"
  },
  {
    id: "paged",
    x: 380,
    y: 280,
    label: "paged optimizer",
    color: "var(--green)",
    sub: "CPU↔GPU paging"
  },
  {
    id: "base-mem",
    x: 380,
    y: 50,
    label: "base weight memory",
    color: "var(--violet)",
    sub: "biggest savings"
  },
  {
    id: "qerr",
    x: 380,
    y: 140,
    label: "quantization error",
    color: "var(--red)",
    sub: "precision cost"
  },
  {
    id: "opt-mem",
    x: 380,
    y: 210,
    label: "optimizer memory",
    color: "var(--green)",
    sub: "second-biggest term"
  },
  {
    id: "fits",
    x: 600,
    y: 140,
    label: "fits 65B on 48 GB",
    color: "var(--cyan)",
    sub: "the headline result"
  }
];

const QLORA_EDGES: RelationshipEdge[] = [
  { from: "nf4", to: "base-mem", color: "var(--violet)", label: "4×" },
  { from: "block", to: "qerr", color: "var(--amber)" },
  { from: "dq", to: "qerr", color: "var(--pink)", label: "−0.5b" },
  { from: "paged", to: "opt-mem", color: "var(--green)" },
  { from: "nf4", to: "qerr", color: "var(--red)", dash: true },
  { from: "base-mem", to: "fits", color: "var(--cyan)" },
  { from: "opt-mem", to: "fits", color: "var(--cyan)" }
];

export function QloraLab({
  values,
  toggles,
  method
}: {
  values: Values;
  toggles: Toggles;
  method: { accent: string };
}) {
  const params = values.modelSizeB * 1e9;
  const bits = Math.round(values.quantBits);
  const blockSize = Math.round(values.blockSize);
  const rank = Math.round(values.rank);
  const alpha = Math.round(values.alpha);
  const doubleQuant = toggles.doubleQuant;
  const showCompare = toggles.compareToFull;
  const fp32OverheadBits = 32 / blockSize;
  const dqOverheadBits = 8 / blockSize + 32 / (blockSize * 256);

  return (
    <section
      className="workbench-section method-lab qlora-lab"
      style={{ "--accent": method.accent } as React.CSSProperties}
    >
      <SectionHeader
        kicker="qlora lab"
        title="Inside QLoRA — four innovations stacked"
        copy="Drag the controls to feel how each idea (NF4, block-wise scales, double quantization, paged optimizers) cuts memory without (much) hurting precision."
      />

      <div className="estimate-disclaimer" role="note">
        <AlertTriangle size={14} aria-hidden />
        <span>
          <strong>Rough estimates, not capacity planning.</strong> Numbers below ignore kernel
          overhead, parallelism, gradient checkpointing, framework slack, and real-world
          fragmentation. Use them to build intuition; size hardware with a profiler.
        </span>
      </div>

      <NumberedSubsection
        num="01"
        title="Precision ladder · fp32 → nf4"
        formula="mem = params × bits / 8"
        takeaway="Going from bf16 to 4-bit cuts base-weight memory by 4×. That alone is the difference between needing 4 GPUs and 1 GPU. The catch: naive int4 loses signal; QLoRA uses NF4, which is smarter."
      >
        <PrecisionLadder bits={bits} params={params} />
      </NumberedSubsection>

      <NumberedSubsection
        num="02"
        title="NF4 · non-uniform quantization tuned to weights"
        formula="levels placed at quantiles of N(0,1)"
        takeaway="Pre-trained LLM weights are roughly normally distributed. Uniform int4 wastes most of its 16 codes on rare extreme values. NF4 packs the codes near zero where the mass is — same 4 bits, far less error."
      >
        <NF4Pdf bits={bits} />
      </NumberedSubsection>

      <NumberedSubsection
        num="03"
        title="Block-wise quantization + double quant"
        formula="w ≈ s · q  ·  block size = how often s changes"
        takeaway={
          <>
            Smaller blocks → better local fidelity but more scale factors stored. At block=
            {blockSize}, plain FP32 scales cost {fp32OverheadBits.toFixed(2)} extra bits/weight.
            Double quantization quantizes those scales themselves, dropping that to{" "}
            {dqOverheadBits.toFixed(3)} bits/weight — {doubleQuant ? "on now." : "currently off."}
          </>
        }
      >
        <BlockQuant blockSize={blockSize} doubleQuant={doubleQuant} />
      </NumberedSubsection>

      <NumberedSubsection
        num="04"
        title="The dataflow · stored small, computed big"
        formula="store nf4 · dequant on-the-fly · compute bf16"
        takeaway="The base weights live in 4-bit memory but never compute in 4-bit. Each matmul dequantizes the block to bf16, does math, throws the bf16 copy away. The LoRA adapter — the only trainable part — stays in bf16 the whole time."
      >
        <Dataflow bits={bits} />
      </NumberedSubsection>

      <NumberedSubsection
        num="05"
        title="Memory stack · where the bytes actually go"
        formula="base + scales + LoRA + optimizer + activations"
        takeaway="The biggest win isn't just smaller weights — it's that you no longer need optimizer state for the base (Adam needs ~10 bytes/param). LoRA-only optimizer state plus a quantized base = the magic. Paged optimizers spill rare spikes to CPU."
      >
        <MemoryComparison
          params={params}
          bits={bits}
          blockSize={blockSize}
          doubleQuant={doubleQuant}
          rank={rank}
          sequenceLength={values.sequenceLength}
          batchSize={values.batchSize}
          showCompare={showCompare}
        />
      </NumberedSubsection>

      <NumberedSubsection
        num="06"
        title="Live readouts"
        formula="everything interacting"
        takeaway="Try the '65B headline' preset for the original QLoRA result. Then flip off double-quant and watch the overhead climb. Then drop bits to 8 and watch the base memory double."
      >
        <QloraSynthesis
          params={params}
          bits={bits}
          blockSize={blockSize}
          doubleQuant={doubleQuant}
          rank={rank}
          alpha={alpha}
        />
      </NumberedSubsection>

      <RelationshipsGraph
        title="The four QLoRA innovations & where each one bites"
        nodes={QLORA_NODES}
        edges={QLORA_EDGES}
      />
    </section>
  );
}
