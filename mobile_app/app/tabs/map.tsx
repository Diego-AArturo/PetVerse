import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function MapScreen() {
  // Cargamos MapLibre solo en plataformas nativas para evitar que Metro/Web
  // evalue el modulo y falle con "Object prototype may only be an Object or null: undefined".
  const MapLibreGL =
    Platform.OS !== "web"
      ? // require dinámico para que no se incluya en el bundle web
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("@maplibre/maplibre-react-native")
      : null;

  if (!MapLibreGL) {
    // Web: usar un embed liviano de OpenStreetMap como fallback.
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

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView style={{ flex: 1 }}>
        <MapLibreGL.Camera
          zoomLevel={13}
          centerCoordinate={[-74.0817, 4.6097]} // Bogota (lng, lat)
        />
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141033", padding: 20 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#d0c9f7", marginTop: 6 },
});
