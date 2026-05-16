"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage after mount. SSR can't read storage, so we
    // accept the intentional second render — same trade-off as useUrlState.
    const stored = getStoredChoice();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(stored);
    setHydrated(true);
  }, []);

  const cycle = useCallback(() => {
    setChoice((current) => {
      const next = nextChoice(current);
      setStoredChoice(next);
      applyTheme(next);
      return next;
    });
  }, []);

  const next = nextChoice(choice);
  const tooltip = `Theme: ${LABEL[choice].toLowerCase()} (click for ${LABEL[next].toLowerCase()})`;

  return (
    <button
      aria-label={tooltip}
      className="theme-toggle"
      data-choice={choice}
      onClick={cycle}
      // The icon depends on client-only state. Avoid a hydration mismatch by
      // suppressing it on first paint — the icon snaps to the right thing in
      // the same tick as hydration via the effect above.
      suppressHydrationWarning
      title={tooltip}
      type="button"
    >
      <ChoiceIcon choice={hydrated ? choice : "system"} />
      <span className="theme-toggle-label">{LABEL[choice].replace(" theme", "")}</span>
    </button>
  );
}
