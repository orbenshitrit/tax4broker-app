"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronUp, ZoomIn, X, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ---- 13-Step Guide Data ---- */
const STEPS: { title: string; body: string; hasImage: boolean }[] = [
  {
    title: "\u05DB\u05E0\u05D9\u05E1\u05D4 \u05DC\u05D7\u05E9\u05D1\u05D5\u05DF IBKR",
    body: "\u05D4\u05D9\u05DB\u05E0\u05E1 \u05DC\u05D7\u05E9\u05D1\u05D5\u05DF IBKR \u05E9\u05DC\u05DA \u05D1\u05DB\u05EA\u05D5\u05D1\u05EA:\nhttps://www.interactivebrokers.com\n\u05DC\u05D7\u05E5 \u05E2\u05DC **Log In** \u05D5\u05D4\u05D6\u05DF \u05D0\u05EA \u05E4\u05E8\u05D8\u05D9 \u05D4\u05D4\u05EA\u05D7\u05D1\u05E8\u05D5\u05EA.",
    hasImage: true,
  },
  {
    title: "\u05E0\u05D9\u05D5\u05D5\u05D8 \u05DC-Custom Statements",
    body: "\u05D1\u05EA\u05E4\u05E8\u05D9\u05D8 \u05D4\u05E2\u05DC\u05D9\u05D5\u05DF, \u05DC\u05D7\u05E5 \u05E2\u05DC **Performance & Reports** \u2192 **Statements** \u2192 **Custom Statements**.",
    hasImage: true,
  },
  {
    title: "\u05D9\u05E6\u05D9\u05E8\u05EA \u05D3\u05D5\u05D7 \u05D7\u05D3\u05E9",
    body: "\u05DC\u05D7\u05E5 \u05E2\u05DC \u05DB\u05E4\u05EA\u05D5\u05E8 **+** \u05DC\u05D9\u05E6\u05D9\u05E8\u05EA \u05D3\u05D5\u05D7 \u05D7\u05D3\u05E9.\n\u05D1\u05D7\u05E8 \u05E9\u05DD \u05DC\u05D3\u05D5\u05D7 (\u05DC\u05DE\u05E9\u05DC: **trades**).",
    hasImage: true,
  },
  {
    title: "\u05D1\u05D7\u05D9\u05E8\u05EA \u05E1\u05E2\u05D9\u05E4\u05D9\u05DD \u05DC\u05D3\u05D5\u05D7 \u05E2\u05E1\u05E7\u05D0\u05D5\u05EA",
    body: "**\u05D1\u05D7\u05E8 \u05E1\u05E2\u05D9\u05E4\u05D9\u05DD:**\n- \u2705 Account Information\n- \u2705 Trades",
    hasImage: true,
  },
  {
    title: "\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05E1\u05E2\u05D9\u05E4\u05D9\u05DD",
    body: "\u05D2\u05DC\u05D5\u05DC \u05DE\u05D8\u05D4 \u05E2\u05D3 **Section Configurations**\n- \u05E1\u05DE\u05DF \u05D4\u05DB\u05DC \u05D1-**No**\n- \u05DE\u05DC\u05D1\u05D3: **Display Closing Trades Only?** \u2192 \u05E1\u05DE\u05DF **Yes**",
    hasImage: true,
  },
  {
    title: "\u05E9\u05DE\u05D9\u05E8\u05EA \u05D4\u05D3\u05D5\u05D7",
    body: "\u05D1\u05E9\u05DC\u05D1 **Delivery Configuration** \u05E0\u05D0 \u05DC\u05D0 \u05DC\u05E9\u05E0\u05D5\u05EA \u05DB\u05DC\u05D5\u05DD \u05D5\u05DC\u05DC\u05D7\u05D5\u05E5 **Continue**.\n\u05DC\u05D0\u05D7\u05E8 \u05DE\u05DB\u05DF \u05D9\u05D9\u05E4\u05EA\u05D7 \u05DE\u05E1\u05DA \u05E0\u05D5\u05E1\u05E3 \u2014 \u05DC\u05D7\u05E5 \u05E2\u05DC **Create**.",
    hasImage: false,
  },
  {
    title: "\u05D4\u05D3\u05D5\u05D7 \u05E0\u05D5\u05E6\u05E8",
    body: "\u05D4\u05D3\u05D5\u05D7 \u05E0\u05D5\u05E6\u05E8 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4! \u05EA\u05D5\u05DB\u05DC \u05DC\u05E8\u05D0\u05D5\u05EA \u05D0\u05D5\u05EA\u05D5 \u05D1\u05E8\u05E9\u05D9\u05DE\u05EA \u05D4\u05D3\u05D5\u05D7\u05D5\u05EA.",
    hasImage: false,
  },
  {
    title: "\u05D4\u05E4\u05E2\u05DC\u05EA \u05D4\u05D3\u05D5\u05D7",
    body: "\u05DC\u05D7\u05E5 \u05E2\u05DC \u05D4\u05D7\u05E5 (\u25B6) \u05DB\u05D3\u05D9 \u05DC\u05D4\u05E4\u05E2\u05D9\u05DC \u05D0\u05EA \u05D4\u05D3\u05D5\u05D7 \u05D5\u05DC\u05D9\u05D9\u05E6\u05E8 \u05D0\u05EA \u05D4\u05E7\u05D5\u05D1\u05E5.",
    hasImage: true,
  },
  {
    title: "\u05D4\u05D2\u05D3\u05E8\u05EA \u05EA\u05D0\u05E8\u05D9\u05DA",
    body: "\u05D1\u05D7\u05E8 \u05EA\u05D0\u05E8\u05D9\u05DA \u05D4\u05EA\u05D7\u05DC\u05D4: **01/01/20XX**\n\u05EA\u05D0\u05E8\u05D9\u05DA \u05E1\u05D9\u05D5\u05DD: **31/12/20XX**\n(\u05DC\u05E4\u05D9 \u05E9\u05E0\u05EA \u05D4\u05DE\u05E1 \u05D4\u05E8\u05DC\u05D5\u05D5\u05E0\u05D8\u05D9\u05EA)",
    hasImage: true,
  },
  {
    title: "\u05D1\u05D7\u05D9\u05E8\u05EA \u05E4\u05D5\u05E8\u05DE\u05D8",
    body: "\u05D1\u05D7\u05E8 **CSV** \u05DB\u05E4\u05D5\u05E8\u05DE\u05D8 \u05DC\u05D4\u05D5\u05E8\u05D3\u05D4.",
    hasImage: true,
  },
  {
    title: "\u05D4\u05D5\u05E8\u05D3\u05EA \u05D4\u05E7\u05D5\u05D1\u05E5",
    body: "\u05DC\u05D7\u05E5 \u05E2\u05DC **\u05D4\u05D7\u05E5 \u05DC\u05D4\u05D5\u05E8\u05D3\u05D4** \u05D5\u05D4\u05E7\u05D5\u05D1\u05E5 \u05D9\u05E9\u05DE\u05E8 \u05D1\u05DE\u05D7\u05E9\u05D1.",
    hasImage: true,
  },
  {
    title: "\u05D9\u05E6\u05D9\u05E8\u05EA \u05D3\u05D5\u05D7 \u05D3\u05D9\u05D1\u05D9\u05D3\u05E0\u05D3\u05D9\u05DD",
    body: "\u05D7\u05D6\u05D5\u05E8 \u05DC\u05E9\u05DC\u05D1 3 \u2014 \u05D4\u05E4\u05E2\u05DD \u05D1\u05D7\u05E8 \u05E8\u05E7 \u05D0\u05EA:\n- \u2705 Account Information\n- \u2705 Dividends",
    hasImage: false,
  },
  {
    title: "\u05D4\u05D5\u05E8\u05D3\u05EA \u05D3\u05D5\u05D7 \u05D3\u05D9\u05D1\u05D9\u05D3\u05E0\u05D3\u05D9\u05DD",
    body: "\u05D4\u05E4\u05E2\u05DC \u05D0\u05EA \u05D3\u05D5\u05D7 \u05D4\u05D3\u05D9\u05D1\u05D9\u05D3\u05E0\u05D3\u05D9\u05DD \u05D5\u05D4\u05D5\u05E8\u05D3 \u05D0\u05D5\u05EA\u05D5 \u05D1\u05E4\u05D5\u05E8\u05DE\u05D8 CSV.",
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
        \u05DE\u05D3\u05E8\u05D9\u05DA \u05D4\u05D5\u05E8\u05D3\u05EA \u05E7\u05D1\u05E6\u05D9\u05DD \u05DE-IBKR (13 \u05E9\u05DC\u05D1\u05D9\u05DD)
      </h3>

      {STEPS.map((step, idx) => {
        const isOpen = expandedStep === idx;
        const imgSrc = step.hasImage ? `/guide/step${idx + 1}.png` : null;

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
                        <img src={imgSrc} alt={`Step ${idx + 1}`} className="w-full rounded-lg border border-slate-200" />
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
          const d = await r.json().catch(() => ({ detail: "\u05E7\u05D9\u05E9\u05D5\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF" }));
          setErrorMsg(d.detail || "\u05E7\u05D9\u05E9\u05D5\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF");
          setStatus("error");
          return;
        }
        setStatus("ready");
      } catch {
        setErrorMsg("\u05E9\u05D2\u05D9\u05D0\u05EA \u05EA\u05E7\u05E9\u05D5\u05E8\u05EA");
        setStatus("error");
      }
    })();
  }, [token]);

  const handleSubmit = async () => {
    if (!tradesFile || !clientName.trim() || !clientPhone.trim() || !clientEmail.trim() || !consent) return;

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
        const d = await r.json().catch(() => ({ detail: "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E2\u05D9\u05D1\u05D5\u05D3" }));
        setErrorMsg(d.detail || "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E2\u05D9\u05D1\u05D5\u05D3");
        setStatus("ready");
        return;
      }

      const data = await r.json();
      setTaxSaved(data.tax_saved);
      setShowResult(true);
      setStatus("done");
    } catch {
      setErrorMsg("\u05E9\u05D2\u05D9\u05D0\u05EA \u05EA\u05E7\u05E9\u05D5\u05E8\u05EA");
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

  /* Done  show result */
  if (status === "done" && showResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-4" dir="rtl">
        <div className="card max-w-md w-full p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold text-ink mb-2">\u05D7\u05D9\u05E1\u05DB\u05D5\u05DF \u05DE\u05E1 \u05DE\u05E9\u05D5\u05E2\u05E8 \u05DC\u05E4\u05D9 \u05D4\u05DE\u05E2\u05E8\u05DB\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5:</h2>
          <p className="text-3xl font-bold text-green-600 mb-4">
            \u20AA{(taxSaved ?? 0).toLocaleString("he-IL", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-ink-secondary">
            \u05E0\u05D7\u05D6\u05D5\u05E8 \u05D0\u05DC\u05D9\u05DA \u05D1\u05D4\u05E7\u05D3\u05DD \u05E2\u05DD \u05E4\u05E8\u05D8\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD. \u05EA\u05D5\u05D3\u05D4 \u05E9\u05D4\u05E9\u05EA\u05DE\u05E9\u05EA \u05D1\u05E9\u05D9\u05E8\u05D5\u05EA!
          </p>
        </div>
      </div>
    );
  }

  /* Ready  upload + client details form */
  return (
    <div className="min-h-screen bg-surface-subtle" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-edge bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-ink">Tax4Broker</h1>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            \u05D1\u05D3\u05D9\u05E7\u05D4 \u05D7\u05D9\u05E0\u05DE\u05D9\u05EA
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
            <FileSpreadsheet className="inline h-5 w-5 ml-1" /> \u05D4\u05E2\u05DC\u05D0\u05EA \u05E7\u05D5\u05D1\u05E5
          </h2>
          <p className="text-xs text-ink-tertiary mb-4">
            \u05D4\u05E2\u05DC\u05D4 \u05D0\u05EA \u05E7\u05D5\u05D1\u05E5 \u05D4\u05E2\u05E1\u05E7\u05D0\u05D5\u05EA (Trades) \u05E9\u05D4\u05D5\u05E8\u05D3\u05EA \u05DE-IBKR
          </p>

          <label className="drop-zone cursor-pointer block">
            <Upload className="mx-auto mb-2 h-6 w-6 text-ink-tertiary" />
            <span className="block text-sm font-medium text-ink">\u05D3\u05D5\u05D7 \u05E2\u05E1\u05E7\u05D0\u05D5\u05EA (Trades)</span>
            <span className="text-xs text-ink-tertiary">CSV \u05D1\u05DC\u05D1\u05D3</span>
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
          <h2 className="text-base font-semibold text-ink mb-4">\u05E4\u05E8\u05D8\u05D9\u05DD \u05DC\u05D9\u05E6\u05D9\u05E8\u05EA \u05E7\u05E9\u05E8</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">\u05E9\u05DD \u05DE\u05DC\u05D0 *</label>
              <input
                className="input"
                placeholder="\u05D4\u05DB\u05E0\u05E1 \u05E9\u05DD \u05DE\u05DC\u05D0"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">\u05D8\u05DC\u05E4\u05D5\u05DF *</label>
              <input
                className="input"
                placeholder="050-0000000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC *</label>
              <input
                className="input"
                placeholder="email@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                dir="ltr"
              />
            </div>
            <label className="flex items-start gap-2 text-xs text-ink-secondary mt-2">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600"
              />
              <span>
                \u05D0\u05E0\u05D9 \u05DE\u05D0\u05E9\u05E8/\u05EA \u05DC\u05E7\u05D1\u05DC \u05E4\u05E0\u05D9\u05D5\u05EA \u05D1\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC, \u05D8\u05DC\u05E4\u05D5\u05DF \u05D0\u05D5 \u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4 \u05D1\u05E0\u05D5\u05E9\u05D0 \u05E9\u05D9\u05E8\u05D5\u05EA\u05D9 Tax4Broker.
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
          disabled={!tradesFile || !clientName.trim() || !clientPhone.trim() || !clientEmail.trim() || !consent || status === "uploading"}
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> \u05DE\u05E2\u05D1\u05D3...
            </>
          ) : (
            <>\u05D1\u05D3\u05D5\u05E7 \u05D7\u05D9\u05E1\u05DB\u05D5\u05DF \u05DE\u05E1 \u05DE\u05E9\u05D5\u05E2\u05E8</>
          )}
        </button>
      </main>
    </div>
  );
}