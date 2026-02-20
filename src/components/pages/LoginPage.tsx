"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { FileSpreadsheet, Mail, Lock, UserPlus, KeyRound } from "lucide-react";

type Tab = "login" | "register" | "reset";

export default function LoginPage() {
  const { login, register, resetPassword } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("נא למלא אימייל וסיסמה"); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("אימייל או סיסמה שגויים");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("נא למלא את כל השדות"); return; }
    if (password !== password2) { setError("הסיסמאות לא תואמות"); return; }
    if (password.length < 6) { setError("הסיסמה חייבת להיות לפחות 6 תווים"); return; }
    setLoading(true);
    try {
      await register(email, password);
    } catch {
      setError("שגיאה ביצירת חשבון — ייתכן שהאימייל כבר רשום");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("נא להזין אימייל"); return; }
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess("קישור לאיפוס סיסמה נשלח לאימייל שלך");
    } catch {
      setError("שגיאה בשליחת קישור");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "login", label: "כניסה", icon: <Lock className="h-4 w-4" /> },
    { id: "register", label: "הרשמה", icon: <UserPlus className="h-4 w-4" /> },
    { id: "reset", label: "שכחתי סיסמה", icon: <KeyRound className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500">
            <FileSpreadsheet className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Tax4Broker</h1>
          <p className="mt-1 text-sm text-ink-tertiary">CRM לרואי חשבון</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl bg-surface-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(""); setSuccess(""); }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  tab === t.id
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-tertiary hover:text-ink-secondary"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-secondary">אימייל</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-secondary">סיסמה</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "מתחבר..." : "כניסה"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-secondary">אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-secondary">סיסמה</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="לפחות 6 תווים"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-secondary">אימות סיסמה</label>
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="input"
                  placeholder="שוב"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "נוצר..." : "צור חשבון"}
              </button>
            </form>
          )}

          {/* Reset Form */}
          {tab === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-ink-tertiary">
                הזן את האימייל שלך ונשלח לך קישור להגדרת סיסמה חדשה.
                <br />
                <strong>עובד גם אם נרשמת דרך Google!</strong>
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-secondary">אימייל</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "שולח..." : "שלח קישור"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
