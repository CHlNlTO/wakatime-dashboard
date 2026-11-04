// src/types/demo.ts
import { DashboardStats, ApiResponse } from "./wakatime";

export interface DemoResponse extends ApiResponse<DashboardStats> {
  demo?: boolean;
  demoUser?: string;
  demoNote?: string;
  githubUsername?: string | null;
}

export interface DemoModeState {
  isDemoMode: boolean;
  demoData: DashboardStats | null;
  githubUsername: string | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface DemoModeActions {
  enableDemoMode: () => Promise<void>;
  disableDemoMode: () => void;
  refreshDemoData: () => void;
}

export type DemoModeHook = DemoModeState & DemoModeActions;
