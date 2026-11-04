import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchContributionCalendar } from "@/lib/github";
import { GithubContributionsResponse } from "@/types/github";

const paramsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "username is required")
    .max(39)
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid GitHub username"),
});

interface CacheEntry {
  body: GithubContributionsResponse;
  status: number;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = paramsSchema.safeParse({
      username: searchParams.get("username") ?? "",
    });

    if (!parsed.success) {
      const body: GithubContributionsResponse = {
        success: false,
        error: parsed.error.errors[0]?.message || "Invalid username",
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(body, { status: 400 });
    }

    const username = parsed.data.username.toLowerCase();
    const now = Date.now();
    const cached = cache.get(username);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.body, {
        status: cached.status,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "X-Cache": "HIT",
        },
      });
    }

    const result = await fetchContributionCalendar(parsed.data.username);

    if (!result.data) {
      const body: GithubContributionsResponse = {
        success: false,
        error: result.error || "Failed to load contributions",
        timestamp: new Date().toISOString(),
      };
      const status = result.error?.includes("not found") ? 404 : 502;
      cache.set(username, { body, status, timestamp: now });
      return NextResponse.json(body, { status });
    }

    const body: GithubContributionsResponse = {
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    };

    cache.set(username, { body, status: 200, timestamp: now });

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("GitHub contributions route error:", error);
    const body: GithubContributionsResponse = {
      success: false,
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(body, { status: 500 });
  }
}

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
