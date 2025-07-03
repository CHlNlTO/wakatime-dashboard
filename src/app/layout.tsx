// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiKeyProvider } from "@/contexts/api-key-context";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
    icon: "/favicon.ico",
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
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider
            defaultTheme="dark"
            storageKey="wakatime-dashboard-theme"
          >
            <ApiKeyProvider>{children}</ApiKeyProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
