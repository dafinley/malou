"use client";

import { formatBytes, formatCompact } from "@/src/lib/format";

const H100_FLOPS_PER_SEC = 3e14;
const SECONDS_PER_DAY = 86_400;
const BYTES_PER_PARAM_TRAIN = 16; // weights + grads + Adam + fp32 master

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

export function FullTrainingSynthesis({
  modelParamsB,
  datasetTokensB,
  sequenceLength,
  batch
}: {
  modelParamsB: number;
  datasetTokensB: number;
  sequenceLength: number;
  batch: number;
}) {
  const N = modelParamsB * 1e9;
  const D = datasetTokensB * 1e9;
  const flops = 6 * N * D;
  const tokensPerParam = D / Math.max(N, 1);
  const trainingMemory = N * BYTES_PER_PARAM_TRAIN;
  const h100Days = flops / (H100_FLOPS_PER_SEC * SECONDS_PER_DAY);
  const stepsPerEpoch = D / Math.max(sequenceLength * batch, 1);
  const tokensPerStep = sequenceLength * batch;

  const regime =
    tokensPerParam < 5
      ? "very undertrained"
      : tokensPerParam < 15
        ? "undertrained"
        : tokensPerParam < 30
          ? "Chinchilla zone"
          : tokensPerParam < 100
            ? "Llama-era over-train"
            : "extreme over-train";

  return (
    <div className="lab-stat-grid">
      <StatCard
        label="parameters"
        value={formatCompact(N)}
        sub="N (model size)"
        color="var(--cyan)"
      />
      <StatCard
        label="training tokens"
        value={formatCompact(D)}
        sub="D (dataset)"
        color="var(--amber)"
      />
      <StatCard
        label="total compute"
        value={`${formatCompact(flops)} FLOP`}
        sub="≈ 6 · N · D"
        color="var(--red)"
      />
      <StatCard
        label="H100-days (1 GPU)"
        value={h100Days < 100 ? h100Days.toFixed(1) : formatCompact(h100Days)}
        sub="at ~300 TFLOPS sustained"
        color="var(--red)"
      />
      <StatCard
        label="tokens / param"
        value={tokensPerParam.toFixed(1)}
        sub={regime}
        color="var(--violet)"
      />
      <StatCard
        label="training VRAM"
        value={formatBytes(trainingMemory)}
        sub="weights + grads + Adam + fp32"
        color="var(--violet)"
      />
      <StatCard
        label="tokens / step"
        value={formatCompact(tokensPerStep)}
        sub={`${batch} × ${sequenceLength.toLocaleString()}`}
        color="var(--cyan)"
      />
      <StatCard
        label="steps / epoch"
        value={formatCompact(stepsPerEpoch)}
        sub="full pass through the corpus"
        color="var(--cyan)"
      />
    </div>
  );
}
