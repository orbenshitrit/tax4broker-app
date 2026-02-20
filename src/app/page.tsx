"use client";

import { Component, type ReactNode } from "react";

/* ─── Error Boundary ─── */
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", direction: "ltr" }}>
          <h1 style={{ color: "red" }}>Client Error Caught</h1>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
            {this.state.error.message}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8, fontSize: 12, color: "#666" }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function MinimalTest() {
  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>Tax4Broker - Minimal Test</h1>
      <p>If you see this, the basic Next.js setup works.</p>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL || "NOT SET"}</p>
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <MinimalTest />
    </ErrorBoundary>
  );
}
