// GitHub contribution calendar types

export type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionCalendar {
  username: string;
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface GithubContributionsResponse {
  success: boolean;
  data?: ContributionCalendar;
  error?: string;
  timestamp: string;
}
