// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  WAKATIME_API_KEY: z.string().min(1, "WakaTime API key is required"),
  WAKATIME_BASE_URL: z.string().url().default("https://wakatime.com/api/v1"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

function getEnv() {
  // Return cached env if available
  if (cachedEnv) {
    return cachedEnv;
  }

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    throw new Error(
      "Environment variables should not be accessed in the browser"
    );
  }

  const parsed = envSchema.safeParse({
    WAKATIME_API_KEY: process.env.WAKATIME_API_KEY,
    WAKATIME_BASE_URL: process.env.WAKATIME_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error(
      `Invalid environment variables: ${parsed.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ")}`
    );
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

// Only export env if we're on the server
export const env =
  typeof window === "undefined"
    ? getEnv()
    : ({
        NODE_ENV: "development" as const,
        WAKATIME_API_KEY: "",
        WAKATIME_BASE_URL: "https://wakatime.com/api/v1",
      } as const);

// Type-safe environment variables for client-side (if needed)
export const clientEnv = {
  NODE_ENV: env.NODE_ENV,
};
