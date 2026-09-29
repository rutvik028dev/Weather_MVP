import { useState } from "react";
import { StatsStrip } from "../components/StatsStrip";
import { LiveMap } from "../components/LiveMap";
import { FiltersPanel } from "../components/FiltersPanel";
import { EventFeed } from "../components/EventFeed";
import { useLiveEvents } from "../lib/useLiveEvents";
import { DEFAULT_FILTERS } from "../lib/filters";

export function Dashboard() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { events, loading } = useLiveEvents(filters);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StatsStrip />
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative">
          <LiveMap events={events} />
        </div>
        <aside className="w-80 flex-shrink-0 border-l border-[var(--line)] bg-[var(--panel)] flex flex-col min-h-0">
          <FiltersPanel filters={filters} onChange={setFilters} />
          <EventFeed events={events} loading={loading} />
        </aside>
      </div>
    </div>
  );
}
