import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View, ActivityIndicator } from "react-native";

// Importar MapLibre solo en native (fuera del componente para evitar re-imports)
const MapLibreGL =
  Platform.OS !== "web"
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@maplibre/maplibre-react-native").default
    : null;

// Import dinámico de expo-location para evitar crash si no está el módulo nativo
let Location: typeof import("expo-location") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Location = require("expo-location");
} catch {
  console.log("[Location] Native module not available");
}

// Estilo vacío minimal para evitar que cargue el estilo demo por defecto
const EMPTY_STYLE = JSON.stringify({
  version: 8,
  sources: {},
  layers: [],
});

// Coordenadas por defecto (Bogotá)
const DEFAULT_COORDINATES: [number, number] = [-74.0817, 4.6097];

export default function MapScreen() {
  const maptilerKey = process.env.EXPO_PUBLIC_MAPTILER_KEY;
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const initRef = useRef(false);

  // URL de tiles raster de MapTiler
  const tileURL = maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${maptilerKey}`
    : undefined;

  // Helpers to log rich info from native events.
  const logEvent = useCallback((label: string, payload: any) => {
    try {
      const safe =
        typeof payload === "object"
          ? JSON.stringify(payload, (key, value) => (key === "_bytes" ? "[bytes]" : value), 2)
          : payload;
      console.log(`[MapLibre][${label}]`, safe);
    } catch (err) {
      console.log(`[MapLibre][${label}] payload-unserializable`, String(err));
    }
  }, []);

  // Inicializar MapLibre una sola vez ANTES de renderizar el mapa
  useEffect(() => {
    if (!MapLibreGL || initRef.current) return;
    initRef.current = true;

    const initMapLibre = async () => {
      try {
        // Desactivar telemetría
        MapLibreGL.setTelemetryEnabled?.(false);
        // Setear access token a null (requerido para MapTiler/otros providers)
        MapLibreGL.setAccessToken(null);
        
        // Logger solo para errores (evita spam de debug/verbose)
        MapLibreGL.Logger?.setLogLevel?.("error");

        console.log("[MapLibre] Initialized successfully");
        setIsMapReady(true);
      } catch (e) {
        console.log("[MapLibre][InitError]", e);
        setIsMapReady(true); // Intentar renderizar de todos modos
      }
    };

    initMapLibre();
  }, []);

  // Log config solo en desarrollo (comentar en producción)
  useEffect(() => {
    if (isMapReady && maptilerKey && __DEV__) {
      logEvent("Config", {
        platform: Platform.OS,
        maptilerKey: maptilerKey?.slice(0, 4) + "***",
        tileURL: tileURL?.replace(maptilerKey || "", "***"),
      });
    }
  }, [isMapReady, maptilerKey, tileURL, logEvent]);

  // Solicitar permisos de ubicación y obtener la posición actual
  useEffect(() => {
    // Si expo-location no está disponible, saltar
    if (!Location) {
      console.log("[Location] Module not available, skipping location");
      return;
    }

    const getLocation = async () => {
      try {
        // Solicitar permisos de ubicación en primer plano
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== "granted") {
          setLocationError("Permiso de ubicación denegado");
          console.log("[Location] Permission denied");
          return;
        }

        // Obtener ubicación actual
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords: [number, number] = [
          location.coords.longitude,
          location.coords.latitude,
        ];
        
        setUserLocation(coords);
        console.log("[Location] User location:", coords);
      } catch (error) {
        console.log("[Location] Error getting location:", error);
        setLocationError("Error al obtener ubicación");
      }
    };

    getLocation();
  }, []);

  if (!MapLibreGL) {
    // Web fallback
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mapa</Text>
        <Text style={styles.subtitle}>Vista web usando OpenStreetMap.</Text>
        <iframe
          title="mapa-web"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-74.15%2C4.56%2C-74.01%2C4.66&layer=mapnik&marker=4.6097%2C-74.0817"
          style={{ border: 0, width: "100%", height: "100%", flex: 1 }}
        />
      </View>
    );
  }

  if (!maptilerKey) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Falta MAPTILER KEY</Text>
        <Text style={styles.subtitle}>
          Define EXPO_PUBLIC_MAPTILER_KEY en .env y reinicia Metro.
        </Text>
      </View>
    );
  }

  // Mostrar loader mientras se inicializa MapLibre
  if (!isMapReady) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.subtitle}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={{ flex: 1 }}
        styleJSON={EMPTY_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFailLoadingMap={(e: any) => logEvent("DidFailLoadingMap", e?.nativeEvent)}
        onMapError={(e: any) => logEvent("MapError", e?.nativeEvent)}
      >
        {/* RasterSource con tiles de MapTiler */}
        <MapLibreGL.RasterSource
          id="maptilerSource"
          tileUrlTemplates={[tileURL!]}
          tileSize={256}
          minZoomLevel={0}
          maxZoomLevel={19}
        >
          <MapLibreGL.RasterLayer
            id="maptilerLayer"
            sourceID="maptilerSource"
            style={{ rasterOpacity: 1 }}
          />
        </MapLibreGL.RasterSource>

        <MapLibreGL.Camera
          zoomLevel={14}
          centerCoordinate={userLocation || DEFAULT_COORDINATES}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <MapLibreGL.PointAnnotation
            id="userLocation"
            coordinate={userLocation}
            title="Tu ubicación"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </MapLibreGL.PointAnnotation>
        )}
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141033", padding: 0 },
  centered: { justifyContent: "center", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#d0c9f7", marginTop: 6 },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(66, 133, 244, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4285F4",
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4285F4",
  },
});
