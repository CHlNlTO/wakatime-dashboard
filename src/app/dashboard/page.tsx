// src/app/dashboard/page.tsx
import React from "react";
import DashboardClient from "./dashboard-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | WakaTime Analytics",
  description:
    "View your coding statistics and productivity insights from WakaTime",
};

interface DashboardPageProps {
  searchParams: Promise<{
    range?: "last_7_days" | "last_30_days";
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const range = params?.range || "last_7_days";

  return <DashboardClient range={range} />;
}
