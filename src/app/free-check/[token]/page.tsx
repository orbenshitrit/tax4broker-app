"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronUp, ZoomIn, X, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ---- 13-Step Guide Data (identical to Dashboard GuidePage) ---- */
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
    title: "הורדת דוח דיבידנדים",
    body: "- לוחצים שוב על ה-**+** ב-**Custom Statements** (כמו בשלב 3)\n- בוחרים שם (למשל: **dividend**) באותו המקום שבחרתם שם בפעם שעברה",
    hasImage: false,
  },
  {
    title: "בחירת סעיפים לדוח דיבידנדים",
    body: "**בחר סעיפים:**\n- ✅ Account Information\n- ✅ Combined Dividends\n- ✅ Combined Fees\n- ✅ Combined Interest\n- ✅ Commission Credits\n- ✅ Withholding Tax",
    hasImage: true,
  },
  {
    title: "הגדרות סעיפים — דיבידנדים",
    body: "הגדר את אותן ההגדרות כמו בשלב 5.",
    hasImage: true,
  },
  {
    title: "שמירת דוח הדיבידנדים",
    body: "בשלב **Delivery Configuration** נא לא לשנות כלום וללחוץ **Continue**.\nלאחר מכן ייפתח מסך נוסף — לחץ על **Create**.",
    hasImage: false,
  },
  {
    title: "הרצת הדוחות",
    body: "לחץ על **Run** תחת **Custom Statements** עבור כל אחד מהדוחות.",
    hasImage: true,
  },
  {
    title: "הורדת הדוחות כ-CSV",
    body: "**בחר:**\n- `Period` = `Custom Date Range`\n- מתאריך: `01/01/202X`\n- עד תאריך: `31/12/202X`\n- לחץ על **Download CSV**\n\nבצע את אותה פעולה עבור **2 הדוחות**.",
    hasImage: true,
  },
  {
    title: "הורדת הדוחות הסופיים",
    body: "- בצע רענון לדפדפן\n- הורד את **2 הדוחות** תחת **Batch Statements**",
    hasImage: true,
  },
];

/* ---- Image modal (identical to Dashboard GuidePage) ---- */
function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -left-3 z-10 rounded-full bg-white p-1 shadow-lg"
        >
          <X className="h-5 w-5 text-ink" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Guide step" className="max-h-[85vh] rounded-2xl shadow-2xl" />
      </motion.div>
    </div>
  );
}

/* ---- BrokerGuide component (identical to Dashboard GuidePage) ---- */
function BrokerGuide() {
  const [expanded, setExpanded] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const renderBody = (text: string) =>
    text.split("\n").map((line, i) => {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-ink">$1</strong>')
        .replace(/`(.*?)`/g, '<code class="rounded bg-surface-muted px-1 py-0.5 text-xs text-ink">$1</code>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-ink-secondary hover:underline">$1</a>');
      return (
        <span key={i} className="block text-sm leading-relaxed text-ink-secondary" dangerouslySetInnerHTML={{ __html: html }} />
      );
    });

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-right transition-colors hover:bg-surface-subtle"
      >
        <span className="text-sm font-semibold text-ink">📖 מדריך הורדת קבצים מ-IBKR (13 שלבים)</span>
        {expanded ? <ChevronUp className="h-4 w-4 text-ink-tertiary" /> : <ChevronDown className="h-4 w-4 text-ink-tertiary" />}
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-slate-200 px-5 py-5">
              {STEPS.map((step, idx) => {
                const n = idx + 1;
                const imageSrc = `/guide/guide_step${n}.png`;

                return (
                  <div key={n}>
                    <h3 className="mb-2 text-sm font-semibold text-ink">
                      🔹 שלב {n} — {step.title}
                    </h3>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {/* Text */}
                      <div className="flex-1">{renderBody(step.body)}</div>

                      {/* Image */}
                      {step.hasImage && (
                        <div className="shrink-0 sm:w-48">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageSrc}
                            alt={`שלב ${n}`}
                            className="cursor-pointer rounded-xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]"
                            onClick={() => setZoomedImage(imageSrc)}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <button
                            className="mt-1 flex items-center gap-1 text-xs text-ink-secondary hover:underline"
                            onClick={() => setZoomedImage(imageSrc)}
                          >
                            <ZoomIn className="h-3 w-3" /> הגדל
                          </button>
                        </div>
                      )}
                    </div>

                    {n < STEPS.length && <hr className="mt-4 border-slate-100" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoomed image modal */}
      {zoomedImage && <ImageModal src={zoomedImage} onClose={() => setZoomedImage(null)} />}
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
        <BrokerGuide />

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