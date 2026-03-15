"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertTriangle, Loader2, FileSpreadsheet, ChevronDown, ChevronUp, ZoomIn, X } from "lucide-react";
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

/* ---- Image Modal ---- */
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
          <X className="h-5 w-5 text-slate-700" />
        </button>
        <img src={src} alt="Guide step" className="max-h-[85vh] rounded-2xl shadow-2xl" />
      </motion.div>
    </div>
  );
}

/* ---- Inline Guide Component ---- */
function BrokerGuide() {
  const [expanded, setExpanded] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const renderBody = (text: string) =>
    text.split("\n").map((line, i) => {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>')
        .replace(/`(.*?)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs text-indigo-600">$1</code>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-indigo-500 hover:underline">$1</a>');
      return (
        <span key={i} className="block text-sm leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: html }} />
      );
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-right transition-colors hover:bg-slate-50"
      >
        <span className="text-sm font-semibold text-slate-800">📖 מדריך הורדת קבצים מ-IBKR (13 שלבים)</span>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

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
                    <h3 className="mb-2 text-sm font-semibold text-indigo-600">
                      🔹 שלב {n} — {step.title}
                    </h3>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="flex-1">{renderBody(step.body)}</div>

                      {step.hasImage && (
                        <div className="shrink-0 sm:w-48">
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
                            className="mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:underline"
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

      {zoomedImage && <ImageModal src={zoomedImage} onClose={() => setZoomedImage(null)} />}
    </div>
  );
}

interface ShareInfo {
  client_name: string;
  accountant_name: string;
}

export default function UploadPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState("");
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tradesFile, setTradesFile] = useState<File | null>(null);
  const [dividendsFile, setDividendsFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Unwrap params
  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  // Fetch share info
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/share/info/${token}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({ detail: "קישור לא תקף" }));
          setError(body.detail || "קישור לא תקף");
          return;
        }
        const data = await res.json();
        setShareInfo(data);
      } catch {
        setError("שגיאת תקשורת. נסה שוב.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleUpload = async () => {
    if (!tradesFile || !token) return;
    setUploading(true);
    setUploadError("");
    setProgress(20);

    try {
      const fd = new FormData();
      fd.append("trades_file", tradesFile);
      if (dividendsFile) fd.append("dividends_file", dividendsFile);

      setProgress(40);

      const res = await fetch(`${API_BASE}/api/share/upload/${token}`, {
        method: "POST",
        body: fd,
      });

      setProgress(80);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "שגיאה בעיבוד" }));
        throw new Error(body.detail || "שגיאה בעיבוד הקבצים");
      }

      setProgress(100);
      setDone(true);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "שגיאה בהעלאה");
    } finally {
      setUploading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  // Error state (invalid/used token)
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card w-full max-w-md p-8 text-center"
        >
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h1 className="mb-2 text-xl font-bold text-ink">קישור לא תקף</h1>
          <p className="text-sm text-ink-tertiary">{error}</p>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card w-full max-w-md p-8 text-center"
        >
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-500" />
          <h1 className="mb-2 text-xl font-bold text-ink">הקבצים הועלו בהצלחה!</h1>
          <p className="text-sm text-ink-tertiary">
            הדוח עובד ונשלח לרואה החשבון שלך. תודה!
          </p>
        </motion.div>
      </div>
    );
  }

  // Upload form
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-5"
      >
        {/* Main upload card */}
        <div className="card p-8">
          {/* Logo / Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink">
              <FileSpreadsheet className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-ink">Tax4Broker</h1>
            <p className="mt-1 text-sm text-ink-tertiary">העלאת קבצים לדוח מס</p>
          </div>

          {/* Greeting */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-surface-subtle p-4 text-center">
            <p className="text-sm text-ink">
              שלום <span className="font-semibold">{shareInfo?.client_name}</span>,
            </p>
            <p className="mt-1 text-xs text-ink-tertiary">
              נא להעלות את קבצי ה-CSV מהברוקר. הדוח ייוצר ויישלח לרואה החשבון שלך.
            </p>
          </div>

          {/* File uploads */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Trades */}
              <label className="drop-zone cursor-pointer">
                <Upload className="mx-auto mb-2 h-6 w-6 text-ink-tertiary" />
                <span className="block text-sm font-medium text-ink">דוח עסקאות (Trades)</span>
                <span className="text-xs text-ink-tertiary">CSV בלבד *</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setTradesFile(e.target.files?.[0] ?? null)}
                />
                {tradesFile && (
                  <span className="mt-1 block truncate text-xs text-green-600 font-medium">{tradesFile.name}</span>
                )}
              </label>

              {/* Dividends */}
              <label className="drop-zone cursor-pointer">
                <Upload className="mx-auto mb-2 h-6 w-6 text-ink-tertiary" />
                <span className="block text-sm font-medium text-ink">דוח דיבידנדים</span>
                <span className="text-xs text-ink-tertiary">אופציונלי</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setDividendsFile(e.target.files?.[0] ?? null)}
                />
                {dividendsFile && (
                  <span className="mt-1 block truncate text-xs text-green-600 font-medium">{dividendsFile.name}</span>
                )}
              </label>
            </div>

            {/* Progress bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-xs text-ink-tertiary">מעבד את הקבצים...</p>
              </div>
            )}

            {uploadError && (
              <p className="text-center text-sm text-red-500">{uploadError}</p>
            )}

            <button
              className="btn-primary flex w-full items-center justify-center gap-2 py-3"
              onClick={handleUpload}
              disabled={!tradesFile || uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "מעבד..." : "העלה קבצים"}
            </button>
          </div>
        </div>

        {/* 13-step broker download guide */}
        <BrokerGuide />

        {/* Footer */}
        <p className="text-center text-xs text-ink-tertiary">
          מופעל על ידי Tax4Broker &middot; המערכת המתקדמת לדוחות מס
        </p>
      </motion.div>
    </div>
  );
}
