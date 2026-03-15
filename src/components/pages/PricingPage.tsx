"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { Page } from "@/components/AppShell";
import { ArrowRight, Star, CreditCard, Gift, CheckCircle2, Zap, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  { id: 1, name: "חבילת בסיס", credits: 1, price: 100, originalPrice: 150, popular: false },
  { id: 2, name: "חבילת פרו", credits: 10, price: 800, originalPrice: 1200, popular: true },
  { id: 3, name: "חבילת משרד", credits: 20, price: 1400, originalPrice: 2100, popular: false },
];

interface Props {
  navigate: (page: Page) => void;
}

export default function PricingPage({ navigate }: Props) {
  const { refreshUserData, getToken } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState<number | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* ---- SUMIT payment ---- */
  const handlePurchase = async (planId: number) => {
    setPayingPlanId(planId);
    setError("");
    setSuccess("");
    try {
      const token = await getToken();
      const payload: Record<string, unknown> = { plan_id: planId, quantity: 1 };
      if (discountApplied && discountCode) {
        payload.coupon_code = discountCode;
      }
      const res = await apiFetch<{ ok: boolean; payment_url: string }>(
        "/api/payments/create-link",
        {
          method: "POST",
          body: JSON.stringify(payload),
          token,
        }
      );
      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        setError("לא התקבל קישור תשלום");
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null
          ? JSON.stringify(e)
          : String(e);
      setError(msg || "שגיאה ביצירת קישור תשלום");
    } finally {
      setPayingPlanId(null);
    }
  };

  /* ---- Apply discount code ---- */
  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setError("");
    try {
      const token = await getToken();
      const res = await apiFetch<{ ok: boolean; discount_percent: number }>(
        "/api/payments/validate-coupon",
        {
          method: "POST",
          body: JSON.stringify({ coupon_code: discountCode.trim() }),
          token,
        }
      );
      setDiscountPercent(res.discount_percent);
      setDiscountApplied(true);
      setSuccess(`קוד הנחה ${res.discount_percent}% הוחל בהצלחה!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "קוד הנחה לא תקין");
      setDiscountApplied(false);
      setDiscountPercent(0);
    }
  };

  /* ---- Coupon redemption (credits) ---- */
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

      {/* Discount Code for Payment */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="card mt-6 p-4"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value.toUpperCase());
              setDiscountApplied(false);
              setDiscountPercent(0);
            }}
            placeholder="קוד הנחה לתשלום"
            className="input flex-1 text-center font-mono tracking-widest"
            dir="ltr"
            onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
          />
          <button
            className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              discountApplied
                ? "bg-green-100 text-green-700 border border-green-300"
                : "btn-primary"
            }`}
            onClick={applyDiscount}
            disabled={!discountCode.trim() || discountApplied}
          >
            {discountApplied ? `✓ ${discountPercent}% הנחה` : "החל הנחה"}
          </button>
        </div>
      </motion.div>

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
                ₪{discountApplied
                  ? Math.round(plan.price * (1 - discountPercent / 100)).toLocaleString("he-IL")
                  : plan.price.toLocaleString("he-IL")}
              </p>
              {discountApplied ? (
                <p className="text-base text-red-400 line-through">
                  ₪{plan.price.toLocaleString("he-IL")}
                </p>
              ) : (
                <p className="text-base text-ink-tertiary line-through">
                  ₪{plan.originalPrice.toLocaleString("he-IL")}
                </p>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-ink-tertiary">
              {plan.credits} {plan.credits === 1 ? "דוח" : "דוחות"}
            </p>

            <div className="mt-auto pt-5">
              <button
                className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-ink text-white hover:bg-ink/90"
                    : "bg-surface-subtle border border-edge text-ink hover:bg-surface-subtle/80"
                } disabled:opacity-50`}
                onClick={() => handlePurchase(plan.id)}
                disabled={payingPlanId !== null}
              >
                {payingPlanId === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    מעבר לתשלום...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    לתשלום ₪{discountApplied
                      ? Math.round(plan.price * (1 - discountPercent / 100)).toLocaleString("he-IL")
                      : plan.price.toLocaleString("he-IL")}
                  </span>
                )}
              </button>
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
          <Gift className="h-5 w-5" /> קוד הנחה
        </h2>
        <p className="mb-4 text-xs text-ink-tertiary">
          יש לך קוד הנחה? הזן אותו כאן כדי לקבל קרדיטים
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="הזן קוד הנחה"
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

      {/* Security note */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-ink-tertiary">
        <Lock className="h-3.5 w-3.5" />
        <p>התשלום מאובטח ומבוצע דרך SUMIT — פרטי כרטיס האשראי לא נשמרים אצלנו</p>
      </div>
    </div>
  );
}
