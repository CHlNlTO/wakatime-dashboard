// src/lib/wakatime.ts
import {
  WakaTimeStats,
  WakaTimeSummariesResponse,
  WakaTimeUser,
  WakaTimeError,
  ApiResponse,
  StatsParams,
  SummariesParams,
  DashboardStats,
  LanguageStats,
  DailyTimeEntry,
  ProjectStats,
  EditorStats,
  LANGUAGE_COLORS,
  EDITOR_ICONS,
  WakaTimeAllTimeSinceToday,
} from "@/types/wakatime";

class WakaTimeService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = "https://wakatime.com/api/v1";
  }

  private getAuthHeaders(apiKey: string): HeadersInit {
    // WakaTime uses Basic Auth with the API key as username and empty password
    const credentials = btoa(`${apiKey}:`);
    return {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    apiKey: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);

      // Add query parameters if provided
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(apiKey),
        // Add cache control for development
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData: WakaTimeError = await response.json().catch(() => ({
          error: "Unknown error occurred",
          error_code: response.status,
        }));

        return {
          success: false,
          error:
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data: T = await response.json();

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("WakaTime API Error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown network error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(apiKey: string): Promise<ApiResponse<WakaTimeUser>> {
    return this.makeRequest<WakaTimeUser>("/users/current", apiKey);
  }

  /**
   * Get all time since today stats
   */
  async getAllTimeSinceToday(
    apiKey: string,
    project?: string
  ): Promise<ApiResponse<WakaTimeAllTimeSinceToday>> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (project) {
      queryParams.project = project;
    }

    return this.makeRequest<WakaTimeAllTimeSinceToday>(
      "/users/current/all_time_since_today",
      apiKey,
      queryParams
    );
  }

  /**
   * Get coding stats for a specific time range
   */
  async getStats(
    apiKey: string,
    params: StatsParams = {}
  ): Promise<ApiResponse<WakaTimeStats>> {
    const {
      range = "last_7_days",
      timeout = 15,
      writes_only = false,
      project,
    } = params;

    const queryParams: Record<string, string | number | boolean> = {
      timeout,
      writes_only,
    };

    if (project) {
      queryParams.project = project;
    }

    // Use the correct endpoint format with range in URL path
    const endpoint = `/users/current/stats/${range}`;
    return this.makeRequest<WakaTimeStats>(endpoint, apiKey, queryParams);
  }

  /**
   * Get daily summaries for a date range
   */
  async getSummaries(
    apiKey: string,
    params: SummariesParams
  ): Promise<ApiResponse<WakaTimeSummariesResponse>> {
    const {
      start,
      end,
      project,
      branches,
      timeout = 15,
      writes_only = false,
      timezone,
    } = params;

    const queryParams: Record<string, string | number | boolean> = {
      start,
      end,
      timeout,
      writes_only,
    };

    if (project) queryParams.project = project;
    if (branches) queryParams.branches = branches;
    if (timezone) queryParams.timezone = timezone;

    return this.makeRequest<WakaTimeSummariesResponse>(
      "/users/current/summaries",
      apiKey,
      queryParams
    );
  }

  /**
   * Get comprehensive dashboard data (combines stats and summaries)
   */
  async getDashboardData(
    apiKey: string,
    range: "last_7_days" | "last_30_days" = "last_7_days"
  ): Promise<ApiResponse<DashboardStats>> {
    try {
      // Get all time since today for total time
      const allTimeResponse = await this.getAllTimeSinceToday(apiKey);

      // Get main stats for this week/month data
      const statsResponse = await this.getStats(apiKey, { range });

      if (!statsResponse.success || !statsResponse.data) {
        return {
          success: false,
          error: statsResponse.error || "Failed to fetch stats",
          timestamp: new Date().toISOString(),
        };
      }

      const stats = statsResponse.data.data;
      const allTimeData = allTimeResponse.success ? allTimeResponse.data : null;

      // Prepare date range for summaries
      const endDate = new Date();
      const startDate = new Date();

      if (range === "last_7_days") {
        startDate.setDate(endDate.getDate() - 6); // Last 7 days including today
      } else {
        startDate.setDate(endDate.getDate() - 29); // Last 30 days including today
      }

      // Get daily summaries for the same period
      const summariesResponse = await this.getSummaries(apiKey, {
        start: startDate.toISOString().split("T")[0]!,
        end: endDate.toISOString().split("T")[0]!,
      });

      const summaries = summariesResponse.success
        ? summariesResponse.data
        : null;

      // Transform the data for our dashboard
      const dashboardData: DashboardStats = {
        totalTime: {
          // Use current range data for main display (this week)
          seconds:
            stats.total_seconds_including_other_language ||
            stats.total_seconds ||
            0,
          humanReadable:
            stats.human_readable_total_including_other_language ||
            stats.human_readable_total ||
            "0 mins",
          // Use current range stats for daily average
          dailyAverage:
            stats.daily_average_including_other_language ||
            stats.daily_average ||
            0,
          dailyAverageText:
            stats.human_readable_daily_average_including_other_language ||
            stats.human_readable_daily_average ||
            "0 mins",
        },
        // Add all time data separately
        allTimeStats: allTimeData?.data
          ? {
              totalSeconds: allTimeData.data.total_seconds,
              humanReadable: allTimeData.data.text,
              dailyAverage: allTimeData.data.daily_average,
            }
          : undefined,
        languages: this.transformLanguages(stats.languages || []),
        weeklyTimeline: this.transformWeeklyTimeline(
          summaries?.data || [],
          endDate,
          range === "last_7_days" ? 7 : 30
        ),
        topProjects: this.transformProjects(stats.projects || []),
        topEditors: this.transformEditors(stats.editors || []),
        bestDay: {
          date: stats.best_day?.date || "",
          totalSeconds: stats.best_day?.total_seconds || 0,
          text: stats.best_day?.text || "0 mins",
        },
        range: {
          start: stats.start || startDate.toISOString(),
          end: stats.end || endDate.toISOString(),
          timezone: stats.timezone || "UTC",
        },
        lastUpdated: stats.modified_at || new Date().toISOString(),
      };

      return {
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Dashboard data error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Transform WakaTime languages to our format with colors
   */
  private transformLanguages(
    languages: WakaTimeStats["data"]["languages"]
  ): LanguageStats[] {
    // Handle case where languages might be undefined or empty
    if (!languages || !Array.isArray(languages)) {
      return [];
    }

    // Include ALL languages, not just a subset
    return languages.map((lang) => ({
      name: lang.name,
      totalSeconds: lang.total_seconds,
      percentage: lang.percent,
      humanReadable: lang.text,
      color: LANGUAGE_COLORS[lang.name] || LANGUAGE_COLORS["Other"]!,
    }));
  }

  /**
   * Transform daily summaries into weekly timeline
   */
  private transformWeeklyTimeline(
    dailyStats: WakaTimeSummariesResponse["data"],
    endDate: Date,
    daysCount: number = 7
  ): DailyTimeEntry[] {
    const timeline: DailyTimeEntry[] = [];
    const today = new Date().toDateString();

    // Create entries for the specified number of days
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      const dateStr = date.toISOString().split("T")[0]!;

      // Find corresponding data in summaries
      const dayData = dailyStats.find((d) => d.range?.date === dateStr);

      timeline.push({
        date: dateStr,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        totalSeconds: dayData?.grand_total?.total_seconds || 0,
        humanReadable: this.formatDuration(
          dayData?.grand_total?.total_seconds || 0
        ),
        languages: dayData
          ? this.transformLanguages(dayData.languages || [])
          : [],
        isToday: date.toDateString() === today,
      });
    }

    return timeline;
  }

  /**
   * Transform projects data
   */
  private transformProjects(
    projects: WakaTimeStats["data"]["projects"]
  ): ProjectStats[] {
    // Handle case where projects might be undefined or empty
    if (!projects || !Array.isArray(projects)) {
      return [];
    }

    return projects.slice(0, 5).map((project) => ({
      name: project.name,
      totalSeconds: project.total_seconds,
      percentage: project.percent,
      humanReadable: project.text,
    }));
  }

  /**
   * Transform editors data with icons
   */
  private transformEditors(
    editors: WakaTimeStats["data"]["editors"]
  ): EditorStats[] {
    // Handle case where editors might be undefined or empty
    if (!editors || !Array.isArray(editors)) {
      return [];
    }

    return editors.map((editor) => ({
      name: editor.name,
      totalSeconds: editor.total_seconds,
      percentage: editor.percent,
      humanReadable: editor.text,
      icon: EDITOR_ICONS[editor.name] || EDITOR_ICONS["Other"],
    }));
  }

  /**
   * Format duration in seconds to human readable format
   */
  private formatDuration(seconds: number): string {
    if (seconds === 0 || !seconds) return "0 mins";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes} min${minutes !== 1 ? "s" : ""}`;
    }

    if (minutes === 0) {
      return `${hours} hr${hours !== 1 ? "s" : ""}`;
    }

    return `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${
      minutes !== 1 ? "s" : ""
    }`;
  }

  /**
   * Test API connection and authentication
   */
  async testConnection(
    apiKey: string
  ): Promise<ApiResponse<{ username: string; isAuthenticated: boolean }>> {
    const userResponse = await this.getCurrentUser(apiKey);

    if (!userResponse.success) {
      return {
        success: false,
        error: `Authentication failed: ${userResponse.error}`,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: {
        username: userResponse.data!.username,
        isAuthenticated: true,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const wakaTimeService = new WakaTimeService();

// Helper function to get date range strings
export function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  return {
    start: start.toISOString().split("T")[0]!,
    end: end.toISOString().split("T")[0]!,
  };
}

// Helper function to calculate coding streak
export function calculateCodingStreak(dailyStats: DailyTimeEntry[]): number {
  let streak = 0;
  const sortedStats = [...dailyStats].reverse(); // Start from most recent

  for (const day of sortedStats) {
    if (day.totalSeconds > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
