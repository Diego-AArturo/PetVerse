import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../src/Theme/colors";

import React from "react";
import MapLibreGL from "@maplibre/maplibre-react-native";

export default function MapScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MapLibreGL.MapView style={{ flex: 1 }} />
      <MapLibreGL.Camera
        zoomLevel={13}
        centerCoordinate={[-74.0817, 4.6097]} // Bogotá (lng, lat)
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141033", padding: 20 },
  card: {
    backgroundColor: "#1e1640",
    borderRadius: 16,
    padding: 16,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  subtitle: { color: COLORS.textSecondary, marginTop: 6 },
});
