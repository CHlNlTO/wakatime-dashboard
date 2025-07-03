// src/app/not-found.tsx
import React from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | WakaTime Dashboard",
  description: "The page you are looking for could not be found.",
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8 space-y-6">
          {/* 404 Illustration */}
          <div className="space-y-4">
            <div className="text-6xl font-bold text-primary dev-mono">404</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Page Not Found
              </h1>
              <p className="text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or has been
                moved.
              </p>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex-1"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>

              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              If you believe this is an error, please check the URL or contact
              support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
