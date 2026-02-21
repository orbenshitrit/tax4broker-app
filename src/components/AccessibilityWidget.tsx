"use client";

import { useState, useEffect } from "react";

/**
 * Israeli Accessibility Widget (תוסף נגישות)
 * Compliant with Israeli Standard 5568 and WCAG 2.1 AA
 * Provides: font scaling, contrast modes, link highlighting,
 * animation stop, readable font, cursor enlargement.
 */

const PREFS_KEY = "a11y_prefs";

interface A11yPrefs {
  fontSize: number; // 0 = normal, 1 = large, 2 = xl
  contrast: number; // 0 = normal, 1 = high, 2 = inverted
  links: boolean;
  animations: boolean; // true = stopped
  readableFont: boolean;
  bigCursor: boolean;
}

const DEFAULT: A11yPrefs = {
  fontSize: 0,
  contrast: 0,
  links: false,
  animations: false,
  readableFont: false,
  bigCursor: false,
};

function loadPrefs(): A11yPrefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function applyPrefs(p: A11yPrefs) {
  const root = document.documentElement;

  // Font size
  root.style.fontSize = p.fontSize === 2 ? "125%" : p.fontSize === 1 ? "112.5%" : "";

  // Contrast
  root.classList.remove("a11y-high-contrast", "a11y-inverted");
  if (p.contrast === 1) root.classList.add("a11y-high-contrast");
  if (p.contrast === 2) root.classList.add("a11y-inverted");

  // Links
  root.classList.toggle("a11y-links", p.links);

  // Animations
  root.classList.toggle("a11y-no-animations", p.animations);

  // Readable font
  root.classList.toggle("a11y-readable-font", p.readableFont);

  // Big cursor
  root.classList.toggle("a11y-big-cursor", p.bigCursor);
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT);

  useEffect(() => {
    const saved = loadPrefs();
    setPrefs(saved);
    applyPrefs(saved);
  }, []);

  const update = (partial: Partial<A11yPrefs>) => {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    applyPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const reset = () => {
    setPrefs(DEFAULT);
    applyPrefs(DEFAULT);
    localStorage.removeItem(PREFS_KEY);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 left-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 md:bottom-6 md:left-6"
        aria-label="תפריט נגישות"
        title="נגישות"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <circle cx="12" cy="4.5" r="2.5" />
          <path d="M12 7v5m0 0-3 5m3-5 3 5" />
          <path d="M6 10h12" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 left-4 z-[9999] w-72 rounded-2xl border border-edge bg-white p-5 shadow-xl md:bottom-20 md:left-6" dir="rtl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">♿ הצהרת נגישות</h3>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-ink-tertiary hover:bg-surface-muted" aria-label="סגור">
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Font size */}
            <A11yRow label="הגדלת טקסט">
              <div className="flex gap-1">
                {[0, 1, 2].map((v) => (
                  <button
                    key={v}
                    onClick={() => update({ fontSize: v as 0 | 1 | 2 })}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${prefs.fontSize === v ? "bg-ink text-white" : "bg-surface-muted text-ink-secondary"}`}
                  >
                    {v === 0 ? "רגיל" : v === 1 ? "גדול" : "ענק"}
                  </button>
                ))}
              </div>
            </A11yRow>

            {/* Contrast */}
            <A11yRow label="ניגודיות">
              <div className="flex gap-1">
                {[0, 1, 2].map((v) => (
                  <button
                    key={v}
                    onClick={() => update({ contrast: v as 0 | 1 | 2 })}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${prefs.contrast === v ? "bg-ink text-white" : "bg-surface-muted text-ink-secondary"}`}
                  >
                    {v === 0 ? "רגיל" : v === 1 ? "גבוהה" : "הפוך"}
                  </button>
                ))}
              </div>
            </A11yRow>

            {/* Toggles */}
            <A11yToggle label="הדגשת קישורים" checked={prefs.links} onChange={(v) => update({ links: v })} />
            <A11yToggle label="עצירת אנימציות" checked={prefs.animations} onChange={(v) => update({ animations: v })} />
            <A11yToggle label="גופן קריא" checked={prefs.readableFont} onChange={(v) => update({ readableFont: v })} />
            <A11yToggle label="סמן מוגדל" checked={prefs.bigCursor} onChange={(v) => update({ bigCursor: v })} />
          </div>

          <button onClick={reset} className="mt-4 w-full rounded-lg border border-edge py-2 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-muted">
            איפוס
          </button>

          <p className="mt-3 text-center text-[10px] text-ink-tertiary">
            תוסף נגישות בהתאם לתקן ישראלי 5568
          </p>
        </div>
      )}
    </>
  );
}

/* Helper components */
function A11yRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-ink-secondary">{label}</span>
      {children}
    </div>
  );
}

function A11yToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-ink-secondary">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`h-6 w-10 rounded-full transition-colors ${checked ? "bg-ink" : "bg-surface-muted border border-edge"}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[-1rem]" : "translate-x-[-0.25rem]"}`} />
      </button>
    </div>
  );
}
