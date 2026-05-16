export type ThemeChoice = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "molou-theme";

const KNOWN_CHOICES: readonly ThemeChoice[] = ["system", "light", "dark"];

function isThemeChoice(value: unknown): value is ThemeChoice {
  return typeof value === "string" && (KNOWN_CHOICES as readonly string[]).includes(value);
}

export function getStoredChoice(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeChoice(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

export function setStoredChoice(choice: ThemeChoice): void {
  if (typeof window === "undefined") return;
  try {
    if (choice === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, choice);
    }
  } catch {
    // Storage may be disabled (private mode, etc.) — applying still works.
  }
}

export function applyTheme(choice: ThemeChoice): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
}

// Inline script executed in <head> before paint to avoid a flash of the wrong
// theme. Mirrors getStoredChoice + applyTheme but inlined as a string so it
// can run synchronously without bundling. Kept tiny on purpose.
export const themeInitScript = `(function(){try{var c=localStorage.getItem('${THEME_STORAGE_KEY}');if(c==='light'||c==='dark'){document.documentElement.setAttribute('data-theme',c);}}catch(e){}})();`;

export function nextChoice(current: ThemeChoice): ThemeChoice {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}
