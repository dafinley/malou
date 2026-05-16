"use client";

import { roadmap } from "@/src/data/training";

export function RoadmapStrip() {
  return (
    <section className="roadmap-strip" aria-label="open source roadmap">
      {roadmap.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.title}>
            <Icon size={18} />
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        );
      })}
    </section>
  );
}
