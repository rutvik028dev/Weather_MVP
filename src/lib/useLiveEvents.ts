import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import type { WeatherEventRow } from "./types";
import type { DashboardFilters } from "./filters";

export function useLiveEvents(filters: DashboardFilters) {
  const [events, setEvents] = useState<WeatherEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - filters.sinceHours * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from("weather_events_public")
      .select("*")
      .gte("last_report_at", since)
      .order("last_report_at", { ascending: false })
      .limit(200);

    if (filters.eventType !== "all") query = query.eq("event_type", filters.eventType);
    if (filters.severity !== "all") query = query.eq("severity", filters.severity);
    if (filters.state !== "all") query = query.eq("state", filters.state);

    const { data, error } = await query;
    if (error) {
      console.error("failed to load events", error);
      setEvents([]);
    } else {
      setEvents((data ?? []) as WeatherEventRow[]);
    }
    setLoading(false);
  }, [filters.eventType, filters.severity, filters.state, filters.sinceHours]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: any insert/update on weather_events refreshes the list. A
  // full refetch (rather than patching individual rows) keeps this simple
  // for the MVP; at national scale this would move to incremental patches.
  useEffect(() => {
    const channel = supabase
      .channel("weather_events_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "weather_events" },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { events, loading, refresh: load };
}
