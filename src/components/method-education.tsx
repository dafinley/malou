"use client";

import {
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  Lightbulb,
  Sigma,
  XCircle
} from "lucide-react";
import { SectionHeader } from "@/src/components/section-header";
import { education } from "@/src/data/references";
import type { Method } from "@/src/data/training";

export function MethodEducation({ method }: { method: Method }) {
  const content = education[method.key];

  return (
    <section
      className="workbench-section education-section"
      style={{ "--accent": method.accent } as React.CSSProperties}
    >
      <SectionHeader
        kicker="going deeper"
        title={`Inside ${method.label.toLowerCase()}`}
        copy={content.intuition}
      />

      <div className="education-grid">
        <article className="education-card">
          <div className="education-card-title">
            <Sigma size={16} />
            <span>{content.math.title}</span>
          </div>
          <p>{content.math.body}</p>
          {content.math.latex ? (
            <pre className="math-block" aria-label="formula">
              <code>{content.math.latex}</code>
            </pre>
          ) : null}
        </article>

        <article className="education-card">
          <div className="education-card-title">
            <Lightbulb size={16} />
            <span>When to use it</span>
          </div>
          <ul className="decision-list good">
            {content.whenToUse.good.map((item) => (
              <li key={item}>
                <CheckCircle2 size={14} aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="eyebrow decision-divider">When to skip</p>
          <ul className="decision-list avoid">
            {content.whenToUse.avoid.map((item) => (
              <li key={item}>
                <XCircle size={14} aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="education-card education-card-wide">
          <div className="education-card-title">
            <Code2 size={16} />
            <span>Minimal recipe</span>
          </div>
          <p>{content.recipe.description}</p>
          <pre className="code-block">
            <code>{content.recipe.code}</code>
          </pre>
        </article>

        <article className="education-card education-card-wide">
          <div className="education-card-title">
            <BookOpen size={16} />
            <span>References</span>
          </div>
          <ul className="reference-list">
            {content.references.map((ref) => (
              <li key={ref.href}>
                <a href={ref.href} rel="noopener noreferrer" target="_blank">
                  <span className="reference-kind" data-kind={ref.kind}>
                    {ref.kind}
                  </span>
                  <span className="reference-title">{ref.title}</span>
                  {ref.authors ? (
                    <span className="reference-meta">
                      {ref.authors}
                      {ref.year ? ` · ${ref.year}` : ""}
                    </span>
                  ) : null}
                  <ExternalLink size={13} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
