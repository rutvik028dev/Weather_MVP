import type { WeatherEventRow } from "../lib/types";
import { EVENT_TYPE_LABELS, SEVERITY_COLOR } from "../lib/types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function EventFeed({ events, loading }: { events: WeatherEventRow[]; loading: boolean }) {
  return (
    <div className="flex flex-col overflow-y-auto flex-1">
      <h3 className="text-xs uppercase tracking-wide text-[var(--mist)] px-4 pt-4 pb-2">
        Live events {loading && <span className="text-[var(--mist)]">— loading…</span>}
      </h3>

      {!loading && events.length === 0 && (
        <p className="px-4 py-6 text-sm text-[var(--mist)]">
          No weather events match these filters right now. Widen the time window or clear a filter.
        </p>
      )}

      <ul className="flex flex-col">
        {events.map((evt) => {
          const color = SEVERITY_COLOR[evt.severity];
          return (
            <li key={evt.id} className="px-4 py-3 border-t border-[var(--line)] first:border-t-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{EVENT_TYPE_LABELS[evt.event_type]}</span>
                <span
                  className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 border"
                  style={{ color, borderColor: color }}
                >
                  {evt.severity}
                </span>
              </div>
              <p className="text-xs text-[var(--mist)] mt-0.5">
                {[evt.city, evt.district, evt.state].filter(Boolean).join(", ") || "Location pending review"}
              </p>
              <div className="flex items-center justify-between mt-1.5 text-xs text-[var(--mist)]">
                <span>{evt.report_count} report{evt.report_count === 1 ? "" : "s"} · {evt.status}</span>
                <span>{timeAgo(evt.last_report_at)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
