import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../src/Theme/colors";

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Servicios</Text>
        <Text style={styles.subtitle}>
          Próximamente podrás reservar grooming, veterinario y más.
        </Text>
      </View>
    </SafeAreaView>
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
