"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ZoomIn, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---- Step data (from original Streamlit guide) ---- */
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

/* ---- Image modal ---- */
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

/* ---- Guide component ---- */
export default function GuidePage({ expanded: initialExpanded = false }: { expanded?: boolean }) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  /* Render markdown-lite: **bold**, ✅ items, links */
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
        <span className="text-sm font-semibold text-ink">📖 מדריך הגשת טפסים</span>
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
