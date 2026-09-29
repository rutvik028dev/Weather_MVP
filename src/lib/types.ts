export type WeatherEventType =
  | "heavy_rainfall"
  | "normal_rainfall"
  | "thunderstorm"
  | "flood"
  | "flash_flood"
  | "heatwave"
  | "fog"
  | "dust_storm"
  | "strong_winds"
  | "cyclone"
  | "hailstorm"
  | "lightning"
  | "other";

export type EventSeverity = "low" | "medium" | "high" | "critical";
export type EventStatus = "emerging" | "active" | "escalating" | "deescalating" | "resolved";
export type VerificationStatus = "pending" | "verified" | "suspicious" | "rejected";

export interface WeatherEventRow {
  id: string;
  event_type: WeatherEventType;
  severity: EventSeverity;
  status: EventStatus;
  city: string | null;
  district: string | null;
  state: string | null;
  country: string;
  report_count: number;
  verified_report_count: number;
  verification_score: number;
  start_time: string;
  last_report_at: string;
  end_time: string | null;
  // PostGIS geography comes back from PostgREST as GeoJSON when selected via
  // the `centroid` column with the postgis GeoJSON output cast -- see the
  // `event_locations` view in migration 0006_public_views.sql.
  lat: number;
  lon: number;
}

export interface WeatherReportRow {
  id: string;
  source_id: string | null;
  reporter_id: string | null;
  event_id: string | null;
  event_time: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  district: string | null;
  state: string | null;
  description: string;
  language: string | null;
  hashtags: string[];
  source_url: string | null;
  source_user: string | null;
  ai_event_type: WeatherEventType | null;
  ai_confidence: number | null;
  verification_status: VerificationStatus;
  confidence_score: number | null;
  is_flagged_emergency: boolean;
  created_at: string;
}

export interface VerificationRow {
  report_id: string;
  source_reliability_score: number;
  location_consistency_score: number;
  time_consistency_score: number;
  cross_source_score: number;
  official_data_score: number;
  media_authenticity_score: number;
  ai_confidence_score: number;
  final_score: number;
}

export interface AlertRow {
  id: string;
  event_id: string;
  severity: EventSeverity;
  channel: string;
  message: string;
  sent_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  role: "citizen" | "researcher" | "admin" | "super_admin";
  reliability_score: number;
}

export const EVENT_TYPE_LABELS: Record<WeatherEventType, string> = {
  heavy_rainfall: "Heavy Rainfall",
  normal_rainfall: "Rainfall",
  thunderstorm: "Thunderstorm",
  flood: "Flood",
  flash_flood: "Flash Flood",
  heatwave: "Heatwave",
  fog: "Fog",
  dust_storm: "Dust Storm",
  strong_winds: "Strong Winds",
  cyclone: "Cyclone",
  hailstorm: "Hailstorm",
  lightning: "Lightning",
  other: "Other",
};

export const SEVERITY_COLOR: Record<EventSeverity, string> = {
  low: "#8891B5",
  medium: "#E8A33D",
  high: "#E1614F",
  critical: "#E1614F",
};
