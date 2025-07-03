// src/components/dashboard/coming-soon-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Sun, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComingSoonFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  eta?: string;
}

interface ComingSoonCardProps {
  className?: string;
  features?: ComingSoonFeature[];
}

const defaultFeatures: ComingSoonFeature[] = [
  {
    icon: <Sun className="h-4 w-4" />,
    title: "Most Productive Hours",
    description: "Discover your peak coding hours and optimize your schedule",
    eta: "Coming Soon",
  },
  {
    icon: <Activity className="h-4 w-4" />,
    title: "Productivity Trends",
    description: "Track your coding patterns and identify improvement areas",
    eta: "Next Week",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    title: "Goal Tracking",
    description: "Set and monitor your daily and weekly coding goals",
    eta: "Next Month",
  },
];

export function ComingSoonCard({
  className,
  features = defaultFeatures,
}: ComingSoonCardProps) {
  const handleFeatureRequest = () => {
    // You can implement this to open a modal, redirect to a form, etc.
    console.log("Feature request clicked");
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-dashed border-2",
        className
      )}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-electric-violet-500/5 to-neon-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Plus className="h-5 w-5" />
          Coming Soon
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <div className="text-center py-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3">
            <Clock className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            More Features on the Way
          </h3>
          <p className="text-sm text-muted-foreground">
            We&apos;re working on exciting new analytics to help you code better
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors duration-200"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50 flex-shrink-0 mt-0.5">
                <div className="text-muted-foreground">{feature.icon}</div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {feature.title}
                  </h4>
                  {feature.eta && (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full flex-shrink-0">
                      {feature.eta}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="pt-3 border-t border-border/50">
          <button
            onClick={handleFeatureRequest}
            className="w-full text-sm text-primary hover:text-primary/80 transition-colors dev-mono flex items-center justify-center gap-2 py-2"
          >
            <Plus className="h-3 w-3" />
            Request a Feature
          </button>
        </div>
      </CardContent>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
