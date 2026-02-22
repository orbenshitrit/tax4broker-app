"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertTriangle, Loader2, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
        className="card w-full max-w-lg p-8"
      >
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

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-ink-tertiary">
          מופעל על ידי Tax4Broker &middot; המערכת המתקדמת לדוחות מס
        </p>
      </motion.div>
    </div>
  );
}
