"use client";

import {
  adamMomentBytes,
  bf16Bytes,
  blockScaleBytes,
  type DerivedStats
} from "@/src/lib/derive-stats";
import { formatBytes, formatCompact } from "@/src/lib/format";

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

export type QloraSynthesisProps = {
  stats: DerivedStats;
  bits: number;
  blockSize: number;
  doubleQuant: boolean;
  rank: number;
  alpha: number;
};

export function QloraSynthesis(props: QloraSynthesisProps) {
  const { modelParams, fullMemoryBytes, memoryBytes, trainableParams, trainableShare } =
    props.stats;
  const isQuantized = props.bits < 16;
  const baseQ = (modelParams * props.bits) / 8;
  const scales = isQuantized ? blockScaleBytes(modelParams, props.blockSize, props.doubleQuant) : 0;
  const baseFull16 = modelParams * bf16Bytes;

  const effBits = ((baseQ + scales) * 8) / modelParams;
  const overheadBits = effBits - props.bits;
  const overheadLabel = !isQuantized
    ? "no quantization · no scales"
    : props.doubleQuant
      ? `${props.bits} + ${overheadBits.toFixed(3)} (dq scales)`
      : `${props.bits} + ${overheadBits.toFixed(2)} (fp32 scales)`;

  return (
    <div className="lab-stat-grid">
      <StatCard
        label="effective bits / weight"
        value={effBits.toFixed(2)}
        sub={overheadLabel}
        color="var(--violet)"
      />
      <StatCard
        label="base weight memory"
        value={formatBytes(baseQ + scales)}
        sub={`vs ${formatBytes(baseFull16)} bf16`}
        color="var(--violet)"
      />
      <StatCard
        label="compression vs full"
        value={`${(fullMemoryBytes / memoryBytes).toFixed(1)}×`}
        sub="same tokens per step"
        color="var(--green)"
      />
      <StatCard
        label="total training memory"
        value={formatBytes(memoryBytes)}
        sub="includes saved activations"
        color="var(--cyan)"
      />
      <StatCard
        label="trainable params"
        value={formatCompact(trainableParams)}
        sub={`${trainableShare.toFixed(2)}% of base`}
        color="var(--cyan)"
      />
      <StatCard
        label="effective gain"
        value={`${(props.alpha / props.rank).toFixed(2)}×`}
        sub="α / r — LoRA contribution"
        color="var(--cyan)"
      />
      <StatCard
        label="storage savings"
        value={isQuantized ? `${(baseFull16 / (baseQ + scales)).toFixed(1)}×` : "1.0×"}
        sub="bf16 → quantized base"
        color="var(--amber)"
      />
      <StatCard
        label="optimizer saved"
        value={formatBytes((modelParams - trainableParams) * adamMomentBytes)}
        sub="FP32 Adam moments saved"
        color="var(--amber)"
      />
    </div>
  );
}
