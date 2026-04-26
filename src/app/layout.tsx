import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SimbaPulse from "@/components/SimbaPulse";
import ToastContainer from "@/components/Toast";
import AuthModal from "@/components/AuthModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import PickupBranchModal from "@/components/PickupBranchModal";
import AuthBootstrap from "@/components/AuthBootstrap";
import GoogleAuthHandler from "@/components/GoogleAuthHandler";
import PageLoader from "@/components/PageLoader";
import ScrollToTop from "@/components/ScrollToTop";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simba Supermarket | Rwanda's Modern Online Store",
  description: "Shop 700+ authentic products from Simba Supermarket. Fast pickup across Kigali in 20-45 minutes.",
  keywords: "simba supermarket, rwanda, kigali, online grocery, delivery, momo",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F172A' },
    { media: '(prefers-color-scheme: dark)',  color: '#0F172A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} pb-16 sm:pb-0`} style={{ paddingBottom: 'max(4rem, env(safe-area-inset-bottom))' }}>
        <ThemeProvider>
          <AuthBootstrap />
          <GoogleAuthHandler />
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <SimbaPulse />
          <AuthModal />
          <PickupBranchModal />
          <ToastContainer />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}

