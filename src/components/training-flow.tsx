"use client";

import { ChevronRight } from "lucide-react";
import { SectionHeader } from "@/src/components/section-header";
import { Term } from "@/src/components/term";
import type { Method } from "@/src/data/training";

export function TrainingFlow({ method }: { method: Method }) {
  return (
    <section className="workbench-section">
      <SectionHeader
        kicker="process"
        title="What moves during training"
        copy={
          <>
            The loop always alternates between data, prediction, <Term id="loss" />, and updates.
            The difference is which weights are allowed to change.
          </>
        }
      />
      <div className="flow-grid">
        {method.steps.map((step, index) => (
          <div className="flow-step" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
            {index < method.steps.length - 1 ? <ChevronRight size={16} aria-hidden /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
