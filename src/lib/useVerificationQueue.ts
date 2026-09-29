import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { VerificationRow, WeatherReportRow } from "./types";

export interface QueueItem extends WeatherReportRow {
  verifications: VerificationRow | null;
}

export function useVerificationQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("weather_reports")
      .select("*, verifications(*)")
      .in("verification_status", ["pending", "suspicious"])
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("failed to load verification queue", error);
      setItems([]);
    } else {
      // Supabase returns the related one-to-one row as an array; normalize it.
      const normalized = (data ?? []).map((row: WeatherReportRow & { verifications: VerificationRow[] | VerificationRow | null }) => ({
        ...row,
        verifications: Array.isArray(row.verifications) ? row.verifications[0] ?? null : row.verifications,
      }));
      setItems(normalized as QueueItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(reportId: string, decision: "verified" | "rejected") {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("weather_reports")
      .update({ verification_status: decision })
      .eq("id", reportId);
    if (error) {
      console.error("failed to update report status", error);
      return;
    }
    if (userData.user) {
      await supabase.from("verifications").update({
        verified_by: userData.user.id,
        verified_at: new Date().toISOString(),
      }).eq("report_id", reportId);
      await supabase.from("audit_logs").insert({
        actor_id: userData.user.id,
        action: `report_${decision}`,
        target_table: "weather_reports",
        target_id: reportId,
      });
    }
    setItems((prev) => prev.filter((i) => i.id !== reportId));
  }

  return { items, loading, refresh: load, decide };
}
