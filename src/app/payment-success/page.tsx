"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiFetch } from "@/lib/api";

function PaymentVerifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "verifying" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [creditsAdded, setCreditsAdded] = useState(0);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (verifiedRef.current) return;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || verifiedRef.current) return;
      verifiedRef.current = true;
      setStatus("verifying");

      const paymentId = searchParams.get("payment_id");

      if (!paymentId) {
        setStatus("error");
        setMessage("חסר מזהה תשלום");
        return;
      }

      try {
        const token = await user.getIdToken();

        // First check payment status
        const statusRes = await apiFetch<{
          ok: boolean;
          status: string;
          credits: number;
        }>(`/api/payments/status/${paymentId}`, { token });

        if (statusRes.status === "completed") {
          setStatus("success");
          setMessage("התשלום כבר עובד בעבר");
          setCreditsAdded(statusRes.credits);
          return;
        }

        // Try to verify with SUMIT
        const documentId = searchParams.get("DocumentID") || searchParams.get("TransactionDocumentID");

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

        setStatus("success");
        setMessage(res.message === "already_processed" ? "התשלום כבר עובד בעבר" : "התשלום אומת בהצלחה!");
        setCreditsAdded(res.credits_added || res.credits || 0);
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : "שגיאה באימות התשלום";
        setStatus("error");
        setMessage(errMsg);
      }
    });

    return () => unsub();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        {(status === "loading" || status === "verifying") && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            <h1 className="text-xl font-bold text-ink">
              {status === "loading" ? "טוען..." : "מאמת תשלום..."}
            </h1>
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
            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-white font-medium hover:bg-brand/90 transition"
            >
              חזרה למערכת
            </button>
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
            <p className="mt-2 text-sm text-ink/50">אם חויבת, פנה לתמיכה</p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-white font-medium hover:bg-brand/90 transition"
            >
              חזרה למערכת
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      }
    >
      <PaymentVerifier />
    </Suspense>
  );
}
}
