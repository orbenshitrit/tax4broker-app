"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Page } from "@/components/AppShell";
import { ArrowRight, Star, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  { id: 1, name: "חבילת בסיס", credits: 1, price: 100, popular: false },
  { id: 2, name: "חבילת פרו",  credits: 10, price: 800, popular: true },
  { id: 3, name: "חבילת משרד", credits: 20, price: 1400, popular: false },
];

interface Props {
  navigate: (page: Page) => void;
}

export default function PricingPage({ navigate }: Props) {
  const { refreshUserData, getToken } = useAuth();
  const [quantities, setQuantities] = useState<Record<number, number>>({ 1: 1, 2: 1, 3: 1 });
  const [loading, setLoading] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const purchase = async (plan: typeof PLANS[0]) => {
    const qty = quantities[plan.id] || 1;
    setLoading(plan.id);
    setError("");
    setSuccess("");
    try {
      const token = await getToken();
      await apiFetch("/api/credits/purchase", {
        method: "POST",
        body: JSON.stringify({ plan_id: plan.id, quantity: qty }),
        token,
      });
      const totalCredits = plan.credits * qty;
      setSuccess(
        qty > 1
          ? `✅ נוספו ${totalCredits} קרדיטים (${qty} × ${plan.credits})!`
          : `✅ נוספו ${totalCredits} קרדיטים!`
      );
      await refreshUserData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה ברכישה");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <button className="btn-secondary mb-4 flex items-center gap-1.5 text-sm" onClick={() => navigate("dashboard")}>
        <ArrowRight className="h-4 w-4" /> חזרה לדשבורד
      </button>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-ink">
          <CreditCard className="mb-1 inline h-6 w-6 text-indigo-500" /> רכישת קרדיטים
        </h1>
        <p className="mt-1 text-sm text-ink-tertiary">כל קרדיט = דוח מס אחד</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plan.id * 0.08 }}
            className={`card relative flex flex-col p-6 transition-shadow ${
              plan.popular ? "ring-2 ring-indigo-500 shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-semibold text-white">
                <Star className="mr-1 inline h-3 w-3" /> הכי פופולרי
              </span>
            )}

            <h3 className="text-base font-semibold text-ink">{plan.name}</h3>

            <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
              ₪{plan.price.toLocaleString("he-IL")}
            </p>

            <p className="mt-1 text-sm font-medium text-ink-tertiary">{plan.credits} דוחות</p>

            <div className="mt-auto pt-5">
              <div className="mb-3">
                <label className="mb-1 block text-xs text-ink-tertiary">כמות</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quantities[plan.id]}
                  onChange={(e) =>
                    setQuantities((q) => ({ ...q, [plan.id]: Math.max(1, parseInt(e.target.value) || 1) }))
                  }
                  className="input text-center"
                />
              </div>
              <button
                className={`w-full py-2.5 text-sm font-medium ${plan.popular ? "btn-primary" : "btn-secondary"}`}
                onClick={() => purchase(plan)}
                disabled={loading === plan.id}
              >
                {loading === plan.id
                  ? "מעבד..."
                  : `רכוש ${plan.credits * (quantities[plan.id] || 1)} קרדיטים`}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
