import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  GOOGLE_MAP_STYLES,
  buildStreetEndpoints,
  findHighlightedStreet,
  mapCardStyles,
  type MapCardProps,
} from './mapCardShared';
import { palette } from '../theme';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

function buildMapHtml({
  accent,
  destination,
  origin,
}: {
  accent: string;
  destination: { lat: number; lng: number };
  origin: { lat: number; lng: number };
}) {
  const mapStyles = JSON.stringify(GOOGLE_MAP_STYLES);

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
        background: #0c1a2b;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const accent = ${JSON.stringify(accent)};
      const destination = ${JSON.stringify(destination)};
      const mapStyles = ${mapStyles};
      const origin = ${JSON.stringify(origin)};

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

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          markerOptions: {
            clickable: false,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: accent,
              fillOpacity: 1,
              scale: 0,
              strokeOpacity: 0,
            },
          },
          polylineOptions: {
            strokeColor: accent,
            strokeOpacity: 1,
            strokeWeight: 8,
          },
          preserveViewport: false,
          suppressInfoWindows: true,
          suppressMarkers: true,
        });

        directionsService.route(
          {
            destination,
            origin,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status !== 'OK' || !result) {
              return;
            }

            directionsRenderer.setDirections(result);
          }
        );
      }
    </script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=renderMap"></script>
  </body>
</html>`;
}

export function MapCard({ districtName, accent, streets, answerId }: MapCardProps) {
  const highlightedStreet = findHighlightedStreet(streets, answerId);
  const endpoints = highlightedStreet ? buildStreetEndpoints(highlightedStreet) : null;
  const html = useMemo(() => {
    if (!GOOGLE_MAPS_API_KEY || !endpoints) {
      return null;
    }

    return buildMapHtml({
      accent,
      destination: endpoints.end,
      origin: endpoints.start,
    });
  }, [accent, endpoints]);

  return (
    <View style={mapCardStyles.card}>
      <View style={mapCardStyles.header}>
        <Text style={mapCardStyles.districtLabel}>{districtName}</Text>
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
          <ActivityIndicator color={palette.accent} size="small" />
          <Text style={mapCardStyles.fallbackTitle}>Map unavailable</Text>
          <Text style={mapCardStyles.fallbackBody}>
            Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to load the map.
          </Text>
        </View>
      )}

      <Text style={mapCardStyles.caption}>Labels hidden. Identify the highlighted road.</Text>
    </View>
  );
}
