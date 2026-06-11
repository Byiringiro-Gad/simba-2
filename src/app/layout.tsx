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
import SiteReviewWidget from "@/components/SiteReviewWidget";
import MiniCartBar from "@/components/MiniCartBar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simba Supermarket | Rwanda's Modern Online Store",
  description: "Shop 700+ authentic products from Simba Supermarket. Browse groceries, bakery, cosmetics, electronics and more. Order online and pick up at your nearest Kigali branch in 20-45 minutes. Pay with MTN MoMo, Airtel Money, or card. Available in English, French, and Kinyarwanda.",
  keywords: "simba supermarket, rwanda, kigali, online grocery, pickup, mtn momo, airtel money, groceries, bakery, cosmetics, baby products, kinyarwanda, french",
  icons: {
    icon: '/simba-icon.png',
    shortcut: '/simba-icon.png',
    apple: '/simba-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF6600' },
    { media: '(prefers-color-scheme: dark)',  color: '#0F172A' },
  ],
  openGraph: {
    title: "Simba Supermarket | Online Shopping in Kigali",
    description: "700+ products, 9 branches, 20-45 min pickup across Kigali. Shop now.",
    type: 'website',
    locale: 'en_RW',
    siteName: 'Simba Supermarket',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/simba-icon.png" />
        <link rel="shortcut icon" href="/simba-icon.png" />
        <link rel="apple-touch-icon" href="/simba-icon.png" />
      </head>
      <body
        className={`${inter.className} pb-16 sm:pb-0`}
        style={{ paddingBottom: 'max(4rem, env(safe-area-inset-bottom))' }}
      >
        <ThemeProvider>
          <AuthBootstrap />
          <GoogleAuthHandler />
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          {/* Global overlays — order matters for z-index */}
          <SimbaPulse />
          <AuthModal />
          <PickupBranchModal />
          <ToastContainer />
          <ScrollToTop />
          <SiteReviewWidget />
          {/* Sticky desktop mini-cart bar */}
          <MiniCartBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
