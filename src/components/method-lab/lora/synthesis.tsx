"use client";

import { formatBytes, formatCompact } from "@/src/lib/format";

const DIM = 4096;
const LAYERS = 32;
const HEADS = 32;
const BYTES_PER_PARAM = 2;
const PROJS_PER_LAYER = 4;

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

export function LoraSynthesis({
  contextSize,
  sequenceLength,
  batch,
  rank,
  alpha
}: {
  contextSize: number;
  sequenceLength: number;
  batch: number;
  rank: number;
  alpha: number;
}) {
  const loraPerProj = 2 * rank * DIM;
  const loraTotal = loraPerProj * PROJS_PER_LAYER * LAYERS;
  const loraMemory = loraTotal * BYTES_PER_PARAM;
  const actMemory = batch * sequenceLength * DIM * LAYERS * 10;
  const attMemory = batch * sequenceLength * sequenceLength * HEADS * 2;
  const tokensPerStep = batch * sequenceLength;
  const scaling = alpha / Math.max(rank, 1);
  const baseDenseParams = DIM * DIM * PROJS_PER_LAYER * LAYERS;
  const compression = baseDenseParams / Math.max(loraTotal, 1);

  return (
    <div className="lab-stat-grid">
      <StatCard
        label="tokens / step"
        value={formatCompact(tokensPerStep)}
        sub={`${batch} × ${sequenceLength.toLocaleString()}`}
        color="var(--amber)"
      />
      <StatCard
        label="LoRA params"
        value={formatCompact(loraTotal)}
        sub={`${formatBytes(loraMemory)} @ fp16`}
        color="var(--violet)"
      />
      <StatCard
        label="compression"
        value={`${compression.toFixed(0)}×`}
        sub={`vs full ${formatCompact(baseDenseParams)} params`}
        color="var(--green)"
      />
      <StatCard
        label="effective gain"
        value={`${scaling.toFixed(2)}×`}
        sub="α / r — adapter contribution"
        color="var(--violet)"
      />
      <StatCard
        label="activation memory"
        value={formatBytes(actMemory)}
        sub="∝ batch · seq · d · layers"
        color="var(--cyan)"
      />
      <StatCard
        label="attention memory"
        value={formatBytes(attMemory)}
        sub="∝ batch · seq² ⚠ quadratic"
        color="var(--red)"
      />
      <StatCard
        label="seq / context"
        value={`${((sequenceLength / Math.max(contextSize, 1)) * 100).toFixed(0)}%`}
        sub={`${sequenceLength.toLocaleString()} / ${contextSize.toLocaleString()}`}
        color="var(--cyan)"
      />
      <StatCard
        label="LoRA / full"
        value={`${(100 / Math.max(compression, 1)).toFixed(2)}%`}
        sub="trainable fraction"
        color="var(--violet)"
      />
    </div>
  );
}
