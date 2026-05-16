"use client";

import { glossary, type GlossaryKey } from "@/src/data/training";

export function Term({ id, children }: { id: GlossaryKey; children?: React.ReactNode }) {
  const entry = glossary[id];

  return (
    <span className="term" tabIndex={0}>
      {children ?? entry.label}
      <span className="tooltip" role="tooltip">
        <strong>{entry.label}</strong>
        <span>{entry.definition}</span>
        <em>{entry.intuition}</em>
      </span>
    </span>
  );
}
