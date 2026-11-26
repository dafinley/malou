"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  applyTheme,
  getStoredChoice,
  nextChoice,
  setStoredChoice,
  type ThemeChoice
} from "@/src/lib/theme";

const LABEL: Record<ThemeChoice, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme"
};

function ChoiceIcon({ choice }: { choice: ThemeChoice }) {
  if (choice === "light") return <Sun size={15} aria-hidden />;
  if (choice === "dark") return <Moon size={15} aria-hidden />;
  return <Monitor size={15} aria-hidden />;
}

export function ThemeToggle() {
  // Start as "system" on the server and during the first render so SSR/hydration
  // matches. The real preference is loaded in the effect below.
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    // Hydrate from localStorage after mount. SSR can't read storage, so we
    // accept the intentional second render — same trade-off as useUrlState.
    const stored = getStoredChoice();
    applyTheme(stored);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(stored);
  }, []);

  const next = nextChoice(choice);
  const tooltip = `Theme: ${LABEL[choice].toLowerCase()} (click for ${LABEL[next].toLowerCase()})`;

  function cycle() {
    setChoice(next);
    setStoredChoice(next);
    applyTheme(next);
  }

  return (
    <button
      aria-label={tooltip}
      className="theme-toggle"
      data-choice={choice}
      onClick={cycle}
      title={tooltip}
      type="button"
    >
      <ChoiceIcon choice={choice} />
      <span className="theme-toggle-label">{LABEL[choice].replace(" theme", "")}</span>
    </button>
  );
}
