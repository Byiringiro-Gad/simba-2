import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SimbaPulse from "@/components/SimbaPulse";
import ToastContainer from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simba Supermarket | Rwanda's Modern Online Store",
  description: "Shop 700+ authentic products from Simba Supermarket. Fast delivery across Kigali in 45 minutes.",
  keywords: "simba supermarket, rwanda, kigali, online grocery, delivery, momo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} pb-16 sm:pb-0`}>
        <ThemeProvider>
          {children}
          <SimbaPulse />
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}

