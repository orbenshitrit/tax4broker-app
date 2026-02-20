import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tax4Broker — מערכת דוחות מס",
  description: "מערכת CRM לרואי חשבון — דוחות מס ללקוחות Interactive Brokers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.variable} bg-surface font-sans text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
