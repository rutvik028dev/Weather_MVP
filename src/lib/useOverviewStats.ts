import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";

export interface OverviewStats {
  totalReports: number;
  verifiedReports: number;
  pendingReports: number;
  suspiciousReports: number;
  activeEvents: number;
  criticalEvents: number;
  reportsLastHour: number;
}

const EMPTY: OverviewStats = {
  totalReports: 0,
  verifiedReports: 0,
  pendingReports: 0,
  suspiciousReports: 0,
  activeEvents: 0,
  criticalEvents: 0,
  reportsLastHour: 0,
};

async function safeCount(promise: PromiseLike<{ count: number | null; error: unknown }>): Promise<number> {
  const { count: n, error } = await promise;
  if (error) {
    console.error("count query failed", error);
    return 0;
  }
  return n ?? 0;
}

export function useOverviewStats(pollMs = 30_000) {
  const [stats, setStats] = useState<OverviewStats>(EMPTY);

  const load = useCallback(async () => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const [total, verified, pending, suspicious, active, critical, lastHour] = await Promise.all([
      safeCount(supabase.from("weather_reports").select("*", { count: "exact", head: true })),
      safeCount(
        supabase.from("weather_reports").select("*", { count: "exact", head: true }).eq(
          "verification_status",
          "verified",
        ),
      ),
      safeCount(
        supabase.from("weather_reports").select("*", { count: "exact", head: true }).eq(
          "verification_status",
          "pending",
        ),
      ),
      safeCount(
        supabase.from("weather_reports").select("*", { count: "exact", head: true }).eq(
          "verification_status",
          "suspicious",
        ),
      ),
      safeCount(
        supabase.from("weather_events").select("*", { count: "exact", head: true }).in(
          "status",
          ["active", "escalating", "emerging"],
        ),
      ),
      safeCount(
        supabase.from("weather_events").select("*", { count: "exact", head: true }).eq("severity", "critical"),
      ),
      safeCount(
        supabase.from("weather_reports").select("*", { count: "exact", head: true }).gte(
          "created_at",
          hourAgo,
        ),
      ),
    ]);

    setStats({
      totalReports: total,
      verifiedReports: verified,
      pendingReports: pending,
      suspiciousReports: suspicious,
      activeEvents: active,
      criticalEvents: critical,
      reportsLastHour: lastHour,
    });
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  return stats;
}
