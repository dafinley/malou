"use client";

import type { DistillFlavor } from "@/src/data/training";
import { formatBytes, formatCompact } from "@/src/lib/format";
import { entropy, EXAMPLE_LOGITS, kl, softmaxT } from "./math";

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

const FLAVOR_SUB: Record<DistillFlavor, string> = {
  logits: "output-only",
  hidden: "feature matching",
  attention: "attention transfer",
  all: "multi-level"
};

export function DistillationSynthesis({
  teacherParams,
  studentParams,
  temperature,
  alpha,
  flavor
}: {
  teacherParams: number;
  studentParams: number;
  temperature: number;
  alpha: number;
  flavor: DistillFlavor;
}) {
  const ratio = teacherParams / Math.max(studentParams, 1);
  const probs = softmaxT(EXAMPLE_LOGITS, temperature);
  const probsT1 = softmaxT(EXAMPLE_LOGITS, 1);
  const ent = entropy(probs);
  const entT1 = entropy(probsT1);
  const klDelta = kl(probs, probsT1);
  const top = Math.max(...probs);
  const topT1 = Math.max(...probsT1);
  const softWeight = alpha * temperature * temperature;
  const hardWeight = 1 - alpha;
  const totalWeight = softWeight + hardWeight;
  const softShare = totalWeight > 0 ? softWeight / totalWeight : 0;
  const teacherBytes = teacherParams * 2;
  const studentBytes = studentParams * 2;

  return (
    <div className="lab-stat-grid">
      <StatCard
        label="compression ratio"
        value={`${ratio.toFixed(1)}×`}
        sub={`${formatCompact(teacherParams)} → ${formatCompact(studentParams)}`}
        color="var(--amber)"
      />
      <StatCard
        label="inference savings"
        value={`${(100 / Math.max(ratio, 1)).toFixed(1)}%`}
        sub="of teacher FLOPs/token"
        color="var(--green)"
      />
      <StatCard
        label="memory savings"
        value={`${((1 - studentBytes / Math.max(teacherBytes, 1)) * 100).toFixed(1)}%`}
        sub={`${formatBytes(teacherBytes)} → ${formatBytes(studentBytes)}`}
        color="var(--green)"
      />
      <StatCard
        label="soft-label share"
        value={`${(softShare * 100).toFixed(0)}%`}
        sub="α · T² vs (1 − α)"
        color="var(--violet)"
      />
      <StatCard
        label="teacher top-1"
        value={`${(top * 100).toFixed(1)}%`}
        sub={`vs ${(topT1 * 100).toFixed(1)}% at T=1`}
        color="var(--violet)"
      />
      <StatCard
        label="entropy gain"
        value={`${(ent / Math.log(2)).toFixed(2)} bits`}
        sub={`vs ${(entT1 / Math.log(2)).toFixed(2)} at T=1`}
        color="var(--violet)"
      />
      <StatCard
        label="KL from T=1"
        value={klDelta.toFixed(3)}
        sub="how much T moved the dist"
        color="var(--cyan)"
      />
      <StatCard label="signal source" value={flavor} sub={FLAVOR_SUB[flavor]} color="var(--cyan)" />
    </div>
  );
}
