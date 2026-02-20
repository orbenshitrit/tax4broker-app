"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Page } from "@/components/AppShell";
import { ArrowRight, Shield, Mail, CreditCard, Plus, RotateCcw, Pencil } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  credits: number;
}

interface Props {
  navigate: (page: Page) => void;
}

export default function AdminPage({ navigate }: Props) {
  const { userData } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetValue, setResetValue] = useState(0);
  const [setValues, setSetValues] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  const isAdmin = userData?.role === "admin";

  /* Fetch users */
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const data = await apiFetch<UserRow[]>("/api/admin/users");
        setUsers(data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  const flash = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

  /* Actions */
  const resetAll = async () => {
    await apiFetch("/api/admin/reset-all-credits", {
      method: "POST",
      body: JSON.stringify({ value: resetValue }),
    });
    flash(`אופסו קרדיטים ל-${users.length} משתמשים (ערך: ${resetValue})`);
    setUsers((prev) => prev.map((u) => ({ ...u, credits: resetValue })));
  };

  const addCredits = async (userId: string, amount: number) => {
    await apiFetch("/api/admin/add-credits", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, amount }),
    });
    flash(`נוספו ${amount} קרדיטים!`);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, credits: u.credits + amount } : u)));
  };

  const setCredits = async (userId: string) => {
    const val = setValues[userId] ?? 0;
    await apiFetch("/api/admin/set-credits", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, credits: val }),
    });
    flash(`הקרדיטים עודכנו ל-${val}`);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, credits: val } : u)));
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg text-red-500">⛔ אין הרשאת גישה.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <button className="btn-secondary mb-4 flex items-center gap-1.5 text-sm" onClick={() => navigate("dashboard")}>
        <ArrowRight className="h-4 w-4" /> חזרה לדשבורד
      </button>

      {/* Title */}
      <h1 className="mb-6 text-center text-xl font-semibold text-ink">
        <Shield className="mb-1 inline h-6 w-6 text-indigo-500" /> פאנל ניהול
      </h1>

      {/* Feedback */}
      {feedback && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600">
          {feedback}
        </div>
      )}

      {/* Global actions */}
      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink-secondary">⚙️ פעולות כלליות</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-ink-tertiary">ערך איפוס לכל המשתמשים</label>
            <input
              type="number"
              min={0}
              value={resetValue}
              onChange={(e) => setResetValue(parseInt(e.target.value) || 0)}
              className="input"
            />
          </div>
          <button className="btn-secondary flex items-center gap-1.5 text-xs whitespace-nowrap" onClick={resetAll}>
            <RotateCcw className="h-3.5 w-3.5" /> אפס קרדיטים לכולם
          </button>
        </div>
      </div>

      {/* User list */}
      <div className="card p-5">
        <p className="mb-3 text-sm font-semibold text-ink">
          סה&quot;כ משתמשים: {users.length}
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-ink-tertiary">לא נמצאו משתמשים.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center"
              >
                {/* Email + credits */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-ink-tertiary" />
                  <span className="truncate text-sm text-ink">{u.email}</span>
                  <span className="flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-0.5 text-xs font-semibold text-ink-secondary">
                    <CreditCard className="h-3 w-3" /> {u.credits}
                  </span>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <button
                    className="btn-secondary px-2.5 py-1 text-xs"
                    onClick={() => addCredits(u.id, 10)}
                  >
                    <Plus className="mr-0.5 inline h-3 w-3" /> 10
                  </button>
                  <button
                    className="btn-secondary px-2.5 py-1 text-xs"
                    onClick={() => addCredits(u.id, 1)}
                  >
                    <Plus className="mr-0.5 inline h-3 w-3" /> 1
                  </button>

                  {/* Set credits */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      className="input w-16 px-2 py-1 text-center text-xs"
                      value={setValues[u.id] ?? u.credits}
                      onChange={(e) =>
                        setSetValues((v) => ({ ...v, [u.id]: parseInt(e.target.value) || 0 }))
                      }
                    />
                    <button
                      className="btn-secondary px-2 py-1 text-xs"
                      onClick={() => setCredits(u.id)}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
