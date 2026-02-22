"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Page } from "@/components/AppShell";
import { ArrowRight, Star, CreditCard, Gift, CheckCircle2, Smartphone, Zap } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  { id: 1, name: "חבילת בסיס", credits: 1, price: 100, originalPrice: 150, popular: false },
  { id: 2, name: "חבילת פרו", credits: 10, price: 800, originalPrice: 1200, popular: true },
  { id: 3, name: "חבילת משרד", credits: 20, price: 1400, originalPrice: 2100, popular: false },
];

const BIT_PHONE = "0502551542";

interface Props {
  navigate: (page: Page) => void;
}

export default function PricingPage({ navigate }: Props) {
  const { refreshUserData, getToken } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ---- Coupon redemption ---- */
  const redeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = await getToken();
      const res = await apiFetch<{ ok: boolean; credits_added: number; message: string }>(
        "/api/credits/redeem-coupon",
        {
          method: "POST",
          body: JSON.stringify({ code: couponCode.trim() }),
          token,
        }
      );
      setSuccess(res.message || `✅ נוספו ${res.credits_added} קרדיטים!`);
      setCouponCode("");
      await refreshUserData();
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null
          ? JSON.stringify(e)
          : String(e);
      setError(msg || "שגיאה במימוש הקופון");
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <button
        className="btn-secondary mb-4 flex items-center gap-1.5 text-sm"
        onClick={() => navigate("dashboard")}
      >
        <ArrowRight className="h-4 w-4" /> חזרה לדשבורד
      </button>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-ink">
          <CreditCard className="mb-1 inline h-6 w-6 text-ink" /> רכישת קרדיטים
        </h1>
        <p className="mt-1 text-sm text-ink-tertiary">כל קרדיט = דוח מס אחד</p>
        <p className="mt-1.5 text-xs text-ink-quaternary">* המחירים אינם כוללים מע״מ</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
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
              plan.popular ? "ring-2 ring-ink shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-0.5 text-xs font-semibold text-white">
                <Star className="mr-1 inline h-3 w-3" /> הכי פופולרי
              </span>
            )}

            <h3 className="text-base font-semibold text-ink">{plan.name}</h3>

            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
              <Zap className="h-3 w-3" /> מחיר השקה
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-ink">
                ₪{plan.price.toLocaleString("he-IL")}
              </p>
              <p className="text-base text-ink-tertiary line-through">
                ₪{plan.originalPrice.toLocaleString("he-IL")}
              </p>
            </div>

            <p className="mt-1 text-sm font-medium text-ink-tertiary">
              {plan.credits} {plan.credits === 1 ? "דוח" : "דוחות"}
            </p>

            <div className="mt-auto pt-5 space-y-2.5">
              <div className="rounded-lg border border-edge bg-surface-subtle p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink">
                  <Smartphone className="h-4 w-4" />
                  <span>העבר תשלום Bit בסך ₪{plan.price.toLocaleString("he-IL")}</span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-ink" dir="ltr">{BIT_PHONE}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-secondary">
                  ומיד תקבל קוד לכמות הקרדיטים להזנה במערכת תחת סעיף <span className="font-semibold">קוד קופון</span> למטה
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coupon Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card mt-8 p-6"
      >
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink">
          <Gift className="h-5 w-5" /> קוד קופון
        </h2>
        <p className="mb-4 text-xs text-ink-tertiary">
          קיבלת קוד קופון? הזן אותו כאן כדי לקבל קרדיטים
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="הזן קוד קופון"
            className="input flex-1 text-center font-mono tracking-widest"
            dir="ltr"
            onKeyDown={(e) => e.key === "Enter" && redeemCoupon()}
          />
          <button
            className="btn-primary whitespace-nowrap px-6 text-sm"
            onClick={redeemCoupon}
            disabled={couponLoading || !couponCode.trim()}
          >
            {couponLoading ? "מאמת..." : "מימוש"}
          </button>
        </div>
      </motion.div>

      {/* Payment info */}
      <div className="mt-6 text-center text-xs text-ink-tertiary">
        <p>
          לשאלות ותמיכה:{" "}
          <a href={`tel:+972${BIT_PHONE.slice(1)}`} className="underline">
            {BIT_PHONE}
          </a>
        </p>
      </div>
    </div>
  );
}
