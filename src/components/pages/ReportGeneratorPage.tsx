"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Page, ReportMeta } from "@/components/AppShell";
import {
  ArrowRight,
  Upload,
  Play,
  Download,
  FileSpreadsheet,
  FilePlus,
  Archive,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GuidePage from "@/components/pages/GuidePage";

/* ---- Types ---- */
interface ReportFile {
  data: string; // base64
  name: string;
  mime: string;
  label: string;
}

interface ReportOutputs {
  report_id?: string;
  client_name: string;
  account_id: string;
  year: number;
  h1_count: number;
  h2_count: number;
  files: Record<string, ReportFile>;
  sales_profit_h1?: number;
  losses_h1?: number;
  proceeds_h1?: number;
  sales_profit_h2?: number;
  losses_h2?: number;
  proceeds_h2?: number;
  dividends_h1_ils?: number;
  dividends_h2_ils?: number;
  save_status?: string;
}

interface Props {
  navigate: (page: Page) => void;
  selectedReport: ReportMeta | null;
  clearSelectedReport: () => void;
}

/* ---------- Progress Steps ---------- */
const PROGRESS_STEPS = [
  { pct: 15, text: "טוען שערי חליפין..." },
  { pct: 30, text: "קורא קבצים..." },
  { pct: 50, text: "מחשב רווח הון..." },
  { pct: 60, text: "קורא דיבידנדים..." },
  { pct: 75, text: "יוצר קבצי דוח..." },
  { pct: 90, text: "שומר..." },
  { pct: 100, text: "הושלם!" },
];

/* ---------- Annex 1322 Dialog ---------- */
function Annex1322Dialog({
  open,
  onClose,
  reportOutputs,
  onAnnexGenerated,
  getToken,
}: {
  open: boolean;
  onClose: () => void;
  reportOutputs: ReportOutputs;
  onAnnexGenerated: (files: Record<string, ReportFile>) => void;
  getToken: () => Promise<string>;
}) {
  const [year, setYear] = useState(reportOutputs.year || 2024);
  const [sellerName, setSellerName] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [ownership, setOwnership] = useState("בבעלותי");
  const [preMarriage, setPreMarriage] = useState("לא");
  const [relatedSale, setRelatedSale] = useState("לא");
  const [relatedPurchase, setRelatedPurchase] = useState("לא");
  const [reit, setReit] = useState("לא");
  const [taxWithheld, setTaxWithheld] = useState("לא");
  const [carryoverLosses, setCarryoverLosses] = useState("0");
  const [nonSecLosses, setNonSecLosses] = useState("0");
  const [businessLosses, setBusinessLosses] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setError("");
    if (!sellerName.trim()) { setError("נא להזין שם מוכר"); return; }
    if (!fileNumber.trim()) { setError("נא להזין מספר תיק הלקוח"); return; }

    const numCarry = parseFloat(carryoverLosses);
    const numNonSec = parseFloat(nonSecLosses);
    const numBusiness = parseFloat(businessLosses);
    if (isNaN(numCarry)) { setError("ערך לא תקין עבור הפסדי הון מועברים"); return; }
    if (isNaN(numNonSec)) { setError("ערך לא תקין עבור קיזוז הפסדי הון שאינם מניירות ערך"); return; }
    if (isNaN(numBusiness)) { setError("ערך לא תקין עבור קיזוז הפסדים שוטפים מעסק"); return; }

    setLoading(true);
    try {
      const body = {
        report_id: reportOutputs.report_id || null,
        report_year: year,
        seller_name: sellerName,
        client_file_number: fileNumber,
        ownership: ownership === "בבעלותי",
        acquired_pre_marriage: preMarriage === "כן",
        related_party_sale: relatedSale === "כן",
        purchase_from_related_party: relatedPurchase === "כן",
        reit_profit: reit === "כן",
        tax_withheld: taxWithheld === "כן",
        carryover_losses: numCarry,
        offset_non_securities: numNonSec,
        offset_business_losses: numBusiness,
        sales_profit_h1: reportOutputs.sales_profit_h1 ?? 0,
        losses_h1: reportOutputs.losses_h1 ?? 0,
        proceeds_h1: reportOutputs.proceeds_h1 ?? 0,
        sales_profit_h2: reportOutputs.sales_profit_h2 ?? 0,
        losses_h2: reportOutputs.losses_h2 ?? 0,
        proceeds_h2: reportOutputs.proceeds_h2 ?? 0,
        dividends_h1_ils: reportOutputs.dividends_h1_ils ?? 0,
        dividends_h2_ils: reportOutputs.dividends_h2_ils ?? 0,
      };
      const token = await getToken();
      const raw = await apiFetch<Record<string, string>>("/api/reports/annex-1322", {
        method: "POST",
        body: JSON.stringify(body),
        token,
      });
      /* Transform backend response to ReportFile format */
      const annexFiles: Record<string, ReportFile> = {};
      if (raw.h1_pdf_b64) {
        annexFiles.annex_1322_pdf = {
          data: raw.h1_pdf_b64,
          name: raw.h1_name || "טופס_1322_H1.pdf",
          mime: "application/pdf",
          label: "📄 טופס 1322 — ינואר–יוני",
        };
      }
      if (raw.h2_pdf_b64) {
        annexFiles.annex_1322_pdf_h2 = {
          data: raw.h2_pdf_b64,
          name: raw.h2_name || "טופס_1322_H2.pdf",
          mime: "application/pdf",
          label: "📄 טופס 1322 — יולי–דצמבר",
        };
      }
      onAnnexGenerated(annexFiles);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה בהפקת נספח 1322");
    } finally {
      setLoading(false);
    }
  };

  const RadioGroup = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-secondary">{label}</label>
      <div className="flex gap-3">
        {["לא", "כן"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              value === v ? "bg-ink text-white" : "bg-surface-muted text-ink-secondary hover:bg-slate-200"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card my-8 w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">נספח 1322</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-tertiary hover:bg-surface-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">{error}</div>
        )}

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pl-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-secondary">מהי שנת הדוח?</label>
            <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2021, 2022, 2023, 2024, 2025].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-secondary">שם המוכר (נישום)</label>
            <input className="input" value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-secondary">מה מספר תיק הלקוח (תעודת זהות)</label>
            <input className="input" value={fileNumber} onChange={(e) => setFileNumber(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-secondary">של מי הבעלות על הנייר ערך?</label>
            <div className="flex gap-3">
              {["בבעלותי", "בבעלות בן/בת זוגי"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setOwnership(v)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    ownership === v ? "bg-ink text-white" : "bg-surface-muted text-ink-secondary hover:bg-slate-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <RadioGroup label="האם הנייר נרכש שנה לפני הנישואין/בירושה" value={preMarriage} onChange={setPreMarriage} />
          <RadioGroup label="מכירה לצד קשור" value={relatedSale} onChange={setRelatedSale} />
          <RadioGroup label="רכישה מצד קשור" value={relatedPurchase} onChange={setRelatedPurchase} />
          <RadioGroup label="האם הרווח הוא מקרן השקעות במקרקעין" value={reit} onChange={setReit} />
          <RadioGroup label="נוכה מס במקור" value={taxWithheld} onChange={setTaxWithheld} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-secondary">
              הפסדי הון מועברים מניירות ערך (0 = אין)
            </label>
            <input className="input" type="number" value={carryoverLosses} onChange={(e) => setCarryoverLosses(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-secondary">
              קיזוז הפסדי הון שאינם מניירות ערך (0 = אין)
            </label>
            <input className="input" type="number" value={nonSecLosses} onChange={(e) => setNonSecLosses(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-secondary">
              קיזוז הפסדים שוטפים מעסק (0 = אין)
            </label>
            <input className="input" type="number" value={businessLosses} onChange={(e) => setBusinessLosses(e.target.value)} />
          </div>
        </div>

        <button className="btn-primary mt-5 w-full" onClick={submit} disabled={loading}>
          {loading ? "מפיק..." : "הפקת טפסי 1322"}
        </button>
      </motion.div>
    </div>
  );
}

/* ---------- Download Button ---------- */
function DownloadBtn({ file, icon, className = "" }: { file: ReportFile; icon: React.ReactNode; className?: string }) {
  const download = () => {
    const bytes = atob(file.data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: file.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={download} className={`btn-secondary flex w-full items-center justify-center gap-2 py-3 ${className}`}>
      {icon}
      <span className="truncate">{file.label}</span>
    </button>
  );
}

/* ---------- Report Generator ---------- */
export default function ReportGeneratorPage({ navigate, selectedReport, clearSelectedReport }: Props) {
  const { userData, refreshUserData, getToken } = useAuth();
  const credits = userData?.credits ?? 0;

  const [tradesFile, setTradesFile] = useState<File | null>(null);
  const [dividendsFile, setDividendsFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
  const [outputs, setOutputs] = useState<ReportOutputs | null>(null);
  const [annexOpen, setAnnexOpen] = useState(false);
  const [annexShown, setAnnexShown] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  /* ---- Restore handler ---- */
  const handleRestore = useCallback(async () => {
    if (!selectedReport) return;
    setRestoring(true);
    setError("");
    try {
      // Download files from backend for each known key
      const fileKeys = ["main_excel", "ref_excel_a", "ref_excel_b", "annex_1322_pdf", "annex_1322_pdf_h2"];
      const downloadedFiles: Record<string, ReportFile> = {};
      for (const key of fileKeys) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || ""}/api/reports/restore/${selectedReport.id}/${key}`,
            { headers: { Authorization: `Bearer ${await (await import("@/lib/firebase")).auth.currentUser?.getIdToken()}` } }
          );
          if (!res.ok) continue;
          const blob = await res.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
            reader.readAsDataURL(blob);
          });
          const isPdf = key.includes("pdf");
          const labels: Record<string, string> = {
            main_excel: `📗 דוח ראשי — ${selectedReport.fileName || "report"}.xlsx`,
            ref_excel_a: `📙 אסמכתה ל-1325 א`,
            ref_excel_b: `📙 אסמכתה ל-1325 ב`,
            annex_1322_pdf: `📄 טופס 1322 — ינואר–יוני`,
            annex_1322_pdf_h2: `📄 טופס 1322 — יולי–דצמבר`,
          };
          downloadedFiles[key] = {
            data: base64,
            name: isPdf ? `${key}_${selectedReport.clientName}.pdf` : `${key}_${selectedReport.clientName}.xlsx`,
            mime: isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            label: labels[key] || key,
          };
        } catch {
          /* file not found — skip */
        }
      }
      if (Object.keys(downloadedFiles).length === 0) {
        setError("לא נמצאו קבצים שמורים בדוח זה.");
      } else {
        setOutputs({
          report_id: selectedReport.id,
          client_name: selectedReport.clientName,
          account_id: selectedReport.accountId,
          year: selectedReport.year,
          h1_count: 0,
          h2_count: 0,
          files: downloadedFiles,
          save_status: "restored",
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה בשחזור");
    } finally {
      setRestoring(false);
    }
  }, [selectedReport]);

  /* ---- Process report ---- */
  const processReport = useCallback(async () => {
    if (!tradesFile) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    setProgressText("מעבד...");

    /* simulate progress steps */
    let step = 0;
    const progressInterval = setInterval(() => {
      if (step < PROGRESS_STEPS.length) {
        setProgress(PROGRESS_STEPS[step].pct);
        setProgressText(PROGRESS_STEPS[step].text);
        step++;
      }
    }, 1500);

    try {
      const fd = new FormData();
      fd.append("trades_file", tradesFile);
      if (dividendsFile) fd.append("dividends_file", dividendsFile);

      const token = await getToken();
      const raw = await apiFetch<any>("/api/reports/process", { method: "POST", body: fd, token });
      clearInterval(progressInterval);
      setProgress(100);
      setProgressText("הושלם!");

      /* Transform file objects from backend format (data_b64 → data, add mime/label) */
      const files: Record<string, ReportFile> = {};
      if (raw.files) {
        const labels: Record<string, string> = {
          main_excel: `📗 דוח ראשי — ${raw.client_name}.xlsx`,
          ref_excel_a: "📙 אסמכתה ל-1325 א",
          ref_excel_b: "📙 אסמכתה ל-1325 ב",
        };
        for (const [key, f] of Object.entries(raw.files) as [string, any][]) {
          files[key] = {
            data: f.data_b64 || f.data || "",
            name: f.name || `${key}.xlsx`,
            mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            label: labels[key] || key,
          };
        }
      }
      setOutputs({ ...raw, files } as ReportOutputs);
      setAnnexShown(false);
      await refreshUserData();
    } catch (e: unknown) {
      clearInterval(progressInterval);
      setError(e instanceof Error ? e.message : "שגיאה בעיבוד הדוח");
    } finally {
      setProcessing(false);
    }
  }, [tradesFile, dividendsFile, refreshUserData]);

  /* ---- Annex generated callback ---- */
  const handleAnnexGenerated = useCallback((files: Record<string, ReportFile>) => {
    if (!outputs) return;
    setOutputs({ ...outputs, files: { ...outputs.files, ...files } });
    setAnnexShown(true);
  }, [outputs]);

  /* Auto-open annex 1322 dialog when report completes */
  useEffect(() => {
    if (outputs && !annexShown && outputs.save_status !== "restored" && !annexOpen) {
      setAnnexOpen(true);
    }
  }, [outputs, annexShown, annexOpen]);

  /* ---- New Report ---- */
  const newReport = () => {
    setOutputs(null);
    setTradesFile(null);
    setDividendsFile(null);
    setError("");
    setProgress(0);
    setAnnexShown(false);
    clearSelectedReport();
  };

  /* ============ DOWNLOAD PAGE ============ */
  if (outputs) {
    const { files } = outputs;
    const hasAnnex = files.annex_1322_pdf || files.annex_1322_pdf_h2;

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Success header */}
        <div className="mb-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
          <h1 className="text-xl font-semibold text-ink">כל הקבצים נטענו באופן תקין</h1>
          <p className="mt-1 text-sm text-ink-tertiary">כל הקבצים מוכנים להורדה</p>
        </div>

        {/* Client info */}
        <div className="card mb-6 flex flex-wrap items-center justify-center gap-4 px-6 py-3 text-sm text-ink-secondary">
          <span><strong>לקוח:</strong> {outputs.client_name}</span>
          <span><strong>חשבון:</strong> {outputs.account_id}</span>
          <span><strong>שנה:</strong> {outputs.year}</span>
        </div>

        {/* Save status */}
        {outputs.save_status === "local" && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            הדוח לא נשמר ב-Firestore. הוא נשמר מקומית בלבד.
          </div>
        )}
        {outputs.save_status === "error" && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            שמירת הדוח ל-Firestore נכשלה.
          </div>
        )}

        {/* Download buttons */}
        <div className="space-y-3">
          {files.main_excel && (
            <DownloadBtn
              file={files.main_excel}
              icon={<FileSpreadsheet className="h-5 w-5 text-green-600" />}
              className="border-green-200 bg-green-50 hover:bg-green-100 text-green-800 font-medium"
            />
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {files.ref_excel_a && (
              <DownloadBtn file={files.ref_excel_a} icon={<Download className="h-4 w-4" />} />
            )}
            {files.ref_excel_b && (
              <DownloadBtn file={files.ref_excel_b} icon={<Download className="h-4 w-4" />} />
            )}
          </div>

          {/* Annex 1322 */}
          {!hasAnnex && !annexShown && outputs.save_status !== "restored" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                נספח 1322 עדיין לא מולא ולכן לא יופיע בדוח.
              </div>
              <button className="btn-primary mt-3 w-full text-sm" onClick={() => setAnnexOpen(true)}>
                <FilePlus className="mr-1.5 inline h-4 w-4" /> הוסף נספח 1322
              </button>
            </div>
          )}

          {hasAnnex && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {files.annex_1322_pdf && (
                <DownloadBtn file={files.annex_1322_pdf} icon={<Download className="h-4 w-4" />} />
              )}
              {files.annex_1322_pdf_h2 && (
                <DownloadBtn file={files.annex_1322_pdf_h2} icon={<Download className="h-4 w-4" />} />
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 space-y-3">
          <button className="btn-primary w-full py-3" onClick={() => navigate("dashboard")}>
            <ArrowRight className="mr-1.5 inline h-4 w-4" /> חזרה לדשבורד
          </button>
          <button className="btn-secondary w-full py-3" onClick={newReport}>
            <FileSpreadsheet className="mr-1.5 inline h-4 w-4" /> הפק דוח חדש
          </button>
        </div>

        {/* Annex dialog */}
        <Annex1322Dialog
          open={annexOpen}
          onClose={() => setAnnexOpen(false)}
          reportOutputs={outputs}
          onAnnexGenerated={handleAnnexGenerated}
          getToken={getToken}
        />
      </div>
    );
  }

  /* ============ UPLOAD PAGE ============ */
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back button */}
      <button className="btn-secondary mb-4 flex items-center gap-1.5 text-sm" onClick={() => navigate("dashboard")}>
        <ArrowRight className="h-4 w-4" /> חזרה לדשבורד
      </button>

      {/* Title */}
      <h1 className="mb-6 text-center text-xl font-semibold text-ink">
        <FileSpreadsheet className="mb-1 inline h-6 w-6 text-ink" /> הפקת דוח מס חדש
      </h1>

      {/* Guide */}
      <div className="mb-6">
        <GuidePage />
      </div>

      {/* Restore mode */}
      {selectedReport && (
        <div className="card mb-6 border-edge bg-surface-muted p-4">
          <p className="mb-3 text-sm text-ink-secondary">
            🔄 מצב שחזור — ניתן להוריד את הדוח השמור: <strong>{selectedReport.clientName}</strong>
          </p>
          <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={handleRestore} disabled={restoring}>
            <Archive className="h-4 w-4" />
            {restoring ? "טוען קבצים..." : "הורד דוח שמור"}
          </button>
        </div>
      )}

      {/* No credits warning */}
      {credits <= 0 && !selectedReport && (
        <div className="card mb-6 border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            אין קרדיטים זמינים. נא לרכוש חבילה.
          </div>
          <button className="btn-primary mt-3 text-sm" onClick={() => navigate("pricing")}>
            💳 עבור לרכישה
          </button>
        </div>
      )}

      {/* Upload section */}
      {(credits > 0 || selectedReport) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="mb-3 text-base font-semibold text-ink">📁 העלאת קבצים</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="drop-zone cursor-pointer text-center">
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
            <label className="drop-zone cursor-pointer text-center">
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
                <span className="mt-1 block truncate text-xs text-ink-secondary">{dividendsFile.name}</span>
              )}
            </label>
          </div>

          {/* Terms clickwrap checkbox */}
          <div className="mt-5 rounded-xl border border-edge bg-surface-muted p-4" dir="rtl">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-ink-tertiary accent-ink"
              />
              <span className="text-xs leading-relaxed text-ink-secondary">
                קראתי ואני מסכים{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="font-semibold text-ink underline"
                >
                  לתנאי השימוש ולהגבלת האחריות
                </button>
                . אני מצהיר כי הנתונים שהזנתי מדויקים, מבוססים על רכישות מ-2006 ואילך בלבד, וכי אינני בעל שליטה.
              </span>
            </label>
          </div>

          {/* Process button */}
          <button
            className="btn-primary mt-4 w-full py-3"
            onClick={processReport}
            disabled={!tradesFile || processing || !termsAccepted}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {progressText}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Play className="h-4 w-4" /> צור דוח מסכם
              </span>
            )}
          </button>

          {/* Progress bar */}
          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="progress-bar">
                  <motion.div
                    className="progress-bar h-full rounded-full bg-ink"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-ink-tertiary">{progress}%</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}
        </motion.div>
      )}

      {/* Terms modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-edge bg-surface shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              {/* Sticky header */}
              <div className="flex items-center justify-between border-b border-edge px-6 py-4">
                <h2 className="text-lg font-bold text-ink">תנאי שימוש והגבלת אחריות</h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="rounded-full p-1.5 hover:bg-surface-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4 text-xs leading-relaxed text-ink-secondary">
                  <div>
                    <h3 className="mb-1 font-semibold text-ink">1. מהות השירות</h3>
                    <p>המערכת, לרבות כל מחשבון, פלט, או כלי עזר להפקת טפסי 1322, 1325 ודוחות מס אחרים (להלן: &quot;השירות&quot;), מסופקת ככלי עזר טכני-חישובי בלבד לצורך נוחות המשתמש. השימוש בשירות אינו יוצר יחסי רואה חשבון-לקוח, יחסי יועץ מס-לקוח או יחסי נאמנות מכל סוג שהוא בין מפעילי האתר לבין המשתמש. התוצאות אינן חוות דעת מקצועית, ייעוץ מס, ייעוץ פיננסי, ואינן תחליף לבחינה פרטנית ע&quot;י איש מקצוע מוסמך.</p>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-ink">2. אספקה &quot;כמות שהוא&quot; (AS-IS)</h3>
                    <p>השירות ניתן &quot;AS-IS&quot; ו-&quot;AS-AVAILABLE&quot;. מפעילי האתר אינם מתחייבים כי המערכת נקייה מטעויות, באגים, שגיאות עיבוד או אי-דיוקים. מפעילי האתר מסירים מעצמם כל אחריות, מפורשת או משתמעת. דיני המס, התקנות והפסיקה משתנים מעת לעת ואין התחייבות לעדכניות.</p>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-ink">3. אחריות המשתמש</h3>
                    <p>המשתמש נושא באחריות הבלעדית, המלאה והמוחלטת לכל נתון המוזן למערכת ולכל פלט המופק ממנה. המשתמש מצהיר כי: (א) כל הנתונים הנוגעים להפסדים מועברים הוזנו במלואם ובמדויק; (ב) המשתמש לא היה &quot;בעל שליטה&quot; (10% או יותר מאמצעי השליטה) באף אחת מהחברות הרלוונטיות; (ג) כל ניירות הערך המוזנים נרכשו מ-01/01/2006 ואילך.</p>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-ink">4. הגבלת חבות</h3>
                    <p>בשום מקרה לא יישאו מפעילי האתר, מפתחיו, מנהליו, עובדיו או מי מטעמם, באחריות לכל נזק ישיר, עקיף, תוצאתי, עונשי, אגבי או מיוחד, לרבות הפסד כספי, תשלום מס ביתר, קנסות וכד&apos;. סך האחריות המקסימלית לא תעלה על הסכום ששולם עבור השירות ב-12 החודשים האחרונים.</p>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-ink">5. שיפוי</h3>
                    <p>המשתמש מתחייב לשפות, להגן ולפצות את מפעילי האתר בגין כל נזק, הפסד, חבות, דרישה או הוצאה שייגרמו כתוצאה מדרישה או תביעה של צד שלישי (לרבות רשות המיסים) הנובעת משימוש המשתמש במערכת.</p>
                  </div>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="border-t border-edge px-6 py-4">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  סגור
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
