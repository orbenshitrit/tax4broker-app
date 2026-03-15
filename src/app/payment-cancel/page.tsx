"use client";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-yellow-700">התשלום בוטל</h1>
        <p className="mt-2 text-ink/70">התשלום בוטל ולא בוצע חיוב</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-white font-medium hover:bg-brand/90 transition"
        >
          חזרה למערכת
        </a>
      </div>
    </div>
  );
}
