"use client";

import { ArrowRight } from "lucide-react";
import { Fact } from "@/src/components/method-summary";
import { RoadmapBadge, SectionHeader } from "@/src/components/section-header";
import { Term } from "@/src/components/term";
import { architectures, type Architecture, type ArchitectureKey } from "@/src/data/training";

export function ArchitectureExplorer({
  active,
  onChange
}: {
  active: ArchitectureKey;
  onChange: (key: ArchitectureKey) => void;
}) {
  const architecture = architectures.find((item) => item.key === active) ?? architectures[0];

  return (
    <section className="workbench-section architecture-section">
      <SectionHeader
        badge={<RoadmapBadge>architecture playground · coming</RoadmapBadge>}
        kicker="architecture foundation"
        title="How the model shape changes the training story"
        copy={
          <>
            The next layer of Molou will compare architectures directly. This first pass connects
            each shape to <Term id="attention" />, training cost, and <Term id="inference" />{" "}
            behavior — the full playground (MoE routing, multimodal projection, hybrid stacks) is on
            the roadmap.
          </>
        }
      />
      <div className="architecture-layout">
        <div aria-label="Architectures" className="architecture-tabs" role="group">
          {architectures.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <button
                aria-pressed={isActive}
                className="architecture-tab"
                data-active={isActive}
                key={item.key}
                onClick={() => onChange(item.key)}
                style={{ "--accent": item.accent } as React.CSSProperties}
                type="button"
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <ArchitectureCard architecture={architecture} />
      </div>
    </section>
  );
}

function ArchitectureCard({ architecture }: { architecture: Architecture }) {
  return (
    <div
      className="architecture-card"
      style={{ "--accent": architecture.accent } as React.CSSProperties}
    >
      <div className="architecture-copy">
        <h3>{architecture.label}</h3>
        <p>{architecture.summary}</p>
      </div>
      <div className="block-chain">
        {architecture.blocks.map((block, index) => (
          <div className="chain-item" key={block}>
            <span>{block}</span>
            {index < architecture.blocks.length - 1 ? <ArrowRight size={16} /> : null}
          </div>
        ))}
      </div>
      <div className="architecture-notes">
        <Fact label="Training" value={architecture.trainingNote} />
        <Fact label="Inference" value={architecture.inferenceNote} />
      </div>
    </div>
  );
}
