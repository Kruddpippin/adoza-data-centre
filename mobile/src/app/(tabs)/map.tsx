import { useMemo, useRef } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useDashboardData } from "@/hooks/useData";
import { EmptyState, ErrorState, Spinner } from "@/components/ui";
import { VERIFICATION_META, type VerificationStatus } from "@/lib/utils";

const STATUS_COLORS: Record<VerificationStatus, string> = {
  pending: "#f59e0b",
  verified: "#059669",
  rejected: "#ef4444",
  flagged: "#f97316",
};

// Same OpenStreetMap/Leaflet approach as the web app's FieldMap.jsx — no API key needed,
// unlike react-native-maps' Google provider which requires a Google Cloud Maps API key.
function buildMapHtml(points: any[]) {
  const markers = points.map((y) => ({
    id: y.id,
    lat: Number(y.latitude),
    lng: Number(y.longitude),
    color: STATUS_COLORS[y.verification_status as VerificationStatus] ?? "#64748b",
    name: `${y.first_name} ${y.last_name}`,
    wardLga: `${y.ward}, ${y.lga}`,
    status: VERIFICATION_META[y.verification_status as VerificationStatus]?.label ?? "",
    beneficiary: !!y.is_approved_beneficiary,
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .popup-title { font-weight: 600; margin: 0 0 2px; }
    .popup-line { font-size: 12px; margin: 0 0 2px; color: #333; }
    .popup-link { font-size: 12px; color: #1a5c3a; font-weight: 600; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([7.65, 6.75], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const points = ${JSON.stringify(markers)};
    points.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 8, color: p.color, fillColor: p.color, fillOpacity: 0.7, weight: 2,
      }).addTo(map);
      const popupHtml =
        '<div style="min-width:160px">' +
          '<p class="popup-title">' + p.name + '</p>' +
          '<p class="popup-line">' + p.wardLga + '</p>' +
          '<p class="popup-line">Status: ' + p.status + (p.beneficiary ? ' &middot; Beneficiary' : '') + '</p>' +
          '<p class="popup-link" id="view-' + p.id + '">View profile &rarr;</p>' +
        '</div>';
      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const el = document.getElementById('view-' + p.id);
        if (el) el.onclick = () => window.ReactNativeWebView.postMessage(p.id);
      });
    });
  </script>
</body>
</html>`;
}

export default function FieldMap() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDashboardData();
  const webviewRef = useRef<WebView>(null);

  const points = useMemo(
    () => (data?.youths ?? []).filter((y: any) => y.latitude != null && y.longitude != null),
    [data]
  );

  const html = useMemo(() => buildMapHtml(points), [points]);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="gap-2 p-4 pb-2">
        <Text className="text-sm text-muted-foreground">
          GPS locations captured during door-to-door registration ({points.length} of {data?.youths?.length ?? 0} records have coordinates).
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <View key={status} className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1">
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <Text className="text-xs text-foreground">{VERIFICATION_META[status as VerificationStatus].label}</Text>
            </View>
          ))}
        </View>
      </View>

      {!points.length ? (
        <EmptyState title="No GPS data yet" message="Candidate registrations with captured coordinates will appear here." />
      ) : (
        <WebView
          ref={webviewRef}
          source={{ html }}
          style={{ flex: 1 }}
          onMessage={(event) => router.push(`/youths/${event.nativeEvent.data}`)}
        />
      )}
    </SafeAreaView>
  );
}
