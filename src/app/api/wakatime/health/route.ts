// src/app/api/wakatime/health/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wakaTimeService } from "@/lib/wakatime";

export async function GET(request: NextRequest) {
  try {
    // Get API key from headers
    const apiKey = request.headers.get("X-WakaTime-API-Key");

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "unhealthy",
          error: "Missing WakaTime API key",
          timestamp: new Date().toISOString(),
          services: {
            wakatime: "down",
            api: "up",
          },
        },
        { status: 401 }
      );
    }

    // Test WakaTime API connection
    const healthCheck = await wakaTimeService.testConnection(apiKey);

    if (!healthCheck.success) {
      return NextResponse.json(
        {
          status: "unhealthy",
          error: healthCheck.error,
          timestamp: healthCheck.timestamp,
          services: {
            wakatime: "down",
            api: "up",
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "healthy",
        message: "All services operational",
        timestamp: healthCheck.timestamp,
        services: {
          wakatime: "up",
          api: "up",
        },
        user: {
          username: healthCheck.data!.username,
          authenticated: healthCheck.data!.isAuthenticated,
        },
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Internal server error",
        timestamp: new Date().toISOString(),
        services: {
          wakatime: "unknown",
          api: "up",
        },
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
