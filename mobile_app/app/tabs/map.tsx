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
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const maptilerKey = process.env.EXPO_PUBLIC_MAPTILER_KEY;
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const initRef = useRef(false);

  // Manejar selección/deselección de filtros
  const toggleFilter = useCallback((filterLabel: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(filterLabel)) {
        return prev.filter(f => f !== filterLabel);
      } else {
        return [...prev, filterLabel];
      }
    });
  }, []);

  // Limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

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
          setLocationError(t("map.errors.locationDenied"));
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
        setLocationError(t("map.errors.locationError"));
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
        <Text style={styles.title}>{t("map.title")}</Text>
        <Text style={styles.subtitle}>{t("map.webFallback")}</Text>
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
        <Text style={styles.title}>{t("map.missingKey")}</Text>
        <Text style={styles.subtitle}>
          {t("map.missingKeyDescription")}
        </Text>
      </View>
    );
  }

  // Mostrar loader mientras se inicializa MapLibre
  if (!isMapReady) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
        <Text style={styles.subtitle}>{t("map.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Overlay para cerrar dropdown */}
      {showFilters && (
        <TouchableWithoutFeedback onPress={() => setShowFilters(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      
      {/* search + filters section */}
      <View style={styles.searchWrapper}>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={20} color={COLORS.tabInactive} style={{ marginRight: 6 }} />
          <Text style={styles.searchInputText}>
            {searchQuery || t("map.searchPlaceholder")}
          </Text>
          <Ionicons 
            name="search" 
            size={20} 
            color={COLORS.tabInactive} 
            style={{ marginLeft: 'auto' }} 
          />
        </TouchableOpacity>
        
        {showFilters && (
          <View style={styles.filtersDropdown}>
            {[
              { label: t('map.filters.veterinaries'), icon: 'medkit' },
              { label: t('map.filters.petFriendly'), icon: 'cafe' },
              { label: t('map.filters.iceCream'), icon: 'ice-cream' },
              { label: t('map.filters.restaurants'), icon: 'restaurant' },
              { label: t('map.filters.stores'), icon: 'bag-handle' },
              { label: t('map.filters.daycares'), icon: 'school' },
            ].map(item => {
              const isSelected = selectedFilters.includes(item.label);
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.filterItem,
                    isSelected && styles.filterItemSelected
                  ]}
                  onPress={() => toggleFilter(item.label)}
                >
                  <View style={[
                    styles.filterIcon,
                    isSelected && styles.filterIconSelected
                  ]}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={20} 
                      color={isSelected ? COLORS.textPrimary : COLORS.tabInactive} 
                    />
                  </View>
                  <Text style={styles.filterItemText}>{item.label}</Text>
                  {isSelected && (
                    <Ionicons 
                      name="checkmark" 
                      size={20} 
                      color={COLORS.cardBlue} 
                      style={{ marginLeft: 'auto' }} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
            
            {selectedFilters.length > 0 && (
              <View style={styles.filterFooter}>
                <Text style={styles.filterCount}>
                  {selectedFilters.length} {selectedFilters.length === 1 ? 'filtro activo' : 'filtros activos'}
                </Text>
                <TouchableOpacity onPress={clearAllFilters}>
                  <Text style={styles.clearButton}>Limpiar todos</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 5,
  },
  searchWrapper: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.textPrimary,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInputText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.bgDark,
  },
  filtersDropdown: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxHeight: 400,
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.textPrimary,
  },
  filterItemSelected: {
    backgroundColor: "#F0F0F0",
  },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  filterIconSelected: {
    backgroundColor: COLORS.bgDark,
  },
  filterItemText: {
    fontSize: 16,
    color: COLORS.bgDark,
    fontWeight: "500",
  },
  filterFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginTop: 8,
  },
  filterCount: {
    fontSize: 14,
    color: COLORS.tabInactive,
  },
  clearButton: {
    fontSize: 14,
    color: COLORS.cardBlue,
    fontWeight: "600",
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
