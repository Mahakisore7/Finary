import type { Metadata, Viewport } from "next"; // Added Viewport import
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

// 1. MOBILE VIEWPORT CONFIGURATION
// This prevents the browser from zooming in on inputs, a common mobile UI issue.
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 2. ENHANCED PWA & SEO METADATA
export const metadata: Metadata = {
  title: "Finary AI | Autonomous Finance",
  description: "The autonomous financial cockpit powered by Gemini 2.5 Flash. Scan, Speak, and Chat with your money.",
  manifest: "/manifest.json", // This connects to your manifest.ts file
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finary AI",
  },
  icons: {
    apple: "/icon-192x192.png", // Essential for iOS Home Screen
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-emerald-500/30`}
      >
        {children}
      </body>
    </html>
  );
}