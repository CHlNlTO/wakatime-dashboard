// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiKeyProvider } from "@/contexts/api-key-context";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WakaTime Developer Dashboard",
    template: "%s | WakaTime Dashboard",
  },
  description:
    "A modern, developer-focused dashboard for WakaTime analytics. Track your coding time, languages, projects, and productivity insights.",
  keywords: [
    "WakaTime",
    "developer",
    "coding time",
    "programming analytics",
    "productivity",
    "dashboard",
    "development metrics",
  ],
  authors: [
    {
      name: "Developer Dashboard",
    },
  ],
  creator: "WakaTime Dashboard",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    title: "WakaTime Developer Dashboard",
    description:
      "A modern, developer-focused dashboard for WakaTime analytics.",
    siteName: "WakaTime Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "WakaTime Developer Dashboard",
    description:
      "A modern, developer-focused dashboard for WakaTime analytics.",
    creator: "@your-twitter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://your-domain.com"),
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider>
            <ApiKeyProvider>{children}</ApiKeyProvider>
            <Analytics />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
