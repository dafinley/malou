"use client";

import { formatCompact } from "@/src/lib/format";

// Approximate H100 BF16 throughput at decent utilization. Real numbers vary
// wildly with sequence length, parallelism, communication, and software.
const H100_FLOPS_PER_SEC = 3e14; // ~300 TFLOPS sustained per GPU
const SECONDS_PER_DAY = 86_400;

export function ComputeBudget({
  modelParamsB,
  datasetTokensB
}: {
  modelParamsB: number;
  datasetTokensB: number;
}) {
  const W = 720;
  const H = 200;
  const pad = 24;
  const N = modelParamsB * 1e9;
  const D = datasetTokensB * 1e9;
  const flops = 6 * N * D;
  const tokensPerParam = D / Math.max(N, 1);
  const chinchillaRatio = tokensPerParam / 20;
  const h100Days = flops / (H100_FLOPS_PER_SEC * SECONDS_PER_DAY);

  function gpuDaysLabel(days: number) {
    if (days < 1) return `${(days * 24).toFixed(1)} GPU-hours`;
    if (days < 100) return `${days.toFixed(1)} GPU-days`;
    if (days < 365 * 3) return `${(days / 365).toFixed(2)} GPU-years`;
    return `${(days / 365).toFixed(0)} GPU-years`;
  }

  const verdict =
    chinchillaRatio < 0.5
      ? "undertrained — model has unused capacity"
      : chinchillaRatio < 1.5
        ? "near Chinchilla optimum (~20 tokens / param)"
        : chinchillaRatio < 10
          ? "over-Chinchilla — pushing for inference quality (Llama-3 era)"
          : "extreme overtraining — diminishing returns";

  return (
    <svg className="lab-viz" role="img" viewBox={`0 0 ${W} ${H}`}>
      <text x={pad} y={20} fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={11}>
        compute budget · FLOPs ≈ 6 · N · D
      </text>

      <g transform={`translate(${pad}, 48)`}>
        <text fill="var(--text)" fontFamily="Inter, sans-serif" fontSize={12} fontWeight={500}>
          tokens per parameter
        </text>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10} y={14}>
          Chinchilla optimum ≈ 20
        </text>
        <rect
          fill="var(--surface-2)"
          height={18}
          rx={3}
          stroke="var(--line)"
          width={W - pad * 2 - 200}
          x={0}
          y={28}
        />
        {/* Chinchilla marker at 20 tokens/param, mapped onto a 0..200 scale */}
        {[5, 10, 20, 50, 100, 200].map((mark) => {
          const x = (Math.min(mark, 200) / 200) * (W - pad * 2 - 200);
          const isChinchilla = mark === 20;
          return (
            <g key={mark}>
              <line
                stroke={isChinchilla ? "var(--green)" : "var(--line)"}
                x1={x}
                x2={x}
                y1={24}
                y2={50}
              />
              <text
                fill={isChinchilla ? "var(--green)" : "var(--dim)"}
                fontFamily="var(--font-mono)"
                fontSize={9}
                textAnchor="middle"
                x={x}
                y={62}
              >
                {mark}
              </text>
            </g>
          );
        })}
        <rect
          fill={
            chinchillaRatio < 0.7
              ? "var(--amber)"
              : chinchillaRatio > 2
                ? "var(--cyan)"
                : "var(--green)"
          }
          height={18}
          opacity={0.55}
          width={(Math.min(tokensPerParam, 200) / 200) * (W - pad * 2 - 200)}
          x={0}
          y={28}
        />
        <text
          fill="var(--text)"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fontWeight={600}
          textAnchor="end"
          x={W - pad * 2 - 200 - 8}
          y={20}
        >
          {tokensPerParam.toFixed(1)}× params
        </text>
      </g>

      {/* Readouts */}
      <g transform={`translate(${W - 184}, 40)`}>
        <text fill="var(--muted)" fontFamily="var(--font-mono)" fontSize={10}>
          total compute
        </text>
        <text fill="var(--red)" fontFamily="var(--font-mono)" fontSize={20} fontWeight={600} y={24}>
          {formatCompact(flops)} FLOP
        </text>
        <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={10} y={42}>
          ≈ {gpuDaysLabel(h100Days)} (H100 BF16)
        </text>
        <text fill="var(--dim)" fontFamily="var(--font-mono)" fontSize={9.5} y={58}>
          assumes ~300 TFLOPS sustained
        </text>
      </g>

      <text fill="var(--text)" fontFamily="Inter, sans-serif" fontSize={12} x={pad} y={H - 14}>
        {verdict}
      </text>
    </svg>
  );
}
