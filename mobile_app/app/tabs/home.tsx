// src/screens/HomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/Theme/colors";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>¡Hola, Ana!</Text>
        <Text style={styles.subtitle}>
          Tu ecosistema completo para el bienestar animal.
        </Text>
      </View>

      {/* TUS MASCOTAS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tus Mascotas</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Agregar Mascota</Text>
        </TouchableOpacity>
      </View>

      {/* MASCOTA CARD */}
      <View style={styles.petCard}>
        <Image
          source={{ uri: "https://placedog.net/200/200" }}
          style={styles.petImage}
        />
        <View>
          <Text style={styles.petName}>Max</Text>
          <Text style={styles.petProfile}>Ver Perfil</Text>
        </View>
        <TouchableOpacity style={styles.plusIcon}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* GRID */}
      <View style={styles.grid}>
        <GridCard
          icon="document-text-outline"
          label="Historial Médico"
        />
        <GridCard
          icon="location-outline"
          label="Mapa Pet-Friendly"
          highlight
        />
        <GridCard
          icon="people-outline"
          label="Comunidad"
        />
        <GridCard
          icon="notifications-outline"
          label="Recordatorios"
        />
      </View>
    </SafeAreaView>
  );
}

function GridCard({
  icon,
  label,
  highlight,
}: {
  icon: any;
  label: string;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.gridCard,
        highlight && styles.gridCardHighlight,
      ]}
    >
      <Ionicons name={icon} size={32} color="#fff" />
      <Text style={styles.gridText}>{label}</Text>
    </TouchableOpacity>
  );
}

//--------------- styles ---------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 6,
  },

  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardPurple,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  petImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  petName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  petProfile: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  plusIcon: {
    marginLeft: "auto",
    backgroundColor: COLORS.cardBlue,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    height: 130,
    backgroundColor: COLORS.cardPurple,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  gridCardHighlight: {
    backgroundColor: COLORS.cardBlue,
  },
  gridText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
