import type { EventSeverity, VerificationStatus, WeatherEventType } from "./types";

export interface DashboardFilters {
  eventType: WeatherEventType | "all";
  severity: EventSeverity | "all";
  state: string | "all";
  verificationStatus: VerificationStatus | "all";
  sinceHours: number; // rolling window, simpler for an MVP than a full date-range picker
}

export const DEFAULT_FILTERS: DashboardFilters = {
  eventType: "all",
  severity: "all",
  state: "all",
  verificationStatus: "all",
  sinceHours: 48,
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Delhi", "Gujarat",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];
