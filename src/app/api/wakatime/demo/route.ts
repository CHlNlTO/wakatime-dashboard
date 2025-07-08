// src/app/api/wakatime/demo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wakaTimeService } from "@/lib/wakatime";
import { env } from "@/lib/env";
import { z } from "zod";
import { DemoResponse } from "@/types/demo";
import { DashboardStats } from "@/types/wakatime";

// Validation schema for query parameters
const demoParamsSchema = z.object({
  range: z
    .enum(["last_7_days", "last_30_days"])
    .optional()
    .default("last_7_days"),
});

// Cache for demo data (in-memory, resets on server restart)
interface DemoCache {
  data: DemoResponse;
  timestamp: number;
  range: string;
}

let demoDataCache: DemoCache | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET(request: NextRequest) {
  try {
    console.log("🎯 Demo API called");

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validationResult = demoParamsSchema.safeParse(rawParams);

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

    const { range } = validationResult.data;

    // Check cache first
    const now = Date.now();
    if (
      demoDataCache &&
      demoDataCache.range === range &&
      now - demoDataCache.timestamp < CACHE_DURATION
    ) {
      console.log("📦 Serving cached demo data");
      return NextResponse.json(demoDataCache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "X-Data-Source": "demo-cache",
          "X-Cache-Age": String(
            Math.floor((now - demoDataCache.timestamp) / 1000)
          ),
        },
      });
    }

    console.log(`📊 Fetching Clark's stats for range: ${range}`);

    // Use server-side API key (Clark's key from environment)
    const apiKey = env.WAKATIME_API_KEY;

    if (!apiKey) {
      console.error("❌ Demo API key not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Demo API key not configured",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Fetch demo dashboard data using Clark's API key
    const response = await wakaTimeService.getDashboardData(apiKey, range);

    if (!response.success) {
      console.error("❌ Demo WakaTime API Error:", response.error);

      return NextResponse.json(
        {
          success: false,
          error: response.error,
          timestamp: response.timestamp,
        },
        { status: 500 }
      );
    }

    console.log("✅ Demo data fetched successfully");
    console.log("🔢 Demo stats summary:", {
      totalSeconds: response.data?.totalTime.seconds,
      languagesCount: response.data?.languages.length,
      projectsCount: response.data?.topProjects.length,
      editorsCount: response.data?.topEditors.length,
      timelineLength: response.data?.weeklyTimeline.length,
      bestDaySeconds: response.data?.bestDay.totalSeconds,
    });

    // Add demo metadata to response
    const demoResponse: DemoResponse = {
      ...response,
      demo: true,
      demoUser: "Clark",
      demoNote:
        "This is Clark's coding activity - a demonstration of the dashboard",
    };

    // Cache the demo data
    demoDataCache = {
      data: demoResponse,
      timestamp: now,
      range,
    };

    // Return successful response with demo data
    return NextResponse.json(demoResponse, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-Data-Source": "wakatime-demo-api",
        "X-Demo-User": "Clark",
        "X-Timestamp": response.timestamp,
      },
    });
  } catch (error) {
    console.error("💥 Demo API route error:", error);

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
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
