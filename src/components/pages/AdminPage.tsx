"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Page } from "@/components/AppShell";
import {
  ArrowRight,
  Shield,
  Mail,
  CreditCard,
  Plus,
  RotateCcw,
  Pencil,
  Trash2,
  Gift,
  Search,
  Globe,
  FileText,
  Users,
  BarChart3,
  UserPlus,
  UserMinus,
  Tag,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Percent,
  Ticket,
  Settings,
  Eye,
  Beaker,
  Megaphone,
  Link2,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════ Types ═══════════════════ */

interface UserRow {
  id: string;
  email: string;
  credits: number;
  role?: string;
}

interface CouponRow {
  code: string;
  type: string;
  credits: number;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  usedBy: string[];
  active: boolean;
  description: string;
  createdAt: number;
  expiresAt?: number;
}

interface AdminStats {
  totalUsers: number;
  totalCredits: number;
  totalReports: number;
  activeCoupons: number;
  totalCoupons: number;
}

interface ReportRow {
  id: string;
  clientName: string;
  accountId: string;
  year: number;
  issuedAt: string;
  reportPeriod: string;
}

interface DistributorRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  commission_pct: number;
  token: string;
  status: string;
  created_at: string;
  leads_count: number;
  total_saved: number;
  commission_amount: number;
}

type AdminTab = "dashboard" | "users" | "coupons" | "seo" | "content" | "admins" | "free-checks" | "distributors";

interface Props {
  navigate: (page: Page) => void;
}

/* ═══════════════════ Helpers ═══════════════════ */

const SUPER_ADMIN_EMAIL = "orbenshitrit631@gmail.com";

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
        active
          ? "bg-ink text-white shadow-sm"
          : "text-ink-secondary hover:bg-surface-muted"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-ink">{value}</p>
        <p className="text-xs text-ink-tertiary">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════ Main Component ═══════════════════ */

export default function AdminPage({ navigate }: Props) {
  const { userData, getToken } = useAuth();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const isAdmin = userData?.role === "admin";
  const isSuperAdmin = userData?.email === SUPER_ADMIN_EMAIL;

  const flash = useCallback((type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12 text-ink-tertiary" />
        <p className="text-lg font-semibold text-ink">אין הרשאת גישה</p>
        <p className="mt-1 text-sm text-ink-tertiary">רק מנהלי מערכת יכולים לגשת לעמוד זה.</p>
        <button className="btn-secondary mt-6" onClick={() => navigate("dashboard")}>
          <ArrowRight className="h-4 w-4" /> חזרה לדשבורד
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button className="btn-secondary flex items-center gap-1.5 text-sm" onClick={() => navigate("dashboard")}>
          <ArrowRight className="h-4 w-4" /> חזרה
        </button>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Shield className="h-5 w-5" /> פאנל ניהול
        </h1>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-4 rounded-xl border p-3 text-center text-sm ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1.5 rounded-xl border border-edge bg-surface-subtle p-1.5">
        <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<BarChart3 className="h-3.5 w-3.5" />} label="סקירה" />
        <TabButton active={tab === "users"} onClick={() => setTab("users")} icon={<Users className="h-3.5 w-3.5" />} label="משתמשים" />
        <TabButton active={tab === "coupons"} onClick={() => setTab("coupons")} icon={<Gift className="h-3.5 w-3.5" />} label="קופונים" />
        <TabButton active={tab === "seo"} onClick={() => setTab("seo")} icon={<Globe className="h-3.5 w-3.5" />} label="SEO" />
        <TabButton active={tab === "content"} onClick={() => setTab("content")} icon={<FileText className="h-3.5 w-3.5" />} label="תוכן" />
        <TabButton active={tab === "free-checks"} onClick={() => setTab("free-checks")} icon={<Beaker className="h-3.5 w-3.5" />} label="בדיקה חינמית" />
        <TabButton active={tab === "distributors"} onClick={() => setTab("distributors")} icon={<Megaphone className="h-3.5 w-3.5" />} label="מפיצים" />
        {isSuperAdmin && (
          <TabButton active={tab === "admins"} onClick={() => setTab("admins")} icon={<Shield className="h-3.5 w-3.5" />} label="הרשאות" />
        )}
      </div>

      {/* Tab content */}
      {tab === "dashboard" && <DashboardTab getToken={getToken} />}
      {tab === "users" && <UsersTab getToken={getToken} flash={flash} isSuperAdmin={isSuperAdmin} />}
      {tab === "coupons" && <CouponsTab getToken={getToken} flash={flash} />}
      {tab === "seo" && <SeoTab getToken={getToken} flash={flash} />}
      {tab === "content" && <ContentTab getToken={getToken} flash={flash} />}
      {tab === "admins" && isSuperAdmin && <AdminsTab getToken={getToken} flash={flash} />}
      {tab === "free-checks" && <FreeCheckLeadsTab getToken={getToken} />}
      {tab === "distributors" && <DistributorsTab getToken={getToken} flash={flash} />}
    </div>
  );
}


/* ═══════════════════ Dashboard Tab ═══════════════════ */

function DashboardTab({ getToken }: { getToken: () => Promise<string> }) {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<AdminStats>("/api/admin/stats", { token });
        setStats(data);
      } catch { /* */ }
    })();
  }, [getToken]);

  if (!stats) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="משתמשים" value={stats.totalUsers} icon={<Users className="h-5 w-5 text-ink-secondary" />} />
      <StatCard label="דוחות" value={stats.totalReports} icon={<FileText className="h-5 w-5 text-ink-secondary" />} />
      <StatCard label="קרדיטים (סה״כ)" value={stats.totalCredits} icon={<CreditCard className="h-5 w-5 text-ink-secondary" />} />
      <StatCard label="קופונים פעילים" value={stats.activeCoupons} icon={<Gift className="h-5 w-5 text-ink-secondary" />} />
    </div>
  );
}


/* ═══════════════════ Users Tab ═══════════════════ */

function UsersTab({
  getToken,
  flash,
  isSuperAdmin,
}: {
  getToken: () => Promise<string>;
  flash: (type: "success" | "error", msg: string) => void;
  isSuperAdmin: boolean;
}) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resetValue, setResetValue] = useState(0);
  const [setValues, setSetValues] = useState<Record<string, number>>({});
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userReports, setUserReports] = useState<ReportRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<{ users: UserRow[] }>("/api/admin/users", { token });
        setUsers(data.users || []);
      } catch { /* */ }
      finally { setLoading(false); }
    })();
  }, [getToken]);

  const filtered = users.filter(
    (u) => !search || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const resetAll = async () => {
    try {
      const token = await getToken();
      await apiFetch("/api/admin/reset-all-credits", {
        method: "POST",
        body: JSON.stringify({ new_amount: resetValue }),
        token,
      });
      flash("success", `אופסו קרדיטים ל-${users.length} משתמשים (ערך: ${resetValue})`);
      setUsers((prev) => prev.map((u) => ({ ...u, credits: resetValue })));
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    }
  };

  const addCredits = async (userId: string, amount: number) => {
    try {
      const token = await getToken();
      await apiFetch("/api/admin/add-credits", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, amount }),
        token,
      });
      flash("success", `נוספו ${amount} קרדיטים!`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, credits: u.credits + amount } : u)));
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    }
  };

  const setCredits = async (userId: string) => {
    const val = setValues[userId] ?? 0;
    try {
      const token = await getToken();
      await apiFetch("/api/admin/set-credits", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, credits: val }),
        token,
      });
      flash("success", `הקרדיטים עודכנו ל-${val}`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, credits: val } : u)));
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    }
  };

  const toggleUserReports = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    setReportsLoading(true);
    try {
      const token = await getToken();
      const data = await apiFetch<{ reports: ReportRow[] }>(`/api/admin/user-reports/${userId}`, { token });
      setUserReports(data.reports || []);
    } catch { setUserReports([]); }
    finally { setReportsLoading(false); }
  };

  const setRole = async (userId: string, role: string) => {
    try {
      const token = await getToken();
      await apiFetch("/api/admin/set-role", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, role }),
        token,
      });
      flash("success", role === "admin" ? "הרשאת מנהל ניתנה!" : "הרשאת מנהל בוטלה");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search + reset */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              placeholder="חפש לפי אימייל..."
              className="input pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-ink-tertiary">איפוס לכולם</label>
              <input
                type="number"
                min={0}
                value={resetValue}
                onChange={(e) => setResetValue(parseInt(e.target.value) || 0)}
                className="input w-20 text-center text-sm"
              />
            </div>
            <button className="btn-secondary flex items-center gap-1 text-xs whitespace-nowrap" onClick={resetAll}>
              <RotateCcw className="h-3 w-3" /> אפס
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-ink-tertiary">סה״כ: {users.length} משתמשים</p>
      </div>

      {/* User list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-ink-tertiary">לא נמצאו משתמשים.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="card overflow-hidden">
              <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                {/* Info */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-ink-tertiary" />
                  <span className="truncate text-sm text-ink">{u.email}</span>
                  <span className="flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-0.5 text-xs font-semibold text-ink-secondary">
                    <CreditCard className="h-3 w-3" /> {u.credits}
                  </span>
                  {u.role === "admin" && (
                    <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button className="btn-secondary px-2 py-1 text-xs" onClick={() => addCredits(u.id, 1)}>
                    <Plus className="mr-0.5 inline h-3 w-3" /> 1
                  </button>
                  <button className="btn-secondary px-2 py-1 text-xs" onClick={() => addCredits(u.id, 10)}>
                    <Plus className="mr-0.5 inline h-3 w-3" /> 10
                  </button>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      className="input w-14 px-1.5 py-1 text-center text-xs"
                      value={setValues[u.id] ?? u.credits}
                      onChange={(e) => setSetValues((v) => ({ ...v, [u.id]: parseInt(e.target.value) || 0 }))}
                    />
                    <button className="btn-secondary px-1.5 py-1 text-xs" onClick={() => setCredits(u.id)}>
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                  {isSuperAdmin && u.role !== "admin" && (
                    <button
                      className="btn-secondary px-2 py-1 text-xs text-green-600"
                      onClick={() => setRole(u.id, "admin")}
                      title="הפוך למנהל"
                    >
                      <UserPlus className="h-3 w-3" />
                    </button>
                  )}
                  {isSuperAdmin && u.role === "admin" && u.email !== SUPER_ADMIN_EMAIL && (
                    <button
                      className="btn-secondary px-2 py-1 text-xs text-red-500"
                      onClick={() => setRole(u.id, "user")}
                      title="בטל הרשאת מנהל"
                    >
                      <UserMinus className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    className="btn-secondary px-2 py-1 text-xs"
                    onClick={() => toggleUserReports(u.id)}
                    title="הצג דוחות"
                  >
                    {expandedUser === u.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* Expanded reports */}
              <AnimatePresence>
                {expandedUser === u.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-edge"
                  >
                    <div className="bg-surface-subtle p-3">
                      {reportsLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                        </div>
                      ) : userReports.length === 0 ? (
                        <p className="text-center text-xs text-ink-tertiary">אין דוחות למשתמש זה.</p>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-ink-secondary">
                            {userReports.length} דוחות
                          </p>
                          {userReports.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between rounded-lg bg-surface p-2 text-xs"
                            >
                              <div>
                                <span className="font-medium text-ink">{r.clientName}</span>
                                <span className="mx-1 text-ink-tertiary">·</span>
                                <span className="text-ink-tertiary">חשבון {r.accountId}</span>
                              </div>
                              <div className="text-ink-tertiary">
                                {r.year} · {r.issuedAt}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════ Coupons Tab ═══════════════════ */

function CouponsTab({
  getToken,
  flash,
}: {
  getToken: () => Promise<string>;
  flash: (type: "success" | "error", msg: string) => void;
}) {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"credits" | "discount">("credits");
  const [newCredits, setNewCredits] = useState(1);
  const [newDiscount, setNewDiscount] = useState(10);
  const [newMaxUses, setNewMaxUses] = useState(1);
  const [newExpDays, setNewExpDays] = useState(0);
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const loadCoupons = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await apiFetch<{ coupons: CouponRow[] }>("/api/admin/coupons", { token });
      setCoupons(data.coupons || []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const createCoupon = async () => {
    setCreating(true);
    try {
      const token = await getToken();
      const res = await apiFetch<{ code: string }>("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: newCode,
          coupon_type: newType,
          credits: newType === "credits" ? newCredits : 0,
          discount_percent: newType === "discount" ? newDiscount : 0,
          max_uses: newMaxUses,
          expires_days: newExpDays,
          description: newDesc,
        }),
        token,
      });
      flash("success", `קופון ${res.code} נוצר בהצלחה!`);
      setShowCreate(false);
      setNewCode("");
      setNewDesc("");
      loadCoupons();
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה ביצירת קופון");
    } finally {
      setCreating(false);
    }
  };

  const deleteCoupon = async (code: string) => {
    try {
      const token = await getToken();
      await apiFetch(`/api/admin/coupons/${code}`, { method: "DELETE", token });
      flash("success", `קופון ${code} נמחק`);
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    }
  };

  const toggleCoupon = async (code: string, active: boolean) => {
    try {
      const token = await getToken();
      await apiFetch(`/api/admin/coupons/${code}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
        token,
      });
      setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active } : c)));
      flash("success", active ? "קופון הופעל" : "קופון הושבת");
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    flash("success", `הקוד ${code} הועתק!`);
  };

  return (
    <div className="space-y-4">
      {/* Create button */}
      <div className="flex justify-between">
        <p className="text-sm font-medium text-ink-secondary">{coupons.length} קופונים</p>
        <button className="btn-primary flex items-center gap-1.5 text-xs" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-3.5 w-3.5" /> צור קופון
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card space-y-3 p-4">
              <h3 className="text-sm font-semibold text-ink">יצירת קופון חדש</h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">קוד (ריק = אוטומטי)</label>
                  <input
                    className="input text-center font-mono tracking-widest"
                    dir="ltr"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="AUTO"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">סוג</label>
                  <div className="flex gap-2">
                    <button
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        newType === "credits" ? "border-ink bg-ink text-white" : "border-edge text-ink-secondary"
                      }`}
                      onClick={() => setNewType("credits")}
                    >
                      <Ticket className="h-3.5 w-3.5" /> טיקט (קרדיטים)
                    </button>
                    <button
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        newType === "discount" ? "border-ink bg-ink text-white" : "border-edge text-ink-secondary"
                      }`}
                      onClick={() => setNewType("discount")}
                    >
                      <Percent className="h-3.5 w-3.5" /> הנחה %
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {newType === "credits" ? (
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">כמות קרדיטים</label>
                    <input
                      type="number"
                      min={1}
                      className="input text-center"
                      value={newCredits}
                      onChange={(e) => setNewCredits(parseInt(e.target.value) || 1)}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">אחוז הנחה</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="input text-center"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(parseInt(e.target.value) || 10)}
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">שימושים מקס׳</label>
                  <input
                    type="number"
                    min={1}
                    className="input text-center"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">תוקף (ימים, 0=ללא)</label>
                  <input
                    type="number"
                    min={0}
                    className="input text-center"
                    value={newExpDays}
                    onChange={(e) => setNewExpDays(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-ink-tertiary">תיאור (אופציונלי)</label>
                <input className="input" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="למשל: קופון VIP ללקוח X" />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button className="btn-secondary text-xs" onClick={() => setShowCreate(false)}>ביטול</button>
                <button className="btn-primary text-xs" onClick={createCoupon} disabled={creating}>
                  {creating ? "יוצר..." : "צור קופון"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="card p-8 text-center">
          <Gift className="mx-auto mb-2 h-8 w-8 text-ink-tertiary" />
          <p className="text-sm text-ink-tertiary">אין קופונים עדיין</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <div
              key={c.code}
              className={`card flex flex-col gap-2 p-3 sm:flex-row sm:items-center ${
                !c.active ? "opacity-50" : ""
              }`}
            >
              {/* Code + info */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  onClick={() => copyCode(c.code)}
                  className="flex items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-ink transition-colors hover:bg-accent-muted"
                  dir="ltr"
                  title="העתק"
                >
                  {c.code} <Copy className="h-3 w-3 text-ink-tertiary" />
                </button>

                {c.type === "credits" ? (
                  <span className="badge badge-green">
                    <Ticket className="h-3 w-3" /> {c.credits} קרדיטים
                  </span>
                ) : (
                  <span className="badge badge-indigo">
                    <Percent className="h-3 w-3" /> {c.discountPercent}% הנחה
                  </span>
                )}

                <span className="text-[11px] text-ink-tertiary">
                  {c.usedCount}/{c.maxUses} שימושים
                </span>

                {c.description && (
                  <span className="hidden text-[11px] text-ink-tertiary sm:inline">· {c.description}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  className={`btn-secondary px-2 py-1 text-xs ${c.active ? "text-amber-600" : "text-green-600"}`}
                  onClick={() => toggleCoupon(c.code, !c.active)}
                  title={c.active ? "השבת" : "הפעל"}
                >
                  {c.active ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                </button>
                <button
                  className="btn-secondary px-2 py-1 text-xs text-red-500"
                  onClick={() => deleteCoupon(c.code)}
                  title="מחק"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════ SEO Tab ═══════════════════ */

function SeoTab({
  getToken,
  flash,
}: {
  getToken: () => Promise<string>;
  flash: (type: "success" | "error", msg: string) => void;
}) {
  const [seo, setSeo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<Record<string, string>>("/api/admin/seo", { token });
        setSeo(data);
      } catch { /* */ }
      finally { setLoading(false); }
    })();
  }, [getToken]);

  const save = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      await apiFetch("/api/admin/seo", {
        method: "PUT",
        body: JSON.stringify(seo),
        token,
      });
      flash("success", "הגדרות SEO נשמרו בהצלחה!");
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => {
    setSeo((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  const fields: { key: string; label: string; hint: string; multiline?: boolean }[] = [
    { key: "meta_title", label: "Meta Title", hint: "כותרת שמופיעה בגוגל (50-60 תווים)" },
    { key: "meta_description", label: "Meta Description", hint: "תיאור שמופיע בתוצאות חיפוש (150-160 תווים)", multiline: true },
    { key: "meta_keywords", label: "Meta Keywords", hint: "מילות מפתח מופרדות בפסיקים" },
    { key: "canonical_url", label: "Canonical URL", hint: "https://tax4broker.com" },
    { key: "robots", label: "Robots", hint: "index, follow" },
    { key: "og_title", label: "Open Graph Title", hint: "כותרת בשיתוף ברשתות חברתיות" },
    { key: "og_description", label: "Open Graph Description", hint: "תיאור בשיתוף", multiline: true },
    { key: "og_image", label: "Open Graph Image URL", hint: "כתובת תמונה (1200x630px מומלץ)" },
    { key: "og_url", label: "Open Graph URL", hint: "https://tax4broker.com" },
    { key: "twitter_card", label: "Twitter Card", hint: "summary_large_image" },
    { key: "twitter_title", label: "Twitter Title", hint: "כותרת בטוויטר" },
    { key: "twitter_description", label: "Twitter Description", hint: "תיאור בטוויטר" },
    { key: "twitter_image", label: "Twitter Image URL", hint: "כתובת תמונה" },
    { key: "google_site_verification", label: "Google Site Verification", hint: "קוד אימות Google Search Console" },
    { key: "schema_name", label: "Schema.org — Name", hint: "Tax4Broker" },
    { key: "schema_description", label: "Schema.org — Description", hint: "תיאור למנועי חיפוש", multiline: true },
    { key: "schema_url", label: "Schema.org — URL", hint: "https://tax4broker.com" },
    { key: "schema_logo", label: "Schema.org — Logo URL", hint: "כתובת לוגו" },
    { key: "schema_type", label: "Schema.org — Type", hint: "SoftwareApplication / WebApplication" },
    { key: "extra_head_tags", label: "תגיות HTML נוספות ב-<head>", hint: "HTML גולמי שיוזרק ל-head", multiline: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">הגדרות SEO</h3>
          <p className="text-[11px] text-ink-tertiary">כל השדות שגוגל מזהה ומשתמש בהם לדירוג</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5 text-xs" onClick={save} disabled={saving}>
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="card p-3">
            <label className="mb-0.5 block text-xs font-semibold text-ink">{f.label}</label>
            <p className="mb-1.5 text-[10px] text-ink-tertiary">{f.hint}</p>
            {f.multiline ? (
              <textarea
                className="input min-h-[60px] resize-y text-sm"
                dir="auto"
                value={seo[f.key] || ""}
                onChange={(e) => update(f.key, e.target.value)}
              />
            ) : (
              <input
                className="input text-sm"
                dir="auto"
                value={seo[f.key] || ""}
                onChange={(e) => update(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-1.5" onClick={save} disabled={saving}>
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════ Content Tab ═══════════════════ */

function ContentTab({
  getToken,
  flash,
}: {
  getToken: () => Promise<string>;
  flash: (type: "success" | "error", msg: string) => void;
}) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<Record<string, string>>("/api/admin/content", { token });
        setContent(data);
      } catch { /* */ }
      finally { setLoading(false); }
    })();
  }, [getToken]);

  const save = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      // Remove internal fields before sending
      const cleanContent = { ...content };
      delete cleanContent.updatedAt;
      delete cleanContent.updatedBy;
      await apiFetch("/api/admin/content", {
        method: "PUT",
        body: JSON.stringify({ content: cleanContent }),
        token,
      });
      flash("success", "תוכן האתר עודכן בהצלחה!");
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  // Define editable content fields — matching the landing page structure
  const sections: { title: string; fields: { key: string; label: string; multiline?: boolean }[] }[] = [
    {
      title: "Hero (כותרת ראשית)",
      fields: [
        { key: "hero_title", label: "כותרת ראשית" },
        { key: "hero_subtitle", label: "תת כותרת", multiline: true },
        { key: "hero_cta", label: "טקסט כפתור CTA" },
      ],
    },
    {
      title: "יתרונות",
      fields: [
        { key: "features_title", label: "כותרת סקשן יתרונות" },
        { key: "feature_1_title", label: "יתרון 1 — כותרת" },
        { key: "feature_1_desc", label: "יתרון 1 — תיאור", multiline: true },
        { key: "feature_2_title", label: "יתרון 2 — כותרת" },
        { key: "feature_2_desc", label: "יתרון 2 — תיאור", multiline: true },
        { key: "feature_3_title", label: "יתרון 3 — כותרת" },
        { key: "feature_3_desc", label: "יתרון 3 — תיאור", multiline: true },
        { key: "feature_4_title", label: "יתרון 4 — כותרת" },
        { key: "feature_4_desc", label: "יתרון 4 — תיאור", multiline: true },
        { key: "feature_5_title", label: "יתרון 5 — כותרת" },
        { key: "feature_5_desc", label: "יתרון 5 — תיאור", multiline: true },
        { key: "feature_6_title", label: "יתרון 6 — כותרת" },
        { key: "feature_6_desc", label: "יתרון 6 — תיאור", multiline: true },
      ],
    },
    {
      title: "איך זה עובד (How It Works)",
      fields: [
        { key: "how_title", label: "כותרת סקשן" },
        { key: "how_step_1", label: "שלב 1" },
        { key: "how_step_2", label: "שלב 2" },
        { key: "how_step_3", label: "שלב 3" },
      ],
    },
    {
      title: "שאלות נפוצות (FAQ)",
      fields: [
        { key: "faq_title", label: "כותרת סקשן" },
        { key: "faq_1_q", label: "שאלה 1" },
        { key: "faq_1_a", label: "תשובה 1", multiline: true },
        { key: "faq_2_q", label: "שאלה 2" },
        { key: "faq_2_a", label: "תשובה 2", multiline: true },
        { key: "faq_3_q", label: "שאלה 3" },
        { key: "faq_3_a", label: "תשובה 3", multiline: true },
        { key: "faq_4_q", label: "שאלה 4" },
        { key: "faq_4_a", label: "תשובה 4", multiline: true },
        { key: "faq_5_q", label: "שאלה 5" },
        { key: "faq_5_a", label: "תשובה 5", multiline: true },
      ],
    },
    {
      title: "CTA (קריאה לפעולה)",
      fields: [
        { key: "cta_title", label: "כותרת CTA" },
        { key: "cta_subtitle", label: "תת כותרת CTA", multiline: true },
        { key: "cta_button", label: "טקסט כפתור CTA" },
      ],
    },
    {
      title: "טקסטים כלליים",
      fields: [
        { key: "footer_copyright", label: "טקסט זכויות יוצרים" },
        { key: "pricing_title", label: "כותרת עמוד מחירון (באפליקציה)" },
        { key: "pricing_subtitle", label: "תת כותרת מחירון" },
        { key: "support_phone", label: "טלפון תמיכה" },
        { key: "support_email", label: "אימייל תמיכה" },
        { key: "whatsapp_message", label: "הודעת WhatsApp ברירת מחדל" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">עריכת תוכן האתר</h3>
          <p className="text-[11px] text-ink-tertiary">ערוך את הטקסטים שמופיעים בדף הנחיתה ובאפליקציה</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5 text-xs" onClick={save} disabled={saving}>
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="card overflow-hidden">
          <div className="border-b border-edge bg-surface-subtle px-4 py-2.5">
            <h4 className="text-xs font-semibold text-ink">{section.title}</h4>
          </div>
          <div className="space-y-3 p-4">
            {section.fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-[11px] font-medium text-ink-secondary">{f.label}</label>
                {f.multiline ? (
                  <textarea
                    className="input min-h-[50px] resize-y text-sm"
                    value={content[f.key] || ""}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    className="input text-sm"
                    value={content[f.key] || ""}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-1.5" onClick={save} disabled={saving}>
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════ Admins Tab ═══════════════════ */

function AdminsTab({
  getToken,
  flash,
}: {
  getToken: () => Promise<string>;
  flash: (type: "success" | "error", msg: string) => void;
}) {
  const [admins, setAdmins] = useState<{ id: string; email: string; isSuperAdmin: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const loadAdmins = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await apiFetch<{ admins: typeof admins }>("/api/admin/admins", { token });
      setAdmins(data.admins || []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const grantAdmin = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    try {
      const token = await getToken();
      await apiFetch("/api/admin/admins/grant", {
        method: "POST",
        body: JSON.stringify({ email: newEmail.trim().toLowerCase() }),
        token,
      });
      flash("success", `הרשאת מנהל ניתנה ל-${newEmail}`);
      setNewEmail("");
      loadAdmins();
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    } finally {
      setAdding(false);
    }
  };

  const revokeAdmin = async (email: string) => {
    try {
      const token = await getToken();
      await apiFetch("/api/admin/admins/revoke", {
        method: "POST",
        body: JSON.stringify({ email }),
        token,
      });
      flash("success", `הרשאת מנהל בוטלה ל-${email}`);
      loadAdmins();
    } catch (e: unknown) {
      flash("error", e instanceof Error ? e.message : "שגיאה");
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">ניהול הרשאות מנהל</h3>
        <p className="mb-3 text-[11px] text-ink-tertiary">
          רק מנהל ראשי ({SUPER_ADMIN_EMAIL}) יכול לנהל הרשאות.
        </p>

        {/* Add admin */}
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="אימייל המשתמש"
            className="input flex-1 text-sm"
            dir="ltr"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && grantAdmin()}
          />
          <button className="btn-primary flex items-center gap-1 text-xs" onClick={grantAdmin} disabled={adding}>
            <UserPlus className="h-3.5 w-3.5" /> {adding ? "מוסיף..." : "הוסף מנהל"}
          </button>
        </div>
      </div>

      {/* Admins list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {admins.map((a) => (
            <div
              key={a.id}
              className="card flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-ink-secondary" />
                <span className="text-sm text-ink" dir="ltr">{a.email}</span>
                {a.isSuperAdmin && (
                  <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">SUPER</span>
                )}
              </div>
              {!a.isSuperAdmin && (
                <button
                  className="btn-secondary flex items-center gap-1 px-2.5 py-1 text-xs text-red-500"
                  onClick={() => revokeAdmin(a.email)}
                >
                  <UserMinus className="h-3 w-3" /> הסר
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════ Distributors Tab ═══════════════════ */

function DistributorsTab({ getToken, flash }: { getToken: () => Promise<string>; flash: (type: "success" | "error", msg: string) => void }) {
  const [distributors, setDistributors] = useState<DistributorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCommission, setNewCommission] = useState("0");
  const [saving, setSaving] = useState(false);

  // Edit commission
  const [editId, setEditId] = useState<string | null>(null);
  const [editPct, setEditPct] = useState("");

  const fetchDistributors = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await apiFetch<{ distributors: DistributorRow[] }>("/api/distributors", { token });
      setDistributors(res.distributors ?? []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { fetchDistributors(); }, [fetchDistributors]);

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setSaving(true);
    try {
      const token = await getToken();
      await apiFetch("/api/distributors", {
        token,
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          commission_pct: parseFloat(newCommission) || 0,
        }),
      });
      flash("success", "מפיץ נוסף בהצלחה");
      setNewName(""); setNewEmail(""); setNewPhone(""); setNewCommission("0");
      setShowAdd(false);
      await fetchDistributors();
    } catch { flash("error", "שגיאה"); }
    finally { setSaving(false); }
  };

  const handleUpdateCommission = async (id: string) => {
    try {
      const token = await getToken();
      await apiFetch(`/api/distributors/${id}`, {
        token,
        method: "PUT",
        body: JSON.stringify({ commission_pct: parseFloat(editPct) || 0 }),
      });
      flash("success", "אחוז תגמול עודכן");
      setEditId(null);
      await fetchDistributors();
    } catch { flash("error", "שגיאה"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק מפיץ זה?")) return;
    try {
      const token = await getToken();
      await apiFetch(`/api/distributors/${id}`, { token, method: "DELETE" });
      flash("success", "מפיץ נמחק");
      await fetchDistributors();
    } catch { flash("error", "שגיאה"); }
  };

  const copyLink = (tok: string) => {
    navigator.clipboard.writeText(`https://app.tax4broker.com/free-check/${tok}`);
    flash("success", "קישור הועתק");
  };

  const filtered = distributors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
  );

  const grandTotal = filtered.reduce((s, d) => s + d.total_saved, 0);
  const grandCommission = filtered.reduce((s, d) => s + d.commission_amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-semibold text-ink">ניהול מפיצים</h2>
        <button className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-3.5 w-3.5" /> הוסף מפיץ
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="card space-y-3 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-secondary">שם מפיץ *</label>
                  <input className="input" placeholder="משה כהן" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-secondary">אימייל *</label>
                  <input className="input" placeholder="moshe@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-secondary">טלפון</label>
                  <input className="input" placeholder="050-0000000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-secondary">אחוז תגמול %</label>
                  <input className="input" type="number" min="0" max="100" step="0.5" placeholder="3" value={newCommission} onChange={(e) => setNewCommission(e.target.value)} dir="ltr" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setShowAdd(false)}>ביטול</button>
                <button className="btn-primary px-3 py-1.5 text-xs" onClick={handleAdd} disabled={saving || !newName.trim() || !newEmail.trim()}>
                  {saving ? "שומר..." : "שמור מפיץ"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
        <input className="input pr-9" placeholder="חיפוש לפי שם או אימייל..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-ink-tertiary">סה&quot;כ מפיצים</p>
              <p className="text-lg font-bold text-ink">{filtered.length}</p>
            </div>
            <div>
              <p className="text-xs text-ink-tertiary">סה&quot;כ לידים</p>
              <p className="text-lg font-bold text-ink">{filtered.reduce((s, d) => s + d.leads_count, 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-xs text-ink-tertiary">חיסכון משוער כולל</p>
              <p className="text-lg font-bold text-emerald-600">₪{grandTotal.toLocaleString("he-IL", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-ink-tertiary">תגמול כולל</p>
              <p className="text-lg font-bold text-purple-600">₪{grandCommission.toLocaleString("he-IL", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <Megaphone className="mx-auto mb-2 h-8 w-8 text-ink-tertiary" />
          <p className="text-sm text-ink-tertiary">{distributors.length === 0 ? "אין מפיצים עדיין" : "לא נמצאו תוצאות"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((dist) => (
            <div key={dist.id} className="card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink">{dist.name}</p>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                      {dist.commission_pct}%
                    </span>
                  </div>
                  <p className="text-xs text-ink-tertiary mt-0.5">{dist.email}{dist.phone ? ` · ${dist.phone}` : ""}</p>

                  {/* Stats row */}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    <span className="text-ink-secondary"><strong>{dist.leads_count}</strong> לידים</span>
                    <span className="text-emerald-600">חיסכון: ₪{dist.total_saved.toLocaleString("he-IL", { minimumFractionDigits: 2 })}</span>
                    <span className="text-purple-600">תגמול: ₪{dist.commission_amount.toLocaleString("he-IL", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button className="btn-secondary flex items-center gap-1 px-2 py-1 text-xs" onClick={() => copyLink(dist.token)} title="העתק קישור">
                    <Copy className="h-3 w-3" /> קישור
                  </button>

                  {editId === dist.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        className="input w-16 py-1 text-xs"
                        type="number" min="0" max="100" step="0.5"
                        value={editPct}
                        onChange={(e) => setEditPct(e.target.value)}
                        dir="ltr"
                        autoFocus
                      />
                      <button className="rounded bg-emerald-600 p-1 text-white hover:bg-emerald-700" onClick={() => handleUpdateCommission(dist.id)}>
                        <Check className="h-3 w-3" />
                      </button>
                      <button className="rounded bg-slate-200 p-1 text-ink hover:bg-slate-300" onClick={() => setEditId(null)}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-secondary flex items-center gap-1 px-2 py-1 text-xs"
                      onClick={() => { setEditId(dist.id); setEditPct(String(dist.commission_pct)); }}
                    >
                      <Percent className="h-3 w-3" /> תגמול
                    </button>
                  )}

                  <button className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(dist.id)} title="מחק">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════ Free Check Leads Tab ═══════════════════ */

interface LeadRow {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  tax_saved: number;
  created_at: string;
  distributor_id?: string;
  distributor_name?: string;
  source?: string;
}

function FreeCheckLeadsTab({ getToken }: { getToken: () => Promise<string> }) {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [distributors, setDistributors] = useState<DistributorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const [leadsRes, distRes] = await Promise.all([
          apiFetch<{ leads: LeadRow[] }>("/api/free-check-share/leads", { token }),
          apiFetch<{ distributors: DistributorRow[] }>("/api/distributors", { token }),
        ]);
        setLeads(leadsRes.leads ?? []);
        setDistributors(distRes.distributors ?? []);
      } catch { /* */ }
      finally { setLoading(false); }
    })();
  }, [getToken]);

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.client_name.toLowerCase().includes(search.toLowerCase()) ||
      l.client_email.toLowerCase().includes(search.toLowerCase()) ||
      l.client_phone.includes(search);

    if (filterSource === "all") return matchSearch;
    if (filterSource === "admin") return matchSearch && l.source !== "distributor";
    return matchSearch && l.distributor_id === filterSource;
  });

  const totalSaved = filtered.reduce((s, l) => s + l.tax_saved, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">לידים מבדיקה חינמית</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {filtered.length} לידים
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
            ₪{totalSaved.toLocaleString("he-IL", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            className="input pr-9"
            placeholder="חיפוש לפי שם, אימייל או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-full sm:w-48"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="all">כל המקורות</option>
          <option value="admin">Admin ישיר</option>
          {distributors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <Beaker className="mx-auto mb-2 h-8 w-8 text-ink-tertiary" />
          <p className="text-sm text-ink-tertiary">{leads.length === 0 ? "אין לידים עדיין" : "לא נמצאו תוצאות"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <div key={lead.id} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{lead.client_name}</p>
                <p className="text-xs text-ink-tertiary">
                  {lead.client_email} &middot; {lead.client_phone}
                </p>
                <p className="text-xs text-ink-tertiary">{lead.created_at}</p>
                {lead.distributor_name && (
                  <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                    מפיץ: {lead.distributor_name}
                  </span>
                )}
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg font-bold text-emerald-600">
                  ₪{lead.tax_saved.toLocaleString("he-IL", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-ink-tertiary">חיסכון משוער</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
