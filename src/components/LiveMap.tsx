import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { WeatherEventRow } from "../lib/types";
import { EVENT_TYPE_LABELS, SEVERITY_COLOR } from "../lib/types";

// Free, keyless raster tiles (OpenStreetMap's own tile server) -- fine for
// the MVP's traffic; the design doc's Section 9 calls for self-hosting a
// tile server (e.g. tileserver-gl) before this goes to national scale, to
// respect OSM's usage policy at volume.
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    { id: "osm", type: "raster", source: "osm" },
    // a dark scrim so the raster tiles sit closer to the ops-room palette
    // without needing a paid vector-tile style
  ],
};

const INDIA_CENTER: [number, number] = [79.0, 22.5];

export function LiveMap({ events }: { events: WeatherEventRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: INDIA_CENTER,
      zoom: 4.2,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const evt of events) {
      const color = SEVERITY_COLOR[evt.severity];
      const el = document.createElement("div");
      el.style.width = evt.severity === "critical" || evt.severity === "high" ? "16px" : "11px";
      el.style.height = el.style.width;
      el.style.borderRadius = "50%";
      el.style.background = color;
      el.style.border = "2px solid rgba(237,239,247,0.85)";
      el.style.boxShadow = `0 0 0 4px ${color}33`;

      const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(`
        <div style="font-family:'IBM Plex Sans',system-ui,sans-serif; min-width:180px">
          <div style="font-weight:600; margin-bottom:2px">${EVENT_TYPE_LABELS[evt.event_type]}</div>
          <div style="font-size:12px; color:#8891B5; margin-bottom:6px">
            ${[evt.city, evt.district, evt.state].filter(Boolean).join(", ")}
          </div>
          <div style="font-size:12px; display:flex; justify-content:space-between">
            <span>Severity</span><span style="color:${color}; text-transform:capitalize">${evt.severity}</span>
          </div>
          <div style="font-size:12px; display:flex; justify-content:space-between">
            <span>Reports</span><span>${evt.report_count}</span>
          </div>
          <div style="font-size:12px; display:flex; justify-content:space-between">
            <span>Status</span><span style="text-transform:capitalize">${evt.status}</span>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([evt.lon, evt.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [events]);

  return <div ref={containerRef} className="h-full w-full" />;
}
