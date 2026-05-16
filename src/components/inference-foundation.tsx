"use client";

import { RoadmapBadge, SectionHeader } from "@/src/components/section-header";
import { Term } from "@/src/components/term";
import type { DerivedStats } from "@/src/lib/derive-stats";
import { formatCompact } from "@/src/lib/format";

export function InferenceFoundation({ stats }: { stats: DerivedStats }) {
  const steps: Array<[string, string]> = [
    ["prompt", "tokens enter the context window"],
    ["prefill", `${formatCompact(stats.tokensPerStep)} token-scale attention sketch`],
    ["KV cache", "past attention state is reused"],
    ["decode", "one or more tokens are sampled"],
    ["response", "output streams back to the caller"]
  ];

  return (
    <section className="workbench-section inference-section">
      <SectionHeader
        badge={<RoadmapBadge>inference lab · coming</RoadmapBadge>}
        kicker="inference foundation"
        title="Training changes weights; inference spends them"
        copy={
          <>
            A trained checkpoint becomes an inference system: tokenize, prefill, cache, decode, and
            return. The expensive tensors shift from <Term id="gradient" /> and optimizer state to
            latency, cache, and batching. The strip below is a teaser — a full inference lab
            (prefill, KV cache, batching, speculative decoding) is on the roadmap.
          </>
        }
      />
      <div className="inference-grid">
        {steps.map(([label, copy], index) => (
          <div className="inference-step" key={label}>
            <span>{index + 1}</span>
            <strong>{label}</strong>
            <small>{copy}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
