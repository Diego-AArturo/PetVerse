// src/screens/HomeScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/Theme/colors";
import { UserProfile } from "../../src/data/model/user";
import { restoreProfile } from "../../src/data/authService";
import { API_BASE_URL } from "../../src/data/config";

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await restoreProfile();
      if (!data) {
        setErrorMessage("No encontramos una sesión activa.");
        setProfile(null);
        return;
      }
      setProfile(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo obtener tu información.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.loadingText}>Cargando tu perfil...</Text>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pets = profile?.pets ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile?.name ? `¡Hola, ${profile.name}!` : "¡Hola!"}
        </Text>
        <Text style={styles.subtitle}>
          Tu ecosistema completo para el bienestar animal.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tus Mascotas</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Agregar Mascota</Text>
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <Text style={styles.emptyPetsText}>
          Aún no tienes mascotas registradas.
        </Text>
      ) : (
        pets.map((pet) => (
          <View key={pet.id} style={styles.petCard}>
            {pet.avatar_url ? (
              <Image
                source={{ uri: resolveAvatarUrl(pet.avatar_url) }}
                style={styles.petImage}
              />
            ) : (
              <View style={[styles.petImage, styles.petPlaceholder]}>
                <Ionicons name="paw" color="#fff" size={20} />
              </View>
            )}
            <View>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petProfile}>
                {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
              </Text>
            </View>
            <TouchableOpacity style={styles.plusIcon}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={styles.grid}>
        <GridCard icon="document-text-outline" label="Historial Médico" />
        <GridCard icon="location-outline" label="Mapa Pet-Friendly" highlight />
        <GridCard icon="people-outline" label="Comunidad" />
        <GridCard icon="notifications-outline" label="Recordatorios" />
      </View>
    </SafeAreaView>
  );
}

const resolveAvatarUrl = (avatarUrl: string) => {
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  return `${API_BASE_URL}${avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`}`;
};

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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: 14,
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
  petPlaceholder: {
    backgroundColor: COLORS.cardBlue,
    justifyContent: "center",
    alignItems: "center",
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
  emptyPetsText: {
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  errorText: {
    color: "#ffb4b4",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.cardBlue,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
