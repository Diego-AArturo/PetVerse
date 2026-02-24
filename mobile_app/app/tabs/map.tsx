import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/Theme/colors";

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
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const initRef = useRef(false);

  // función de búsqueda/geo-coding
  const onSearch = useCallback(async () => {
    if (!maptilerKey || !searchQuery) return;
    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
        searchQuery
      )}.json?key=${maptilerKey}`;
      const resp = await fetch(url);
      const json = await resp.json();
      if (json.features && json.features.length > 0) {
        const [lng, lat] = json.features[0].geometry.coordinates;
        setUserLocation([lng, lat]);
      } else {
        console.log("[Search] no results for", searchQuery);
      }
    } catch (err) {
      console.log("[Search] error", err);
    }
    Keyboard.dismiss();
  }, [maptilerKey, searchQuery]);

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
    if (!Location) {
      console.log("[Location] Module not available, skipping location");
      return;
    }

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Permiso de ubicación denegado");
          console.log("[Location] Permission denied");
          // fallback to approximate via IP lookup ' marcar ubicacion de la persona
          try {
            const resp = await fetch("https://ipapi.co/json/");
            const json = await resp.json();
            if (json && json.latitude && json.longitude) {
              setUserLocation([json.longitude, json.latitude]);
            }
          } catch (e) {
            console.log("[Location] IP geolocation failed", e);
          }
          return;
        }

        setPermissionGranted(true);
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
        // try to fall back to IP location as well
        try {
          const resp2 = await fetch("https://ipapi.co/json/");
          const j2 = await resp2.json();
          if (j2 && j2.latitude && j2.longitude) {
            setUserLocation([j2.longitude, j2.latitude]);
          } else {
            setUserLocation(DEFAULT_COORDINATES);
          }
        } catch (e2) {
          console.log("[Location] fallback IP failed", e2);
          setUserLocation(DEFAULT_COORDINATES);
        }
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
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
        <Text style={styles.subtitle}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* search + filters section */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar dirección o lugar"
            placeholderTextColor={COLORS.tabInactive}
            returnKeyType="search"
            onSubmitEditing={onSearch}
            onFocus={() => setShowFilters(true)}
            onBlur={() => setShowFilters(false)}
          />
        </View>
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {[
              { label: 'Veterinarias', icon: 'medkit' },
              { label: 'Pet Friendly', icon: 'heart' },
              { label: 'Heladerías', icon: 'ice-cream' },
              { label: 'Restaurantes', icon: 'restaurant' },
              { label: 'Tiendas', icon: 'storefront' },
              { label: 'Guarderías', icon: 'school' },
            ].map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.filterPill}
                onPress={() => {
                  setSearchQuery(item.label);
                  onSearch();
                }}
              >
                <Ionicons name={item.icon as any} size={14} color={COLORS.bgDark} />
                <Text style={styles.filterText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      <MapLibreGL.MapView
        style={{ flex: 1 }}
        styleJSON={EMPTY_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFailLoadingMap={(e: any) => logEvent("DidFailLoadingMap", e?.nativeEvent)}
        onMapError={(e: any) => logEvent("MapError", e?.nativeEvent)}
      >
        {/* user location dot */}
        <MapLibreGL.UserLocation visible={permissionGranted} />
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
          followUserLocation={permissionGranted}
        />

      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark, padding: 0 },
  centered: { justifyContent: "center", alignItems: "center" },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "800" },
  subtitle: { color: COLORS.textSecondary, marginTop: 6 },
  searchWrapper: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.textPrimary,
    borderRadius: 20,
    paddingHorizontal: 8,
    height: 44,
  },
  searchIcon: {
    marginRight: 6,
    fontSize: 18,
    color: COLORS.tabInactive,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  filtersContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  filterPill: {
    backgroundColor: COLORS.textPrimary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterText: {
    fontSize: 12,
    color: COLORS.bgDark,
    marginLeft: 4,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(123, 92, 255, 0.3)", // translucent purple
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.cardPurple,
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.cardPurple,
  },
});
