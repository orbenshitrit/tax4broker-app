"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Page, ReportMeta } from "@/components/AppShell";
import {
  CreditCard,
  MessageCircle,
  Shield,
  LogOut,
  Plus,
  Archive,
  Beaker,
  Upload,
  FileSpreadsheet,
  Share2,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import GuidePage from "@/components/pages/GuidePage";

const WHATSAPP_LINK =
  "https://api.whatsapp.com/send?phone=972502551542&text=%D7%94%D7%99%D7%99+%D7%90%D7%A0%D7%99+%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F+%D7%91%D7%A9%D7%99%D7%A8%D7%95%D7%AA+TAX4BROKER";

interface Props {
  navigate: (page: Page) => void;
  navigateToRestore: (report: ReportMeta) => void;
  isAdmin: boolean;
}

/* ---------- Lead Dialog ---------- */
function LeadDialog({
  open,
  onClose,
  taxSaved,
  userEmail,
  getToken,
}: {
  open: boolean;
  onClose: () => void;
  taxSaved: number;
  userEmail: string;
  getToken: () => Promise<string>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      await apiFetch("/api/leads", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, tax_saved: taxSaved, source: "free_check", userEmail }),
        token,
      });
      setDone(true);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card mx-4 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-ink">השאר פרטים</h3>
        {done ? (
          <p className="text-center text-sm text-green-600">תודה! הפרטים נשמרו ונחזור אליך.</p>
        ) : (
          <div className="space-y-3">
            <input className="input" placeholder="שם" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="אימייל" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" placeholder="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="btn-primary w-full" onClick={submit} disabled={loading}>
              {loading ? "שולח..." : "שלח"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------- New Report Choice Dialog ---------- */
function NewReportDialog({
  open,
  onClose,
  credits,
  onSelfUpload,
  onShareToClient,
  onBuyCredits,
}: {
  open: boolean;
  onClose: () => void;
  credits: number;
  onSelfUpload: () => void;
  onShareToClient: () => void;
  onBuyCredits: () => void;
}) {
  if (!open) return null;

  const handleSelf = () => {
    if (credits <= 0) {
      onBuyCredits();
      return;
    }
    onSelfUpload();
  };

  const handleShare = () => {
    if (credits <= 0) {
      onBuyCredits();
      return;
    }
    onShareToClient();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card mx-4 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold text-ink">דוח חדש</h3>
        <p className="mb-5 text-xs text-ink-tertiary">בחר כיצד תרצה להפיק את הדוח</p>

        <div className="space-y-3">
          <button
            className="w-full rounded-xl border border-slate-200 p-4 text-right transition-all hover:border-emerald-300 hover:bg-emerald-50/50"
            onClick={handleSelf}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
                <Upload className="h-5 w-5 text-ink" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">העלאה עצמית</p>
                <p className="text-xs text-ink-tertiary">אני מעלה את קבצי ה-CSV בעצמי</p>
              </div>
            </div>
          </button>

          <button
            className="w-full rounded-xl border border-slate-200 p-4 text-right transition-all hover:border-emerald-300 hover:bg-emerald-50/50"
            onClick={handleShare}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
                <Share2 className="h-5 w-5 text-ink" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">שלח ללקוח למילוי</p>
                <p className="text-xs text-ink-tertiary">הלקוח יעלה את הקבצים בעצמו והדוח יישלח אליך במייל</p>
              </div>
            </div>
          </button>
        </div>

        {credits <= 0 && (
          <p className="mt-3 text-center text-xs text-red-500">
            ⚠ אין קרדיטים — תועבר לרכישה
          </p>
        )}

        <button className="btn-secondary mt-4 w-full text-xs" onClick={onClose}>
          ביטול
        </button>
      </motion.div>
    </div>
  );
}

/* ---------- Share to Client Dialog ---------- */
function ShareDialog({
  open,
  onClose,
  getToken,
}: {
  open: boolean;
  onClose: () => void;
  getToken: () => Promise<string>;
}) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  // 1322 personal details
  const [clientFileNumber, setClientFileNumber] = useState("");
  const [ownership, setOwnership] = useState(true);
  const [acquiredPreMarriage, setAcquiredPreMarriage] = useState(false);
  const [relatedPartySale, setRelatedPartySale] = useState(false);
  const [purchaseFromRelated, setPurchaseFromRelated] = useState(false);
  const [reitProfit, setReitProfit] = useState(false);
  const [taxWithheld, setTaxWithheld] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ whatsapp_url: string; upload_url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleCreate = async () => {
    if (!clientName.trim() || !clientFileNumber.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await apiFetch<{ token: string; upload_url: string; whatsapp_url: string }>(
        "/api/share/create",
        {
          method: "POST",
          body: JSON.stringify({
            client_name: clientName,
            client_phone: clientPhone,
            client_file_number: clientFileNumber,
            ownership,
            acquired_pre_marriage: acquiredPreMarriage,
            related_party_sale: relatedPartySale,
            purchase_from_related_party: purchaseFromRelated,
            reit_profit: reitProfit,
            tax_withheld: taxWithheld,
          }),
          token,
        }
      );
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה ביצירת קישור");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.upload_url) {
      navigator.clipboard.writeText(result.upload_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setClientName("");
    setClientPhone("");
    setClientFileNumber("");
    setOwnership(true);
    setAcquiredPreMarriage(false);
    setRelatedPartySale(false);
    setPurchaseFromRelated(false);
    setReitProfit(false);
    setTaxWithheld(false);
    setResult(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card mx-4 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-ink">שתף ללקוח</h3>

        {!result ? (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <p className="text-xs text-ink-tertiary">
              מלא את פרטי הלקוח לטופס 1322 וצור קישור להעלאת קבצים.
            </p>

            {/* Basic info */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink">פרטי לקוח</p>
              <input
                className="input"
                placeholder="שם הלקוח *"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <input
                className="input"
                placeholder="מספר תיק / ת.ז *"
                value={clientFileNumber}
                onChange={(e) => setClientFileNumber(e.target.value)}
                dir="ltr"
              />
              <input
                className="input"
                placeholder="טלפון הלקוח (לשליחה בוואטסאפ)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                dir="ltr"
              />
            </div>

            {/* 1322 checkbox fields */}
            <div className="space-y-2 rounded-xl border border-slate-200 bg-surface-subtle p-3">
              <p className="text-xs font-semibold text-ink">הגדרות נספח 1322</p>

              <label className="flex items-center gap-2 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={ownership}
                  onChange={(e) => setOwnership(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600"
                />
                בבעלותי (אם לא מסומן — בן/בת זוג)
              </label>

              <label className="flex items-center gap-2 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={acquiredPreMarriage}
                  onChange={(e) => setAcquiredPreMarriage(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600"
                />
                נרכש לפני הנישואין / בירושה
              </label>

              <label className="flex items-center gap-2 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={relatedPartySale}
                  onChange={(e) => setRelatedPartySale(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600"
                />
                מכירה לצד קשור
              </label>

              <label className="flex items-center gap-2 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={purchaseFromRelated}
                  onChange={(e) => setPurchaseFromRelated(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600"
                />
                רכישה מצד קשור
              </label>

              <label className="flex items-center gap-2 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={reitProfit}
                  onChange={(e) => setReitProfit(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600"
                />
                רווח מקרן השקעות במקרקעין
              </label>

              <label className="flex items-center gap-2 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={taxWithheld}
                  onChange={(e) => setTaxWithheld(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 accent-emerald-600"
                />
                נוכה מס במקור
              </label>
            </div>

            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <button
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={handleCreate}
              disabled={loading || !clientName.trim() || !clientFileNumber.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              {loading ? "יוצר..." : "צור קישור"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
              <Check className="mx-auto mb-2 h-6 w-6 text-green-600" />
              <p className="text-sm font-medium text-green-700">הקישור נוצר בהצלחה!</p>
            </div>

            {/* Copy link */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-surface-subtle p-3">
              <input
                className="flex-1 bg-transparent text-xs text-ink-secondary outline-none"
                value={result.upload_url}
                readOnly
                dir="ltr"
              />
              <button
                className="btn-secondary flex items-center gap-1 text-xs"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "הועתק!" : "העתק"}
              </button>
            </div>

            {/* WhatsApp send */}
            <a
              href={result.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" /> שלח ללקוח בוואטסאפ
            </a>

            <button className="btn-secondary w-full text-xs" onClick={handleClose}>
              סגור
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
export default function DashboardPage({ navigate, navigateToRestore, isAdmin }: Props) {
  const { user, userData, logout, refreshUserData, getToken } = useAuth();
  const credits = userData?.credits ?? 0;

  const [showFreeCheck, setShowFreeCheck] = useState(false);
  const [tradesFile, setTradesFile] = useState<File | null>(null);
  const [dividendsFile, setDividendsFile] = useState<File | null>(null);
  const [freeCheckResult, setFreeCheckResult] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [leadOpen, setLeadOpen] = useState(false);
  const [history, setHistory] = useState<ReportMeta[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyLimit, setHistoryLimit] = useState(3);
  const [shareOpen, setShareOpen] = useState(false);
  const [newReportOpen, setNewReportOpen] = useState(false);

  /* Fetch report history */
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await apiFetch<{ reports: ReportMeta[] }>("/api/reports/history", { token });
        setHistory(Array.isArray(res) ? res : res.reports ?? []);
      } catch {
        /* ignore */
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [getToken]);

  /* Free check handler */
  const runFreeCheck = useCallback(async () => {
    if (!tradesFile) return;
    setProcessing(true);
    setError("");
    setFreeCheckResult(null);
    try {
      const fd = new FormData();
      fd.append("trades_file", tradesFile);
      if (dividendsFile) fd.append("dividends_file", dividendsFile);
      const token = await getToken();
      const res = await apiFetch<{ tax_saved: number }>("/api/reports/free-check", { method: "POST", body: fd, token });
      setFreeCheckResult(res.tax_saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה בחישוב");
    } finally {
      setProcessing(false);
    }
  }, [tradesFile, dividendsFile]);

  const firstLetter = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ---- Header ---- */}
      <div className="card mb-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-lg font-semibold text-ink">
            {firstLetter}
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{user?.email}</p>
            <p className={`text-xs font-semibold ${credits > 0 ? "text-green-600" : "text-red-500"}`}>
              יתרה: {credits} קרדיטים
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary flex items-center gap-1.5 text-xs" onClick={() => navigate("pricing")}>
            <CreditCard className="h-3.5 w-3.5" /> רכישה
          </button>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
          {isAdmin && (
            <button className="btn-secondary flex items-center gap-1.5 text-xs" onClick={() => navigate("admin")}>
              <Shield className="h-3.5 w-3.5" /> ניהול
            </button>
          )}
          <button className="btn-secondary flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" /> יציאה
          </button>
        </div>
      </div>

      {/* ---- Free Check Section ---- */}
      <div className="card mb-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <Beaker className="h-5 w-5 text-ink" /> בדיקה חינמית
            </h2>
            <p className="mt-1 text-xs text-ink-tertiary">
              העלה את 2 הקבצים כמו במדריך וקבל כמה מס נחסך לפי פס&quot;ד — ללא שימוש בקרדיטים
            </p>
          </div>
          {!showFreeCheck && (
            <button className="btn-secondary text-xs" onClick={() => setShowFreeCheck(true)}>
              בדיקה חינמית
            </button>
          )}
        </div>

        {showFreeCheck && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Trades */}
              <label className="drop-zone cursor-pointer">
                <Upload className="mx-auto mb-2 h-6 w-6 text-ink-tertiary" />
                <span className="block text-sm font-medium text-ink">דוח עסקאות (Trades)</span>
                <span className="text-xs text-ink-tertiary">CSV בלבד</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setTradesFile(e.target.files?.[0] ?? null)}
                />
                {tradesFile && <span className="mt-1 block truncate text-xs text-ink-secondary">{tradesFile.name}</span>}
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
                {dividendsFile && <span className="mt-1 block truncate text-xs text-ink-secondary">{dividendsFile.name}</span>}
              </label>
            </div>
            <button className="btn-primary w-full" onClick={runFreeCheck} disabled={!tradesFile || processing}>
              {processing ? "מחשב..." : "חשב חיסכון במס"}
            </button>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            {freeCheckResult !== null && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-lg font-bold text-green-700">
                  חיסכון מס משוער לפי פס&quot;ד: ₪{freeCheckResult.toLocaleString("he-IL", { minimumFractionDigits: 2 })}
                </p>
                <button className="btn-primary mt-3 text-sm" onClick={() => setLeadOpen(true)}>
                  השאר פרטים
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ---- Guide ---- */}
      <div className="mb-6">
        <GuidePage />
      </div>

      {/* ---- Report History ---- */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <Archive className="h-5 w-5 text-ink" /> היסטוריית דוחות
          </h2>
          <button className="btn-primary flex items-center gap-1.5 text-xs" onClick={() => setNewReportOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> דוח חדש
          </button>
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-surface-subtle p-6 text-center">
            <FileSpreadsheet className="mx-auto mb-2 h-8 w-8 text-ink-tertiary" />
            <p className="text-sm text-ink-tertiary">אין דוחות עדיין. לחץ על «דוח חדש» כדי להתחיל!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, historyLimit).map((r) => (
              <div
                key={r.id}
                className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-surface-subtle sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{r.clientName}</p>
                  <p className="text-xs text-ink-tertiary">
                    {r.issuedAt} &middot; {r.reportPeriod} &middot; חשבון {r.accountId}
                  </p>
                </div>
                <button
                  className="btn-secondary flex items-center gap-1 text-xs whitespace-nowrap"
                  onClick={() => navigateToRestore(r)}
                >
                  <Archive className="h-3.5 w-3.5" /> שחזר
                </button>
              </div>
            ))}
            {history.length > historyLimit && (
              <button
                className="btn-ghost w-full py-2 text-xs"
                onClick={() => setHistoryLimit((l) => l + 5)}
              >
                הצג עוד ({history.length - historyLimit} נוספים)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lead dialog */}
      <LeadDialog
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        taxSaved={freeCheckResult ?? 0}
        userEmail={user?.email ?? ""}
        getToken={getToken}
      />

      {/* Share dialog */}
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        getToken={getToken}
      />

      {/* New Report choice dialog */}
      <NewReportDialog
        open={newReportOpen}
        onClose={() => setNewReportOpen(false)}
        credits={credits}
        onSelfUpload={() => { setNewReportOpen(false); navigate("generator"); }}
        onShareToClient={() => { setNewReportOpen(false); setShareOpen(true); }}
        onBuyCredits={() => { setNewReportOpen(false); navigate("pricing"); }}
      />

      {/* Footer – terms link */}
      <div className="mt-12 border-t border-edge pt-6 text-center">
        <button
          onClick={() => navigate("terms")}
          className="text-xs text-ink-tertiary underline transition-colors hover:text-ink"
        >
          תקנון אתר ותנאי שימוש
        </button>
      </div>
    </div>
  );
}
