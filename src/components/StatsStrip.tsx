import { useOverviewStats } from "../lib/useOverviewStats";

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-5 py-3 border-r border-[var(--line)] last:border-r-0">
      <span className="display text-2xl font-semibold" style={accent ? { color: accent } : undefined}>
        {value.toLocaleString("en-IN")}
      </span>
      <span className="text-xs text-[var(--mist)]">{label}</span>
    </div>
  );
}

export function StatsStrip() {
  const s = useOverviewStats();

  return (
    <div className="flex overflow-x-auto border-b border-[var(--line)] bg-[var(--panel)]/60">
      <Stat label="Total reports" value={s.totalReports} />
      <Stat label="Verified" value={s.verifiedReports} accent="var(--teal)" />
      <Stat label="Under review" value={s.pendingReports} accent="var(--amber)" />
      <Stat label="Suspicious" value={s.suspiciousReports} accent="var(--coral)" />
      <Stat label="Active events" value={s.activeEvents} />
      <Stat label="Critical events" value={s.criticalEvents} accent="var(--coral)" />
      <Stat label="Reports (last hour)" value={s.reportsLastHour} />
    </div>
  );
}
