"use client";

import { Database } from "lucide-react";
import type { DerivedStats } from "@/src/lib/derive-stats";
import { formatBytes } from "@/src/lib/format";

export function MemoryStack({ stats }: { stats: DerivedStats }) {
  const total = stats.stack.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="memory-stack">
      <div className="mini-title">
        <Database size={16} />
        <span>Training memory sketch</span>
      </div>
      <div className="stack-bar" aria-label="memory stack">
        {stats.stack.map((segment) => (
          <span
            key={segment.label}
            style={
              {
                "--segment-color": segment.color,
                width: `${Math.max((segment.value / total) * 100, 2)}%`
              } as React.CSSProperties
            }
            title={`${segment.label}: ${formatBytes(segment.value)}`}
          />
        ))}
      </div>
      <div className="stack-legend">
        {stats.stack.map((segment) => (
          <div key={segment.label}>
            <span style={{ background: segment.color }} />
            <strong>{segment.label}</strong>
            <small>{formatBytes(segment.value)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
