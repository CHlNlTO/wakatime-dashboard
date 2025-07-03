// src/app/api/wakatime/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wakaTimeService } from "@/lib/wakatime";
import { z } from "zod";

// Validation schema for query parameters
const dashboardParamsSchema = z.object({
  range: z
    .enum(["last_7_days", "last_30_days"])
    .optional()
    .default("last_7_days"),
  refresh: z.coerce.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Dashboard API called");

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

    console.log("📋 Query params:", rawParams);

    const validationResult = dashboardParamsSchema.safeParse(rawParams);

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

    const { range, refresh } = validationResult.data;
    console.log(
      `📊 Fetching dashboard data for range: ${range}, refresh: ${refresh}`
    );

    // Fetch dashboard data from WakaTime
    const response = await wakaTimeService.getDashboardData(apiKey, range);

    if (!response.success) {
      console.error("❌ WakaTime Dashboard API Error:", response.error);

      return NextResponse.json(
        {
          success: false,
          error: response.error,
          timestamp: response.timestamp,
        },
        { status: 500 }
      );
    }

    console.log("✅ Dashboard data fetched successfully");
    console.log("🔢 Stats summary:", {
      totalSeconds: response.data?.totalTime.seconds,
      languagesCount: response.data?.languages.length,
      projectsCount: response.data?.topProjects.length,
      editorsCount: response.data?.topEditors.length,
      timelineLength: response.data?.weeklyTimeline.length,
      bestDaySeconds: response.data?.bestDay.totalSeconds,
    });

    // Set cache headers based on refresh parameter
    const cacheHeaders = refresh
      ? { "Cache-Control": "no-cache, no-store, must-revalidate" }
      : {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        }; // Cache for 5 minutes

    // Return successful response with transformed dashboard data
    return NextResponse.json(response, {
      headers: {
        ...cacheHeaders,
        "X-Data-Source": "wakatime-api",
        "X-Timestamp": response.timestamp,
      },
    });
  } catch (error) {
    console.error("💥 Dashboard API route error:", error);

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
