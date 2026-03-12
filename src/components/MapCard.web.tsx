import { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  GOOGLE_MAP_STYLES,
  buildStreetEndpoints,
  findHighlightedStreet,
  mapCardStyles,
  type MapCardProps,
} from './mapCardShared';
import { palette } from '../theme';

declare global {
  interface Window {
    google?: any;
    __streetGuesserGoogleMapsPromise?: Promise<any>;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!window.__streetGuesserGoogleMapsPromise) {
    window.__streetGuesserGoogleMapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.maps) {
          resolve(window.google.maps);
          return;
        }

        reject(new Error('Google Maps failed to initialize.'));
      };
      script.onerror = () => reject(new Error('Google Maps script failed to load.'));
      document.head.appendChild(script);
    });
  }

  return window.__streetGuesserGoogleMapsPromise;
}

export function MapCard({ districtName, accent, streets, answerId }: MapCardProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const highlightedStreet = findHighlightedStreet(streets, answerId);
  const endpoints = highlightedStreet ? buildStreetEndpoints(highlightedStreet) : null;

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !mapRef.current || !highlightedStreet || !endpoints) {
      return;
    }

    let isActive = true;

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then((maps) => {
        if (!isActive || !mapRef.current) {
          return;
        }

        const map = new maps.Map(mapRef.current, {
          clickableIcons: false,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          keyboardShortcuts: false,
          mapTypeControl: false,
          mapTypeId: 'roadmap',
          scaleControl: false,
          streetViewControl: false,
          styles: GOOGLE_MAP_STYLES,
        });

        const directionsService = new maps.DirectionsService();
        const directionsRenderer = new maps.DirectionsRenderer({
          map,
          markerOptions: {
            clickable: false,
            icon: {
              path: maps.SymbolPath.CIRCLE,
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
            destination: endpoints.end,
            origin: endpoints.start,
            travelMode: maps.TravelMode.DRIVING,
          },
          (result: any, status: string) => {
            if (!isActive || status !== 'OK' || !result) {
              return;
            }

            directionsRenderer.setDirections(result);
          },
        );
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, [accent, endpoints, highlightedStreet]);

  return (
    <View style={mapCardStyles.card}>
      <View style={mapCardStyles.header}>
        <Text style={mapCardStyles.districtLabel}>{districtName}</Text>
        <View style={[mapCardStyles.legendBadge, { borderColor: accent }]}>
          <View style={[mapCardStyles.legendDot, { backgroundColor: accent }]} />
          <Text style={mapCardStyles.legendText}>Target road</Text>
        </View>
      </View>

      {GOOGLE_MAPS_API_KEY ? (
        <View style={mapCardStyles.mapFrame}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
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
