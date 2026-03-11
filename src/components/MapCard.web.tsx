import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useId, useRef } from 'react';
import { Text, View } from 'react-native';

import { GOOGLE_MAP_STYLES, buildStreetPath, findHighlightedStreet, mapCardStyles, type MapCardProps } from './mapCardShared';

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
  const mapId = useId().replace(/:/g, '-');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const highlightedStreet = findHighlightedStreet(streets, answerId);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !mapRef.current || !highlightedStreet) {
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

        const bounds = new maps.LatLngBounds();

        streets.forEach((street) => {
          const path = buildStreetPath(street);
          path.forEach((point) => bounds.extend(point));
          new maps.Polyline({
            geodesic: false,
            map,
            path,
            strokeColor: '#7890a6',
            strokeOpacity: 0.78,
            strokeWeight: 5,
          });
        });

        const highlightPath = buildStreetPath(highlightedStreet);
        new maps.Polyline({
          geodesic: false,
          map,
          path: highlightPath,
          strokeColor: accent,
          strokeOpacity: 0.26,
          strokeWeight: 14,
        });
        new maps.Polyline({
          geodesic: false,
          map,
          path: highlightPath,
          strokeColor: '#ffd36b',
          strokeOpacity: 1,
          strokeWeight: 8,
        });

        map.fitBounds(bounds, 40);
      })
      .catch(() => {
        // Leave the fallback state in place if the script cannot load.
      });

    return () => {
      isActive = false;
    };
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

      {GOOGLE_MAPS_API_KEY ? (
        <View style={mapCardStyles.mapFrame}>
          <div id={mapId} ref={mapRef} style={{ width: '100%', height: '100%' }} />
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
