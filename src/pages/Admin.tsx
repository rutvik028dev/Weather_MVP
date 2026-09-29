import { useVerificationQueue } from "../lib/useVerificationQueue";
import { EVENT_TYPE_LABELS } from "../lib/types";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-32 text-[var(--mist)] flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[var(--panel-raised)]">
        <div
          className="h-full"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: value >= 60 ? "var(--teal)" : value >= 35 ? "var(--amber)" : "var(--coral)",
          }}
        />
      </div>
      <span className="w-8 text-right tabular-nums">{Math.round(value)}</span>
    </div>
  );
}

export function Admin() {
  const { items, loading, decide } = useVerificationQueue();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-1">Verification queue</h2>
      <p className="text-sm text-[var(--mist)] mb-6">
        Reports awaiting review or flagged as suspicious by the scoring model. Nothing here is a certainty —
        review the score breakdown and decide.
      </p>

      {loading && <p className="text-sm text-[var(--mist)]">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-[var(--mist)]">Nothing needs review right now.</p>
      )}

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {item.ai_event_type ? EVENT_TYPE_LABELS[item.ai_event_type] : "Unclassified"}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 border ${
                      item.verification_status === "suspicious"
                        ? "border-[var(--coral)] text-[var(--coral)]"
                        : "border-[var(--amber)] text-[var(--amber)]"
                    }`}
                  >
                    {item.verification_status}
                  </span>
                  {item.is_flagged_emergency && (
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 border border-[var(--coral)] text-[var(--coral)]">
                      Emergency flag
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--mist)] mt-0.5">
                  {[item.city, item.district, item.state].filter(Boolean).join(", ") || "Location not resolved"}
                  {" · "}
                  {new Date(item.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <span className="text-lg font-semibold tabular-nums flex-shrink-0">
                {item.confidence_score !== null ? Math.round(item.confidence_score) : "—"}
              </span>
            </div>

            <p className="text-sm mb-3">{item.description}</p>

            {item.verifications && (
              <div className="flex flex-col gap-1 mb-3 bg-[var(--panel-raised)]/40 p-2">
                <ScoreBar label="Source reliability" value={item.verifications.source_reliability_score} />
                <ScoreBar label="Location consistency" value={item.verifications.location_consistency_score} />
                <ScoreBar label="Time consistency" value={item.verifications.time_consistency_score} />
                <ScoreBar label="Cross-source confirmation" value={item.verifications.cross_source_score} />
                <ScoreBar label="Official data correlation" value={item.verifications.official_data_score} />
                <ScoreBar label="Media authenticity" value={item.verifications.media_authenticity_score} />
                <ScoreBar label="AI classifier confidence" value={item.verifications.ai_confidence_score} />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => decide(item.id, "verified")}
                className="px-3 py-1.5 text-sm border border-[var(--teal)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-[var(--ink)] transition-colors"
              >
                Confirm genuine
              </button>
              <button
                onClick={() => decide(item.id, "rejected")}
                className="px-3 py-1.5 text-sm border border-[var(--coral)] text-[var(--coral)] hover:bg-[var(--coral)] hover:text-[var(--ink)] transition-colors"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
