"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronUp, ZoomIn, X, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ---- 13-Step Guide Data ---- */
const STEPS: { title: string; body: string; hasImage: boolean }[] = [
  {
    title: "כניסה לחשבון IBKR",
    body: "היכנס לחשבון IBKR שלך בכתובת:\nhttps://www.interactivebrokers.com\nלחץ על **Log In** והזן את פרטי ההתחברות.",
    hasImage: true,
  },
  {
    title: "ניווט ל-Custom Statements",
    body: "בתפריט העליון, לחץ על **Performance & Reports** → **Statements** → **Custom Statements**.",
    hasImage: true,
  },
  {
    title: "יצירת דוח חדש",
    body: "לחץ על כפתור **+** ליצירת דוח חדש.\nבחר שם לדוח (למשל: **trades**).",
    hasImage: true,
  },
  {
    title: "בחירת סעיפים לדוח עסקאות",
    body: "**בחר סעיפים:**\n- ✅ Account Information\n- ✅ Trades",
    hasImage: true,
  },
  {
    title: "הגדרות סעיפים",
    body: 'גלול מטה עד **Section Configurations**\n- סמן הכל ב-**No**\n- מלבד: **Display Closing Trades Only?** → סמן **Yes**',
    hasImage: true,
  },
  {
    title: "שמירת הדוח",
    body: "בשלב **Delivery Configuration** נא לא לשנות כלום וללחוץ **Continue**.\nלאחר מכן ייפתח מסך נוסף — לחץ על **Create**.",
    hasImage: false,
  },
  {
    title: "הדוח נוצר",
    body: "הדוח נוצר בהצלחה! תוכל לראות אותו ברשימת הדוחות.",
    hasImage: false,
  },
  {
    title: "הפעלת הדוח",
    body: "לחץ על החץ (▶) כדי להפעיל את הדוח ולייצר את הקובץ.",
    hasImage: true,
  },
  {
    title: "הגדרת תאריך",
    body: "בחר תאריך התחלה: **01/01/20XX**\nתאריך סיום: **31/12/20XX**\n(לפי שנת המס הרלוונטית)",
    hasImage: true,
  },
  {
    title: "בחירת פורמט",
    body: "בחר **CSV** כפורמט להורדה.",
    hasImage: false,
  },
  {
    title: "הורדת הקובץ",
    body: "לחץ על **החץ להורדה** והקובץ ישמר במחשב.",
    hasImage: true,
  },
  {
    title: "יצירת דוח דיבידנדים",
    body: "חזור לשלב 3 — הפעם בחר רק את:\n- ✅ Account Information\n- ✅ Dividends",
    hasImage: false,
  },
  {
    title: "הורדת דוח דיבידנדים",
    body: "הפעל את דוח הדיבידנדים והורד אותו בפורמט CSV.",
    hasImage: false,
  },
];

/* ---- Markdown-lite helper ---- */
function renderMd(text: string) {
  return text.split("\n").map((line, i) => {
    const html = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener" class="text-emerald-600 underline">$1</a>'
      );
    return (
      <span key={i} className="block" dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

/* ---- BrokerGuide component ---- */
function BrokerGuide() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ink mb-2">
        מדריך הורדת קבצים מ-IBKR (13 שלבים)
      </h3>

      {STEPS.map((step, idx) => {
        const isOpen = expandedStep === idx;
        const imgSrc = step.hasImage ? `/guide/guide_step${idx + 1}.png` : null;

        return (
          <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden">
            <button
              className="flex w-full items-center justify-between p-3 text-right hover:bg-surface-subtle transition-colors"
              onClick={() => setExpandedStep(isOpen ? null : idx)}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-ink">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-ink">{step.title}</span>
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-ink-tertiary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-ink-tertiary" />
              )}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-slate-100 bg-surface-subtle p-3 text-xs leading-relaxed text-ink-secondary">
                    {renderMd(step.body)}
                    {imgSrc && (
                      <div className="relative mt-3 cursor-pointer group" onClick={() => setLightboxSrc(imgSrc)}>
                        <img src={imgSrc} alt={`Step ${idx + 1}`} className="w-full rounded-lg border border-slate-200" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <button className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40" onClick={() => setLightboxSrc(null)}>
              <X className="h-5 w-5" />
            </button>
            <img src={lightboxSrc} alt="Guide step" className="max-h-[90vh] max-w-[90vw] rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- Main: Free Check Public Page ---- */
export default function FreeCheckPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "uploading" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Upload state
  const [tradesFile, setTradesFile] = useState<File | null>(null);

  // Client details state
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);

  // Result
  const [taxSaved, setTaxSaved] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  // Validate token
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/free-check-share/info/${token}`);
        if (!r.ok) {
          const d = await r.json().catch(() => ({ detail: "קישור לא תקין" }));
          setErrorMsg(d.detail || "קישור לא תקין");
          setStatus("error");
          return;
        }
        setStatus("ready");
      } catch {
        setErrorMsg("שגיאת תקשורת");
        setStatus("error");
      }
    })();
  }, [token]);

  const handleSubmit = async () => {
    if (!tradesFile || !clientName.trim() || !clientPhone.trim() || !clientEmail.trim() || !consent || !disclaimer) return;

    setStatus("uploading");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("trades_file", tradesFile);
    fd.append("client_name", clientName);
    fd.append("client_phone", clientPhone);
    fd.append("client_email", clientEmail);
    fd.append("consent", "true");

    try {
      const r = await fetch(`${API_BASE}/api/free-check-share/upload/${token}`, {
        method: "POST",
        body: fd,
      });

      if (!r.ok) {
        const d = await r.json().catch(() => ({ detail: "שגיאה בעיבוד" }));
        setErrorMsg(d.detail || "שגיאה בעיבוד");
        setStatus("ready");
        return;
      }

      const data = await r.json();
      setTaxSaved(data.tax_saved);
      setShowResult(true);
      setStatus("done");
    } catch {
      setErrorMsg("שגיאת תקשורת");
      setStatus("ready");
    }
  };

  /* Loading */
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-ink-tertiary" />
      </div>
    );
  }

  /* Error */
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-4">
        <div className="card max-w-md w-full p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      </div>
    );
  }

  /* Done — show result */
  if (status === "done" && showResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-4" dir="rtl">
        <div className="card max-w-md w-full p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold text-ink mb-2">חיסכון מס משוער לפי המערכות שלנו:</h2>
          <p className="text-3xl font-bold text-green-600 mb-4">
            ₪{(taxSaved ?? 0).toLocaleString("he-IL", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-ink-secondary">
            נחזור אליך בהקדם עם פרטים נוספים. תודה שהשתמשת בשירות!
          </p>
          <p className="mt-3 text-xs text-ink-tertiary">
            * הסכום המוצג הינו הערכה בלבד ואינו מהווה התחייבות להחזר מס.
          </p>
        </div>
      </div>
    );
  }

  /* Ready — upload + client details form */
  return (
    <div className="min-h-screen bg-surface-subtle" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-edge bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-ink">Tax4Broker</h1>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            בדיקה חינמית
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Guide */}
        <div className="card p-6">
          <BrokerGuide />
        </div>

        {/* Upload Section */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-1">
            <FileSpreadsheet className="inline h-5 w-5 ml-1" /> העלאת קובץ
          </h2>
          <p className="text-xs text-ink-tertiary mb-4">
            העלה את קובץ העסקאות (Trades) שהורדת מ-IBKR
          </p>

          <label className="drop-zone cursor-pointer block">
            <Upload className="mx-auto mb-2 h-6 w-6 text-ink-tertiary" />
            <span className="block text-sm font-medium text-ink">דוח עסקאות (Trades)</span>
            <span className="text-xs text-ink-tertiary">CSV בלבד</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setTradesFile(e.target.files?.[0] ?? null)}
            />
            {tradesFile && (
              <span className="mt-1 block truncate text-xs text-ink-secondary">{tradesFile.name}</span>
            )}
          </label>
        </div>

        {/* Client Details */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink mb-4">פרטים ליצירת קשר</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">שם מלא *</label>
              <input
                className="input"
                placeholder="הכנס שם מלא"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">טלפון *</label>
              <input
                className="input"
                placeholder="050-0000000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">אימייל *</label>
              <input
                className="input"
                placeholder="email@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                dir="ltr"
              />
            </div>

            {/* Consent checkbox */}
            <label className="flex items-start gap-2 text-xs text-ink-secondary mt-2">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600"
              />
              <span>
                אני מאשר/ת לקבל פניות באימייל, טלפון או וואטסאפ בנושא שירותי Tax4Broker.
              </span>
            </label>

            {/* Disclaimer checkbox */}
            <label className="flex items-start gap-2 text-xs text-ink-secondary">
              <input
                type="checkbox"
                checked={disclaimer}
                onChange={(e) => setDisclaimer(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600"
              />
              <span>
                אני מודע/ת לכך שהתוצאה המוצגת הינה הערכה בלבד, המבוססת על הנתונים שהועלו, ואינה מהווה התחייבות להחזר מס בפועל.
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        {errorMsg && (
          <p className="text-center text-sm text-red-500">{errorMsg}</p>
        )}
        <button
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={!tradesFile || !clientName.trim() || !clientPhone.trim() || !clientEmail.trim() || !consent || !disclaimer || status === "uploading"}
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> מעבד...
            </>
          ) : (
            <>בדוק חיסכון מס משוער</>
          )}
        </button>
      </main>
    </div>
  );
}