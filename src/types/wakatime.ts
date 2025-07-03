// src/types/wakatime.ts

// Core WakaTime API response types
export interface WakaTimeUser {
  id: string;
  username: string;
  full_name: string;
  display_name: string;
  email: string;
  photo: string;
  website: string;
  human_readable_website: string;
  location: string;
  logged_time_public: boolean;
  languages_used_public: boolean;
  is_hireable: boolean;
  created_at: string;
  modified_at: string;
}

export interface WakaTimeRange {
  start: string;
  end: string;
  start_date?: string;
  start_text?: string;
  end_date?: string;
  end_text?: string;
  date?: string; // For daily summaries
  text?: string; // Human readable text
  timezone: string;
}

export interface WakaTimeAllTimeSinceToday {
  data: {
    daily_average: number;
    decimal: string;
    digital: string;
    is_up_to_date: boolean;
    percent_calculated: number;
    range: {
      end: string;
      end_date: string;
      end_text: string;
      start: string;
      start_date: string;
      start_text: string;
      timezone: string;
    };
    text: string;
    timeout: number;
    total_seconds: number;
  };
}

export interface WakaTimeLanguage {
  name: string;
  total_seconds: number;
  percent: number;
  digital: string;
  text: string;
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface WakaTimeEditor {
  name: string;
  total_seconds: number;
  percent: number;
  digital: string;
  text: string;
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface WakaTimeOperatingSystem {
  name: string;
  total_seconds: number;
  percent: number;
  digital: string;
  text: string;
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface WakaTimeCategory {
  name: string;
  total_seconds: number;
  percent: number;
  digital: string;
  text: string;
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface WakaTimeProject {
  name: string;
  total_seconds: number;
  percent: number;
  digital: string;
  text: string;
  hours: number;
  minutes: number;
}

export interface WakaTimeMachine {
  name: string;
  machine_name_id: string;
  total_seconds: number;
  percent: number;
  digital: string;
  text: string;
  hours: number;
  minutes: number;
  seconds?: number;
}

export interface WakaTimeBestDay {
  date: string;
  text: string;
  total_seconds: number;
}

export interface WakaTimeGrandTotal {
  digital: string;
  hours: number;
  minutes: number;
  text: string;
  total_seconds: number;
  decimal?: string;
}

export interface WakaTimeDailyStats {
  grand_total: WakaTimeGrandTotal;
  projects: WakaTimeProject[];
  languages: WakaTimeLanguage[];
  editors: WakaTimeEditor[];
  operating_systems: WakaTimeOperatingSystem[];
  categories: WakaTimeCategory[];
  machines: WakaTimeMachine[];
  range: WakaTimeRange;
  dependencies?: WakaTimeCategory[];
  branches?: WakaTimeCategory[];
  entities?: WakaTimeCategory[];
}

// Main WakaTime Stats Response
export interface WakaTimeStats {
  data: {
    user_id: string;
    username: string;
    range?: WakaTimeRange;
    timeout: number;
    writes_only: boolean;
    holidays: number;
    status: string;
    is_already_updating: boolean;
    is_coding_activity_visible: boolean;
    is_other_usage_visible?: boolean;
    total_seconds: number;
    total_seconds_including_other_language: number;
    human_readable_total: string;
    human_readable_total_including_other_language: string;
    daily_average: number;
    daily_average_including_other_language: number;
    human_readable_daily_average: string;
    human_readable_daily_average_including_other_language: string;
    languages: WakaTimeLanguage[];
    editors: WakaTimeEditor[];
    operating_systems: WakaTimeOperatingSystem[];
    categories: WakaTimeCategory[];
    projects: WakaTimeProject[];
    machines: WakaTimeMachine[];
    best_day: WakaTimeBestDay;
    days_including_holidays: number;
    days_minus_holidays: number;
    is_including_today: boolean;
    percent_calculated: number;
    is_up_to_date: boolean;
    is_up_to_date_pending_future?: boolean;
    start: string;
    end: string;
    timezone: string;
    created_at: string;
    modified_at: string;
  };
}

// Summaries endpoint (for daily breakdown)
export interface WakaTimeSummariesResponse {
  data: WakaTimeDailyStats[];
  start: string;
  end: string;
  timezone?: string;
  cumulative_total: {
    seconds: number;
    text: string;
    digital: string;
    decimal?: string;
  };
  daily_average?: {
    holidays: number;
    days_including_holidays: number;
    days_minus_holidays: number;
    seconds: number;
    text: string;
    seconds_including_other_language: number;
    text_including_other_language: string;
  };
}

// Transformed types for our dashboard
export interface DashboardStats {
  totalTime: {
    seconds: number;
    humanReadable: string;
    dailyAverage: number;
    dailyAverageText: string;
  };
  allTimeStats?: {
    totalSeconds: number;
    humanReadable: string;
    dailyAverage: number;
  };
  languages: LanguageStats[];
  weeklyTimeline: DailyTimeEntry[];
  topProjects: ProjectStats[];
  topEditors: EditorStats[];
  bestDay: {
    date: string;
    totalSeconds: number;
    text: string;
  };
  range: {
    start: string;
    end: string;
    timezone: string;
  };
  lastUpdated: string;
}

export interface LanguageStats {
  name: string;
  totalSeconds: number;
  percentage: number;
  humanReadable: string;
  color: string; // We'll map this from language colors
}

export interface DailyTimeEntry {
  date: string;
  dayName: string;
  totalSeconds: number;
  humanReadable: string;
  languages: LanguageStats[];
  isToday: boolean;
}

export interface ProjectStats {
  name: string;
  totalSeconds: number;
  percentage: number;
  humanReadable: string;
}

export interface EditorStats {
  name: string;
  totalSeconds: number;
  percentage: number;
  humanReadable: string;
  icon?: string; // We'll map editor icons
}

// Error handling
export interface WakaTimeError {
  error: string;
  error_code?: number;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Request parameters
export interface StatsParams {
  range?: "last_7_days" | "last_30_days" | "last_6_months" | "last_year";
  timeout?: number;
  writes_only?: boolean;
  project?: string;
}

export interface SummariesParams {
  start: string; // YYYY-MM-DD format
  end: string; // YYYY-MM-DD format
  project?: string;
  branches?: string;
  timeout?: number;
  writes_only?: boolean;
  timezone?: string;
}

// Language color mapping (GitHub-style colors optimized for dark mode)
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#239120",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#fa7343",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  R: "#198ce7",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#1572B6",
  SCSS: "#c6538c",
  SASS: "#a53b70",
  Less: "#1d365d",
  Vue: "#41b883",
  React: "#61dafb",
  Angular: "#dd0031",
  Svelte: "#ff3e00",
  JSON: "#292929",
  YAML: "#cb171e",
  XML: "#0060ac",
  Markdown: "#083fa1",
  Shell: "#89e051",
  Bash: "#89e051",
  PowerShell: "#012456",
  Dockerfile: "#384d54",
  SQL: "#336791",
  GraphQL: "#e10098",
  Lua: "#000080",
  Perl: "#0298c3",
  "Objective-C": "#438eff",
  "Objective-C++": "#6866fb",
  Haskell: "#5e5086",
  Clojure: "#db5855",
  Erlang: "#B83998",
  Elixir: "#6e4a7e",
  F: "#b845fc",
  OCaml: "#3be133",
  Reason: "#ff5847",
  Elm: "#60B5CC",
  PureScript: "#1D222D",
  CoffeeScript: "#244776",
  LiveScript: "#499886",
  Nim: "#ffc200",
  Crystal: "#000100",
  D: "#ba595e",
  Zig: "#ec915c",
  V: "#5d87bd",
  Assembly: "#6E4C13",
  NASM: "#6E4C13",
  Makefile: "#427819",
  CMake: "#DA3434",
  TOML: "#9c4221",
  INI: "#d1dbe0",
  Properties: "#2f73bf",
  Batch: "#C1F12E",
  VBScript: "#15dcdc",
  AppleScript: "#101F1F",
  AutoHotkey: "#6594b9",
  Vim: "#199f4b",
  Emacs: "#c065db",
  LaTeX: "#3D6117",
  BibTeX: "#778899",
  TeX: "#3D6117",
  "Plain Text": "#ffffff",
  Text: "#ffffff",
  Log: "#ffffff",
  Other: "#858585",
};

// Editor icon mapping
export const EDITOR_ICONS: Record<string, string> = {
  "VS Code": "🔵",
  "Visual Studio Code": "🔵",
  WebStorm: "🔷",
  IntelliJ: "🔶",
  Vim: "🟢",
  Neovim: "🟢",
  "Sublime Text": "🟠",
  Atom: "🟣",
  Emacs: "🟤",
  Nano: "⚪",
  Other: "⚫",
};
