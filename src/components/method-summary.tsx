"use client";

import { BarChart3, Boxes, MemoryStick, Zap } from "lucide-react";
import type { Method } from "@/src/data/training";
import type { DerivedStats } from "@/src/lib/derive-stats";
import { formatBytes, formatCompact } from "@/src/lib/format";

export function MethodSummary({ method, stats }: { method: Method; stats: DerivedStats }) {
  return (
    <section
      className="method-summary"
      style={{ "--accent": method.accent } as React.CSSProperties}
    >
      <div className="summary-copy">
        <p className="eyebrow">{method.eyebrow}</p>
        <h2>{method.label}</h2>
        <p>{method.summary}</p>
      </div>
      <div className="summary-facts">
        <Fact label="Best for" value={method.bestFor} />
        <Fact label="Trainable" value={method.trainable} />
        <Fact label="Frozen" value={method.frozen} />
        <Fact label="Main risk" value={method.risk} />
      </div>
      <ReadoutCards stats={stats} />
    </section>
  );
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReadoutCards({ stats }: { stats: DerivedStats }) {
  return (
    <div className="readout-grid">
      <div className="readout-card">
        <Boxes size={18} />
        <span>Trainable</span>
        <strong>{formatCompact(stats.trainableParams)}</strong>
        <small>
          {stats.trainableShare < 1
            ? stats.trainableShare.toFixed(3)
            : stats.trainableShare.toFixed(1)}
          % of model
        </small>
      </div>
      <div className="readout-card">
        <MemoryStick size={18} />
        <span>VRAM sketch</span>
        <strong>{formatBytes(stats.memoryBytes)}</strong>
        <small>{(stats.memoryRatio * 100).toFixed(0)}% of full training sketch</small>
      </div>
      <div className="readout-card">
        <BarChart3 size={18} />
        <span>Step size</span>
        <strong>{formatCompact(stats.tokensPerStep)}</strong>
        <small>tokens or rollout tokens per update</small>
      </div>
      <div className="readout-card">
        <Zap size={18} />
        <span>Signal</span>
        <strong>{stats.headline}</strong>
        <small>{stats.signal}</small>
      </div>
    </div>
  );
}
