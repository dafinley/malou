"use client";

import { CircuitBoard, FolderGit2 } from "lucide-react";
import { ThemeToggle } from "@/src/components/theme-toggle";

export function WorkbenchHeader({ repoUrl }: { repoUrl?: string }) {
  return (
    <header className="app-header">
      <div className="app-header-title">
        <div className="brand-kicker">
          <BrandMark />
          <p className="eyebrow">Molou · machine learning, made legible</p>
        </div>
        <h1>Model training workbench</h1>
      </div>
      <div className="app-header-meta">
        <div className="header-readout" aria-label="project direction">
          <CircuitBoard size={17} />
          <span>training now · inference and architectures next</span>
        </div>
        <ThemeToggle />
        {repoUrl ? (
          <a
            aria-label="View source"
            className="header-link"
            href={repoUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FolderGit2 size={16} />
            <span>Source</span>
          </a>
        ) : null}
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <svg className="brand-mark" aria-hidden="true" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill="var(--brand-bg)" />
      <path
        d="M 7 26 L 7 6 L 16 16 L 25 6 L 25 26"
        stroke="var(--brand-stroke)"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="6" r="3" fill="var(--brand-node)" />
      <circle cx="25" cy="6" r="3" fill="var(--brand-node)" />
      <circle cx="16" cy="16" r="3" fill="var(--brand-center)" />
      <circle cx="7" cy="26" r="3" fill="var(--brand-node)" />
      <circle cx="25" cy="26" r="3" fill="var(--brand-node)" />
      <circle cx="16" cy="16" r="1.1" fill="var(--brand-spark)" />
    </svg>
  );
}
