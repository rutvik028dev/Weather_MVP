import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/useAuth";

type Coords = { lat: number; lon: number } | null;
type SubmitState = "idle" | "locating" | "submitting" | "done" | "error";

export function ReportForm() {
  const { session } = useAuth();
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<Coords>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationError("This browser doesn't support location capture.");
      return;
    }
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationError(null);
        setState("idle");
      },
      (err) => {
        setLocationError(err.message || "Couldn't get your location — check the browser's location permission.");
        setState("idle");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) {
      setLocationError("Please share your location so the report can be placed on the map.");
      return;
    }
    if (description.trim().length < 5) return;

    setState("submitting");
    setError(null);

    try {
      const { data: report, error: insertError } = await supabase
        .from("weather_reports")
        .insert({
          reporter_id: session?.user.id ?? null,
          event_time: new Date().toISOString(),
          latitude: coords.lat,
          longitude: coords.lon,
          description: description.trim(),
          is_flagged_emergency: isEmergency,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      if (file && report) {
        const path = `${report.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from("report-media").upload(path, file);
        if (uploadError) throw uploadError;

        const mediaType = file.type.startsWith("video") ? "video" : "image";
        await supabase.from("media").insert({
          report_id: report.id,
          media_type: mediaType,
          storage_path: path,
        });
      }

      setState("done");
      setDescription("");
      setFile(null);
      setIsEmergency(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong submitting the report.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center px-4">
        <h2 className="text-xl font-semibold mb-2">Report received</h2>
        <p className="text-[var(--mist)] text-sm mb-6">
          Thank you. It's now going through automated classification and verification, and will appear on the
          live map once processed.
        </p>
        <button
          onClick={() => setState("idle")}
          className="px-4 py-2 border border-[var(--line)] hover:border-[var(--teal)] transition-colors text-sm"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 pb-16">
      <h2 className="text-xl font-semibold mb-1">Report current weather</h2>
      <p className="text-sm text-[var(--mist)] mb-6">
        Seen flooding, a dust storm, unusually heavy rain, or anything else worth flagging nearby? Describe it
        below — every report is cross-checked, not taken at face value.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          What are you seeing?
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={5}
            rows={4}
            placeholder="e.g. Heavy waterlogging near Andheri station, knee-deep water on the main road"
            className="bg-[var(--panel-raised)] border border-[var(--line)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--teal)]"
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span>Location</span>
          <button
            type="button"
            onClick={captureLocation}
            className="self-start px-3 py-1.5 border border-[var(--line)] text-sm hover:border-[var(--teal)] transition-colors"
          >
            {state === "locating" ? "Getting location…" : coords ? "Location captured ✓" : "Share my location"}
          </button>
          {coords && (
            <span className="text-xs text-[var(--mist)]">
              {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
            </span>
          )}
          {locationError && <span className="text-xs text-[var(--coral)]">{locationError}</span>}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Photo or video (optional)
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs text-[var(--mist)]"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} />
          This involves an immediate emergency (injury, trapped people, major damage)
        </label>

        {error && <p className="text-sm text-[var(--coral)]">{error}</p>}

        <button
          type="submit"
          disabled={state === "submitting"}
          className="mt-2 px-4 py-2 bg-[var(--teal)] text-[var(--ink)] font-medium text-sm hover:brightness-110 transition disabled:opacity-50"
        >
          {state === "submitting" ? "Submitting…" : "Submit report"}
        </button>

        {!session && (
          <p className="text-xs text-[var(--mist)]">
            Submitting without an account works, but signing in lets your reports build a reliability history that
            speeds up how fast they're verified.
          </p>
        )}
      </form>
    </div>
  );
}
