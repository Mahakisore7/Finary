import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. MOBILE-FIRST VIEWPORT
// Disabling userScalable prevents "rubber-banding" and accidental zooms on touch.
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Ensures content uses the full screen on notched phones (iPhone)
};

// 2. SEO & PWA ENHANCEMENTS
export const metadata: Metadata = {
  title: "Finary AI | Autonomous Finance",
  description: "Autonomous financial cockpit powered by Gemini. Scan, Speak, and Chat with your money.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finary AI",
  },
  formatDetection: {
    telephone: false, // Prevents auto-linking numbers that aren't phone numbers
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden`}
      >
        {/* Added overflow-x-hidden to the body to prevent horizontal "shaking" on mobile */}
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}