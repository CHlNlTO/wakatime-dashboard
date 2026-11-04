import {
  ContributionCalendar,
  ContributionDay,
  ContributionLevel,
  ContributionWeek,
} from "@/types/github";

const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const CONTRIBUTIONS_SVG = (username: string) =>
  `https://github.com/users/${encodeURIComponent(username)}/contributions`;

const LEVEL_FROM_DATA_LEVEL: Record<string, ContributionLevel> = {
  "0": "NONE",
  "1": "FIRST_QUARTILE",
  "2": "SECOND_QUARTILE",
  "3": "THIRD_QUARTILE",
  "4": "FOURTH_QUARTILE",
};

interface GraphqlDay {
  date: string;
  contributionCount: number;
  contributionLevel: ContributionLevel;
}

interface GraphqlResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: Array<{ contributionDays: GraphqlDay[] }>;
        };
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

const CALENDAR_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

export async function fetchContributionCalendar(
  username: string
): Promise<{ data?: ContributionCalendar; error?: string }> {
  const trimmed = username.trim().replace(/^@/, "");
  if (!trimmed) {
    return { error: "GitHub username is required" };
  }

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    const fromGraphql = await fetchViaGraphql(trimmed, token);
    if (fromGraphql.data) {
      return fromGraphql;
    }
    console.warn("GitHub GraphQL failed, falling back to SVG:", fromGraphql.error);
  }

  return fetchViaSvg(trimmed);
}

async function fetchViaGraphql(
  username: string,
  token: string
): Promise<{ data?: ContributionCalendar; error?: string }> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "wakatime-dashboard",
      },
      body: JSON.stringify({
        query: CALENDAR_QUERY,
        variables: { username },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { error: `GitHub API error: HTTP ${response.status}` };
    }

    const payload = (await response.json()) as GraphqlResponse;

    if (payload.errors?.length) {
      return { error: payload.errors[0]?.message || "GitHub GraphQL error" };
    }

    if (!payload.data?.user) {
      return { error: `GitHub user "${username}" not found` };
    }

    const calendar =
      payload.data.user.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      return { error: "Contribution calendar unavailable" };
    }

    return {
      data: {
        username,
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks.map((week) => ({
          days: week.contributionDays.map((day) => ({
            date: day.date,
            count: day.contributionCount,
            level: day.contributionLevel,
          })),
        })),
      },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to reach GitHub API",
    };
  }
}

async function fetchViaSvg(
  username: string
): Promise<{ data?: ContributionCalendar; error?: string }> {
  try {
    const response = await fetch(CONTRIBUTIONS_SVG(username), {
      headers: {
        Accept: "text/html",
        "User-Agent": "wakatime-dashboard",
      },
      next: { revalidate: 3600 },
    });

    if (response.status === 404) {
      return { error: `GitHub user "${username}" not found` };
    }

    if (!response.ok) {
      return { error: `GitHub contributions error: HTTP ${response.status}` };
    }

    const html = await response.text();
    const daysByDate = new Map<string, ContributionDay>();

    const cellRegex =
      /<(?:td|rect)\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*\bdata-level="(\d+)"[^>]*>|<(?:td|rect)\b[^>]*\bdata-level="(\d+)"[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g;

    let match: RegExpExecArray | null;
    while ((match = cellRegex.exec(html)) !== null) {
      const date = match[1] || match[4];
      const levelKey = match[2] || match[3];
      if (!date || levelKey === undefined) continue;
      daysByDate.set(date, {
        date,
        count: Number(levelKey),
        level: LEVEL_FROM_DATA_LEVEL[levelKey] ?? "NONE",
      });
    }

    const tooltipRegex =
      /\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*\baria-label="([^"]*)"|\baria-label="([^"]*)"[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"/g;

    while ((match = tooltipRegex.exec(html)) !== null) {
      const date = match[1] || match[4];
      const label = match[2] || match[3] || "";
      if (!date) continue;

      const existing = daysByDate.get(date);
      if (!existing) continue;

      const countMatch = label.match(/(\d+)\s+contribution/i);
      const zeroMatch = /No contributions/i.test(label);
      if (!countMatch && !zeroMatch) continue;

      const count = zeroMatch ? 0 : Number(countMatch![1]);
      daysByDate.set(date, { ...existing, count });
    }

    if (daysByDate.size === 0) {
      return { error: "Could not parse GitHub contribution graph" };
    }

    const sortedDays = [...daysByDate.values()].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const first = new Date(`${sortedDays[0]!.date}T12:00:00Z`);
    const pad = first.getUTCDay();
    const padded: ContributionDay[] = [];

    for (let i = pad - 1; i >= 0; i--) {
      const d = new Date(first);
      d.setUTCDate(d.getUTCDate() - (i + 1));
      padded.push({
        date: d.toISOString().slice(0, 10),
        count: 0,
        level: "NONE",
      });
    }
    padded.push(...sortedDays);

    const weeks: ContributionWeek[] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push({ days: padded.slice(i, i + 7) });
    }

    return {
      data: {
        username,
        totalContributions: sortedDays.reduce((sum, day) => sum + day.count, 0),
        weeks,
      },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to load GitHub contributions",
    };
  }
}
