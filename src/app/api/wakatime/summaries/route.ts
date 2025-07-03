// src/app/api/wakatime/summaries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wakaTimeService } from "@/lib/wakatime";
import { SummariesParams } from "@/types/wakatime";
import { z } from "zod";

// Validation schema for query parameters
const summariesParamsSchema = z
  .object({
    start: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
    project: z.string().optional(),
    branches: z.string().optional(),
    timeout: z.coerce.number().min(1).max(60).optional().default(15),
    writes_only: z.coerce.boolean().optional().default(false),
    timezone: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start);
      const end = new Date(data.end);
      return start <= end;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["start"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start);
      const end = new Date(data.end);
      const diffInDays =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return diffInDays <= 365; // Limit to 1 year range
    },
    {
      message: "Date range cannot exceed 365 days",
      path: ["end"],
    }
  );

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Summaries API called");

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

    console.log("📋 Summaries query params:", rawParams);

    const validationResult = summariesParamsSchema.safeParse(rawParams);

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

    const params: SummariesParams = validationResult.data;
    console.log(`📊 Fetching summaries for:`, params);

    // Fetch summaries from WakaTime
    const response = await wakaTimeService.getSummaries(apiKey, params);

    if (!response.success) {
      console.error("❌ WakaTime Summaries API Error:", response.error);

      return NextResponse.json(
        {
          success: false,
          error: response.error,
          timestamp: response.timestamp,
        },
        { status: 500 }
      );
    }

    console.log("✅ Summaries data fetched successfully");
    console.log("🔢 Summaries summary:", {
      daysCount: response.data?.data?.length || 0,
      dateRange: `${params.start} to ${params.end}`,
      cumulativeSeconds: response.data?.cumulative_total?.seconds || 0,
    });

    // Calculate cache duration based on date range
    const endDate = new Date(params.end);
    const today = new Date();
    const isCurrentData = endDate.toDateString() === today.toDateString();

    // Cache for 1 hour if current data, 24 hours for historical data
    const cacheMaxAge = isCurrentData ? 3600 : 86400;

    // Return successful response
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=${
          cacheMaxAge * 2
        }`,
        "X-Data-Range": `${params.start} to ${params.end}`,
        "X-Is-Current": isCurrentData.toString(),
        "X-Data-Source": "wakatime-summaries-api",
        "X-Timestamp": response.timestamp,
      },
    });
  } catch (error) {
    console.error("💥 Summaries API route error:", error);

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
