"use client";

import { SectionHeader } from "@/src/components/section-header";
import { glossary, type Method } from "@/src/data/training";

export function GlossaryPanel({ method }: { method: Method }) {
  return (
    <section className="glossary-panel">
      <SectionHeader
        kicker="vocabulary"
        title="Terms in this method"
        copy="The terms below are the mental handles for this training path: objective, signal, memory, and what the optimizer is allowed to change."
      />
      <div className="glossary-grid">
        {method.vocabulary.map((key) => {
          const item = glossary[key];
          return (
            <article className="glossary-item" key={key}>
              <h3>{item.label}</h3>
              <p>{item.definition}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
