import type { DashboardFilters } from "../lib/filters";
import { INDIAN_STATES } from "../lib/filters";
import { EVENT_TYPE_LABELS } from "../lib/types";

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[var(--mist)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-[var(--panel-raised)] border border-[var(--line)] px-2 py-1.5 text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--teal)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function FiltersPanel({
  filters,
  onChange,
}: {
  filters: DashboardFilters;
  onChange: (next: DashboardFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 border-b border-[var(--line)]">
      <h3 className="text-xs uppercase tracking-wide text-[var(--mist)]">Filters</h3>

      <Select
        label="Event type"
        value={filters.eventType}
        onChange={(v) => onChange({ ...filters, eventType: v })}
        options={[
          { value: "all", label: "All types" },
          ...Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value: value as typeof filters.eventType, label })),
        ]}
      />

      <Select
        label="Severity"
        value={filters.severity}
        onChange={(v) => onChange({ ...filters, severity: v })}
        options={[
          { value: "all", label: "All severities" },
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
          { value: "critical", label: "Critical" },
        ]}
      />

      <Select
        label="State"
        value={filters.state}
        onChange={(v) => onChange({ ...filters, state: v })}
        options={[{ value: "all", label: "All states" }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))]}
      />

      <Select
        label="Time window"
        value={String(filters.sinceHours)}
        onChange={(v) => onChange({ ...filters, sinceHours: Number(v) })}
        options={[
          { value: "6", label: "Last 6 hours" },
          { value: "24", label: "Last 24 hours" },
          { value: "48", label: "Last 48 hours" },
          { value: "168", label: "Last 7 days" },
        ]}
      />
    </div>
  );
}
