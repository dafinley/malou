"use client";

import { adapterParams, blockScaleBytes } from "@/src/lib/derive-stats";
import { formatBytes, formatCompact } from "@/src/lib/format";

function pickHardware(totalBytes: number) {
  if (totalBytes < 24e9) return "24 GB (3090 / 4090)";
  if (totalBytes < 48e9) return "48 GB (A6000)";
  if (totalBytes < 80e9) return "80 GB (A100 / H100)";
  if (totalBytes < 160e9) return "2× 80 GB";
  return "multi-GPU";
}

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
  params: number;
  bits: number;
  blockSize: number;
  doubleQuant: boolean;
  rank: number;
  alpha: number;
};

export function QloraSynthesis(props: QloraSynthesisProps) {
  const isQuantized = props.bits < 16;
  const baseQ = (props.params * props.bits) / 8;
  const scales = isQuantized
    ? blockScaleBytes(props.params, props.blockSize, props.doubleQuant)
    : 0;
  const baseFull16 = props.params * 2;
  const adapter = adapterParams(props.params, props.rank);
  const loraBytes = adapter * 2;
  const loraOpt = adapter * 10;
  const fullOpt = props.params * 10;
  const acts = props.params * 0.05;
  const totalQ = baseQ + scales + loraBytes + loraOpt + acts;
  const totalFull = baseFull16 + fullOpt + acts;

  const effBits = ((baseQ + scales) * 8) / props.params;
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
        value={`${(totalFull / totalQ).toFixed(1)}×`}
        sub="incl. optimizer + grads"
        color="var(--green)"
      />
      <StatCard
        label="total training memory"
        value={formatBytes(totalQ)}
        sub={`fits on ${pickHardware(totalQ)}`}
        color="var(--cyan)"
      />
      <StatCard
        label="trainable params"
        value={formatCompact(adapter)}
        sub={`${((adapter / props.params) * 100).toFixed(2)}% of base`}
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
        value={formatBytes(fullOpt - loraOpt)}
        sub="vs full Adam on base"
        color="var(--amber)"
      />
    </div>
  );
}
