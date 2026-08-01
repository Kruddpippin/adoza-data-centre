import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Map as MapIcon } from "lucide-react";
import { useDashboardData } from "@/hooks/useData";
import { Card, Spinner, ErrorState, EmptyState, Badge } from "@/components/ui";
import { VERIFICATION_META } from "@/lib/utils";

const STATUS_COLORS = {
  pending: "#f59e0b",
  verified: "#059669",
  rejected: "#ef4444",
  flagged: "#f97316",
};

export default function FieldMap() {
  const { data, isLoading, isError, refetch } = useDashboardData();

  const points = useMemo(
    () => (data?.youths ?? []).filter((y) => y.latitude != null && y.longitude != null),
    [data]
  );

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <h1 className="font-display text-xl font-bold tracking-tight lg:text-2xl">Field Map</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          GPS locations captured during door-to-door registration ({points.length} of {data?.youths?.length ?? 0} records have coordinates).
        </p>
      </div>

      <div className="flex flex-wrap gap-2 animate-fade-up">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
            {VERIFICATION_META[status].label}
          </span>
        ))}
      </div>

      {!points.length ? (
        <EmptyState icon={MapIcon} title="No GPS data yet" message="Youth registrations with captured coordinates will appear here." />
      ) : (
        <Card className="animate-fade-up overflow-hidden p-0">
          <MapContainer
            center={[7.65, 6.75]}
            zoom={8}
            style={{ height: "min(65vh, 560px)", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((y) => (
              <CircleMarker
                key={y.id}
                center={[y.latitude, y.longitude]}
                radius={8}
                pathOptions={{
                  color: STATUS_COLORS[y.verification_status] ?? "#64748b",
                  fillColor: STATUS_COLORS[y.verification_status] ?? "#64748b",
                  fillOpacity: 0.7,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <p style={{ fontWeight: 600, margin: 0 }}>{y.first_name} {y.last_name}</p>
                    <p style={{ margin: "2px 0", fontSize: 12 }}>{y.ward}, {y.lga}</p>
                    <p style={{ margin: "2px 0", fontSize: 12 }}>
                      Status: {VERIFICATION_META[y.verification_status]?.label}
                      {y.is_approved_beneficiary ? " · Beneficiary" : ""}
                    </p>
                    <Link to={`/youths/${y.id}`} style={{ fontSize: 12 }}>View profile →</Link>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </Card>
      )}

      <p className="text-[11px] text-muted-foreground">
        Map data © OpenStreetMap contributors. <Badge className="bg-muted text-muted-foreground">Live from Supabase</Badge>
      </p>
    </div>
  );
}
