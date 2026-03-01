"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import DashboardPage from "@/components/pages/DashboardPage";
import ReportGeneratorPage from "@/components/pages/ReportGeneratorPage";
import PricingPage from "@/components/pages/PricingPage";
import AdminPage from "@/components/pages/AdminPage";
import TermsPage from "@/components/pages/TermsPage";
import { motion, AnimatePresence } from "framer-motion";

export type Page = "dashboard" | "generator" | "pricing" | "admin" | "terms";

export interface ReportMeta {
  id: string;
  clientName: string;
  accountId: string;
  timestamp: string;
  issuedAt: string;
  reportPeriod: string;
  year: number;
  fileName?: string;
}

export default function AppShell() {
  const { userData } = useAuth();
  const [page, setPage] = useState<Page>("dashboard");

  const navigate = useCallback((p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const isAdmin = userData?.role === "admin";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {page === "dashboard" && (
          <DashboardPage
            navigate={navigate}
            isAdmin={isAdmin}
          />
        )}
        {page === "generator" && (
          <ReportGeneratorPage
            navigate={navigate}
          />
        )}
        {page === "pricing" && <PricingPage navigate={navigate} />}
        {page === "admin" && <AdminPage navigate={navigate} />}
        {page === "terms" && <TermsPage onBack={() => navigate("dashboard")} />}
      </motion.div>
    </AnimatePresence>
  );
}
