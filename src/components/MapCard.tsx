import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { GOOGLE_MAP_STYLES, buildStreetPath, findHighlightedStreet, mapCardStyles, type MapCardProps } from './mapCardShared';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

function buildMapHtml({
  accent,
  answerId,
  streets,
}: {
  accent: string;
  answerId: string;
  streets: MapCardProps['streets'];
}) {
  const mapStyles = JSON.stringify(GOOGLE_MAP_STYLES);
  const serializedStreets = JSON.stringify(
    streets.map((street) => ({
      id: street.id,
      path: buildStreetPath(street),
    })),
  );

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <style>
      html, body, #map {
        margin: 0;
        height: 100%;
        width: 100%;
        background: #0f1e31;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const streets = ${serializedStreets};
      const answerId = ${JSON.stringify(answerId)};
      const accent = ${JSON.stringify(accent)};
      const mapStyles = ${mapStyles};

      function renderMap() {
        const map = new google.maps.Map(document.getElementById('map'), {
          clickableIcons: false,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          keyboardShortcuts: false,
          mapTypeControl: false,
          mapTypeId: 'roadmap',
          scaleControl: false,
          streetViewControl: false,
          styles: mapStyles,
        });

        const bounds = new google.maps.LatLngBounds();

        streets.forEach((street) => {
          street.path.forEach((point) => bounds.extend(point));
          new google.maps.Polyline({
            geodesic: false,
            map,
            path: street.path,
            strokeColor: '#7890a6',
            strokeOpacity: 0.78,
            strokeWeight: 5,
          });
        });

        const highlightedStreet = streets.find((street) => street.id === answerId);
        if (highlightedStreet) {
          new google.maps.Polyline({
            geodesic: false,
            map,
            path: highlightedStreet.path,
            strokeColor: accent,
            strokeOpacity: 0.26,
            strokeWeight: 14,
          });
          new google.maps.Polyline({
            geodesic: false,
            map,
            path: highlightedStreet.path,
            strokeColor: '#ffd36b',
            strokeOpacity: 1,
            strokeWeight: 8,
          });
        }

        map.fitBounds(bounds, 40);
      }
    </script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=renderMap"></script>
  </body>
</html>`;
}

export function MapCard({ districtName, accent, streets, answerId }: MapCardProps) {
  const highlightedStreet = findHighlightedStreet(streets, answerId);
  const html = useMemo(() => {
    if (!GOOGLE_MAPS_API_KEY || !highlightedStreet) {
      return null;
    }

    return buildMapHtml({ accent, answerId, streets });
  }, [accent, answerId, highlightedStreet, streets]);

  return (
    <LinearGradient colors={['#18324b', '#0f1e31', '#0a1523']} style={mapCardStyles.card}>
      <View style={mapCardStyles.header}>
        <View>
          <Text style={mapCardStyles.eyebrow}>{districtName}</Text>
          <Text style={mapCardStyles.title}>Google map. Street labels removed.</Text>
        </View>
        <View style={[mapCardStyles.legendBadge, { borderColor: accent }]}>
          <View style={[mapCardStyles.legendDot, { backgroundColor: accent }]} />
          <Text style={mapCardStyles.legendText}>Target road</Text>
        </View>
      </View>

      {html ? (
        <View style={mapCardStyles.mapFrame}>
          <WebView
            originWhitelist={['*']}
            scrollEnabled={false}
            source={{ html }}
            style={{ backgroundColor: 'transparent', flex: 1 }}
          />
        </View>
      ) : (
        <View style={mapCardStyles.fallbackWrap}>
          <Text style={mapCardStyles.fallbackTitle}>Google Maps key required</Text>
          <Text style={mapCardStyles.fallbackBody}>
            Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` to render the unlabeled Google basemap and road
            highlight.
          </Text>
        </View>
      )}

      <Text style={mapCardStyles.caption}>
        The basemap is standard Google roadmap styling, with road labels hidden and the target road
        drawn by the Google Maps API.
      </Text>
    </LinearGradient>
  );
}
