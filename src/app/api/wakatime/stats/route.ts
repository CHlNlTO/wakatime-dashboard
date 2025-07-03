// src/app/api/wakatime/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wakaTimeService } from "@/lib/wakatime";
import { StatsParams } from "@/types/wakatime";
import { z } from "zod";

// Validation schema for query parameters
const statsParamsSchema = z.object({
  range: z
    .enum(["last_7_days", "last_30_days", "last_6_months", "last_year"])
    .optional()
    .default("last_7_days"),
  timeout: z.coerce.number().min(1).max(60).optional().default(15),
  writes_only: z.coerce.boolean().optional().default(false),
  project: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Stats API called");

    // Get API key from headers
    const apiKey = request.headers.get("X-WakaTime-API-Key");

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing WakaTime API key",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    console.log("📋 Stats query params:", rawParams);

    const validationResult = statsParamsSchema.safeParse(rawParams);

    if (!validationResult.success) {
      console.error("❌ Invalid query parameters:", validationResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validationResult.error.format(),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const params: StatsParams = validationResult.data;
    console.log(`📊 Fetching stats for:`, params);

    // Fetch stats from WakaTime
    const response = await wakaTimeService.getStats(apiKey, params);

    if (!response.success) {
      console.error("❌ WakaTime Stats API Error:", response.error);

      return NextResponse.json(
        {
          success: false,
          error: response.error,
          timestamp: response.timestamp,
        },
        { status: 500 }
      );
    }

    console.log("✅ Stats data fetched successfully");
    console.log("🔢 Stats summary:", {
      totalSeconds: response.data?.data.total_seconds,
      languagesCount: response.data?.data.languages?.length || 0,
      projectsCount: response.data?.data.projects?.length || 0,
      editorsCount: response.data?.data.editors?.length || 0,
      bestDaySeconds: response.data?.data.best_day?.total_seconds,
    });

    // Return successful response
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // Cache for 5 minutes
        "X-Data-Source": "wakatime-stats-api",
        "X-Timestamp": response.timestamp,
      },
    });
  } catch (error) {
    console.error("💥 Stats API route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS (if needed)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-WakaTime-API-Key",
    },
  });
}
