"use client";

import { Scale } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/src/components/section-header";
import { defaultToggles, defaultValues, methods, type MethodKey } from "@/src/data/training";
import { deriveStats, type Values } from "@/src/lib/derive-stats";
import { formatBytes, formatCompact } from "@/src/lib/format";

const presets: Record<MethodKey, Partial<Values>> = {
  "full-training": { modelSizeB: 7, datasetTokensB: 300, sequenceLength: 4096, batchSize: 32 },
  "adapter-finetuning": { modelSizeB: 7, sequenceLength: 2048, batchSize: 8, rank: 16 },
  qlora: { modelSizeB: 13, quantBits: 4, sequenceLength: 4096, rank: 32 },
  distillation: { teacherSizeB: 70, studentSizeB: 7, temperature: 4, softTargetWeight: 0.7 },
  "reinforcement-learning": {
    modelSizeB: 7,
    sequenceLength: 2048,
    rollouts: 16,
    rewardSignal: 72
  }
};

export function ComparisonView({ baseValues }: { baseValues: Values }) {
  const [selected, setSelected] = useState<Set<MethodKey>>(
    () => new Set(["full-training", "adapter-finetuning", "qlora"] as MethodKey[])
  );

  const rows = useMemo(
    () =>
      methods
        .filter((m) => selected.has(m.key))
        .map((method) => {
          const values: Values = { ...baseValues, ...presets[method.key] };
          const stats = deriveStats(method.key, values, defaultToggles);
          return { method, stats };
        }),
    [baseValues, selected]
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
        copy="Same imaginary GPU, same workload. Pick training methods and the readout updates to compare trainable footprint, memory pressure, and per-step throughput."
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
                <dt>Per step</dt>
                <dd>{formatCompact(stats.tokensPerStep)}</dd>
              </div>
              <div>
                <dt>vs full</dt>
                <dd>{(stats.memoryRatio * 100).toFixed(0)}%</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className="comparison-note">
        <Scale size={14} aria-hidden /> Presets normalize each method to its native shape. Toggle
        any combination to see how trainable footprint trades against memory and signal density.
        Like the per-method sketch, these numbers are rough — build intuition here, profile on real
        hardware before sizing.
      </p>
    </section>
  );
}

export const comparisonDefaults = defaultValues;
