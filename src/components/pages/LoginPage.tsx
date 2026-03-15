"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { FileSpreadsheet, Mail, Lock, UserPlus, KeyRound } from "lucide-react";

type Tab = "login" | "register" | "reset";

export default function LoginPage() {
  const { login, loginWithGoogle, register, resetPassword } = useAuth();
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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink">
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-edge" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-ink-tertiary">או</span></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try { await loginWithGoogle(); } catch (e: any) {
                    const code = e?.code || "";
                    if (code === "auth/popup-closed-by-user") {
                      /* user closed it, no error */
                    } else if (code === "auth/popup-blocked") {
                      setError("הדפדפן חסם פופאפים. אנא אפשר חלונות קופצים בדפדפן.");
                    } else if (code === "auth/unauthorized-domain") {
                      setError("הדומיין לא מאושר ב-Firebase. נא להוסיף את הדומיין ב-Firebase Console → Authentication → Settings.");
                    } else if (code === "auth/operation-not-allowed") {
                      setError("התחברות עם Google לא מופעלת. נא להפעיל ב-Firebase Console → Authentication → Sign-in method → Google.");
                    } else {
                      setError(`שגיאה בהתחברות עם Google: ${code || e?.message || "לא ידוע"}`);
                    }
                  }
                  finally { setLoading(false); }
                }}
                disabled={loading}
                className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                היכנס עם Google
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-edge" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-ink-tertiary">או</span></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try { await loginWithGoogle(); } catch (e: any) {
                    const code = e?.code || "";
                    if (code !== "auth/popup-closed-by-user") {
                      setError(`שגיאה בהרשמה עם Google: ${code || e?.message || "לא ידוע"}`);
                    }
                  }
                  finally { setLoading(false); }
                }}
                disabled={loading}
                className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                הירשם עם Google
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
