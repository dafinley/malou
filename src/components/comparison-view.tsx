"use client";

import { Scale } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/src/components/section-header";
import { methods, type MethodKey } from "@/src/data/training";
import { deriveStats, type Toggles, type Values } from "@/src/lib/derive-stats";
import { formatBytes, formatCompact } from "@/src/lib/format";

function workloadLabel(method: MethodKey, values: Values) {
  const context = `${values.sequenceLength.toLocaleString()} tokens`;
  const batch = `${values.batchSize} × ${context}`;
  const params = formatCompact(values.modelSizeB * 1e9);

  if (method === "distillation") {
    const student = formatCompact(values.studentSizeB * 1e9);
    const teacher = formatCompact(values.teacherSizeB * 1e9);
    const models =
      values.softTargetWeight > 0
        ? `${teacher} teacher → ${student} student`
        : `${student} student only`;
    return `${models} · ${batch}`;
  }
  if (method === "reinforcement-learning") {
    return `${params} policy · ${values.rollouts} rollouts × ${context}`;
  }
  return `${params} params · ${batch}`;
}

export function ComparisonView({ values, toggles }: { values: Values; toggles: Toggles }) {
  const [selected, setSelected] = useState<Set<MethodKey>>(
    () => new Set(["full-training", "adapter-finetuning", "qlora"] as MethodKey[])
  );

  const rows = useMemo(
    () =>
      methods
        .filter((m) => selected.has(m.key))
        .map((method) => ({ method, stats: deriveStats(method.key, values, toggles) })),
    [values, toggles, selected]
  );

  const maxMemory = Math.max(1, ...rows.map((row) => row.stats.memoryBytes));

  function toggle(key: MethodKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <section className="workbench-section comparison-section">
      <SectionHeader
        kicker="compare"
        title="Side by side"
        copy="Full training, LoRA, and QLoRA share the current model size, sequence length, and batch size. Distillation uses teacher and student sizes. RL uses rollouts per step."
      />

      <div className="comparison-toggles" role="group" aria-label="methods to compare">
        {methods.map((method) => {
          const Icon = method.icon;
          const active = selected.has(method.key);
          return (
            <button
              aria-pressed={active}
              className="comparison-toggle"
              data-active={active}
              key={method.key}
              onClick={() => toggle(method.key)}
              style={{ "--accent": method.accent } as React.CSSProperties}
              type="button"
            >
              <Icon size={15} />
              <span>{method.label}</span>
            </button>
          );
        })}
      </div>

      <div className="comparison-grid">
        {rows.map(({ method, stats }) => (
          <article
            className="comparison-card"
            key={method.key}
            style={{ "--accent": method.accent } as React.CSSProperties}
          >
            <header>
              <p className="eyebrow">{method.eyebrow}</p>
              <h3>{method.label}</h3>
              <p className="comparison-workload">{workloadLabel(method.key, values)}</p>
            </header>

            <div className="comparison-bar" aria-label={`${method.label} memory`}>
              <span style={{ width: `${(stats.memoryBytes / maxMemory) * 100}%` }} />
            </div>
            <p className="comparison-readout">
              <strong>{formatBytes(stats.memoryBytes)}</strong>
              <small>VRAM sketch</small>
            </p>

            <dl className="comparison-stats">
              <div>
                <dt>Trainable</dt>
                <dd>{formatCompact(stats.trainableParams)}</dd>
              </div>
              <div>
                <dt>Share</dt>
                <dd>
                  {stats.trainableShare < 1
                    ? stats.trainableShare.toFixed(3)
                    : stats.trainableShare.toFixed(1)}
                  %
                </dd>
              </div>
              <div>
                <dt>
                  {method.key === "reinforcement-learning"
                    ? "Rollout tokens per step"
                    : "Tokens per step"}
                </dt>
                <dd>{formatCompact(stats.tokensPerStep)}</dd>
              </div>
              <div>
                <dt>{method.key === "distillation" ? "vs full teacher" : "vs full training"}</dt>
                <dd>{(stats.memoryRatio * 100).toFixed(0)}%</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className="comparison-note">
        <Scale size={14} aria-hidden /> Memory estimates assume one device, with no sharding or
        activation checkpointing. Profile real workloads before sizing hardware.
      </p>
    </section>
  );
}
