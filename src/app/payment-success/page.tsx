"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

function PaymentVerifier() {
  const searchParams = useSearchParams();
  const { user, getToken, refreshUserData } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const [creditsAdded, setCreditsAdded] = useState(0);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!user || verifiedRef.current) return;
    verifiedRef.current = true;

    const paymentId = searchParams.get("payment_id");
    const documentId = searchParams.get("DocumentID") || searchParams.get("TransactionDocumentID");

    if (!paymentId) {
      setStatus("error");
      setMessage("חסר מזהה תשלום");
      return;
    }

    (async () => {
      try {
        const token = await getToken();
        const res = await apiFetch<{
          ok: boolean;
          message: string;
          credits_added?: number;
          credits?: number;
        }>("/api/payments/verify", {
          method: "POST",
          body: JSON.stringify({
            payment_id: paymentId,
            document_id: documentId ? parseInt(documentId, 10) : null,
          }),
          token,
        });

        if (res.message === "already_processed") {
          setStatus("success");
          setMessage("התשלום כבר עובד בעבר");
          setCreditsAdded(res.credits || 0);
        } else {
          setStatus("success");
          setMessage("התשלום אומת בהצלחה!");
          setCreditsAdded(res.credits_added || 0);
        }
        await refreshUserData();
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : "שגיאה באימות התשלום";
        setStatus("error");
        setMessage(errMsg);
      }
    })();
  }, [user, searchParams, getToken, refreshUserData]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            <h1 className="text-xl font-bold text-ink">מאמת תשלום...</h1>
            <p className="mt-2 text-ink/60">אנא המתן</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-700">התשלום הצליח!</h1>
            <p className="mt-2 text-ink/70">{message}</p>
            {creditsAdded > 0 && (
              <p className="mt-2 text-lg font-semibold text-brand">
                +{creditsAdded} קרדיטים נוספו לחשבונך
              </p>
            )}
            <a
              href="/"
              className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-white font-medium hover:bg-brand/90 transition"
            >
              חזרה למערכת
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-700">שגיאה באימות התשלום</h1>
            <p className="mt-2 text-ink/70">{message}</p>
            <p className="mt-2 text-sm text-ink/50">
              אם חויבת, פנה לתמיכה ונטפל בזה באופן ידני
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-white font-medium hover:bg-brand/90 transition"
            >
              חזרה למערכת
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-surface">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          </div>
        }
      >
        <PaymentVerifier />
      </Suspense>
    </AuthProvider>
  );
}
}
