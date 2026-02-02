// src/screens/HomeScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/Theme/colors";
import { UserProfile } from "../../src/data/model/user";
import { restoreProfile } from "../../src/data/authService";
import { getTokens } from "../../src/data/tokenStorage";
import { listPets } from "../../src/data/petService";
import { API_BASE_URL } from "../../src/data/config";

type PetCardData = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  weight?: number | null;
  avatar_url?: string | null;
};

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<PetCardData[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfileAndPets = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const tokens = await getTokens();
      if (!tokens) {
        setErrorMessage("No encontramos una sesión activa.");
        setProfile(null);
        return;
      }
      const user = await restoreProfile();
      setProfile(user);

      const petList = await listPets(tokens.access_token);
      setPets(petList);
      const firstPet = petList?.[0] ?? null;
      setSelectedPet(firstPet ?? null);
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
    loadProfileAndPets();
  }, [loadProfileAndPets]);

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
        <TouchableOpacity style={styles.retryButton} onPress={loadProfileAndPets}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.muted}>¡Buenos días! 👋</Text>
            <Text style={styles.title}>Panel</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryIconButton}>
              <Ionicons name="sparkles-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selector de mascotas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petSelector}
        >
          {pets.length === 0 ? (
            <View style={styles.emptyPetCard}>
              <Ionicons name="paw" size={18} color="#fff" />
              <Text style={styles.petCardText}>Agrega tu primera mascota</Text>
            </View>
          ) : (
            pets.map((pet) => {
              const isActive = selectedPet?.id === pet.id;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.petChip, isActive && styles.petChipActive]}
                  onPress={() => setSelectedPet(pet)}
                >
                  {pet.avatar_url ? (
                    <Image
                      source={{ uri: resolveAvatarUrl(pet.avatar_url) }}
                      style={styles.petAvatar}
                    />
                  ) : (
                    <View style={[styles.petAvatar, styles.petPlaceholder]}>
                      <Ionicons name="paw" size={16} color="#fff" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petBreed}>
                      {pet.breed || pet.species}
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={18} color="#4EC9F5" />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Banner alerta */}
        <View style={styles.banner}>
          <Ionicons name="alert-circle" size={20} color="#f0c674" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerText}>
              {selectedPet
                ? `Mantén al día las vacunas de ${selectedPet.name}.`
                : "Registra una mascota para recibir recordatorios."}
            </Text>
          </View>
          <TouchableOpacity style={styles.bannerAction}>
            <Text style={styles.bannerActionText}>Ver</Text>
          </TouchableOpacity>
        </View>

        {/* Stats rápidos */}
        <View style={styles.quickRow}>
          <StatCard
            title="Salud"
            value="—"
            icon="heart-outline"
            variant="purple"
          />
          <StatCard
            title="Vacunas"
            value="—"
            icon="medkit-outline"
            variant="blue"
          />
          <StatCard
            title="Medicación"
            value="—"
            icon="pulse-outline"
            variant="blue"
          />
          <StatCard
            title="Última visita"
            value="—"
            icon="calendar-outline"
            variant="purple"
          />
        </View>

        {/* Resumen mascota */}
        {selectedPet && (
          <View style={styles.petPanel}>
            <View style={styles.petPanelHeader}>
              <View>
                <Text style={styles.panelTitle}>{selectedPet.name}</Text>
                <Text style={styles.panelSubtitle}>
                  {selectedPet.breed || selectedPet.species}
                </Text>
              </View>
              <TouchableOpacity style={styles.editBtn}>
                <Ionicons name="create-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.metricsRow}>
              <MiniMetric
                label="Peso"
                value={
                  selectedPet.weight ? `${selectedPet.weight.toFixed(1)} kg` : "—"
                }
                icon="scale-outline"
              />
              <MiniMetric label="Especie" value={selectedPet.species} icon="paw" />
            </View>
          </View>
        )}

        {/* Próximos eventos / vacío */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Próximos</Text>
            <Text style={styles.sectionLink}>Ver todo</Text>
          </View>
          <View style={styles.emptyUpcoming}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.muted}>
              Aún no tienes recordatorios. Añade vacunas o citas.
            </Text>
          </View>
        </View>

        {/* Asistente AI */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles-outline" size={18} color="#fff" />
            </View>
            <View>
              <Text style={styles.aiTitle}>Asistente IA</Text>
              <Text style={styles.aiSubtitle}>
                Pregunta sobre {selectedPet?.name ?? "tu mascota"}
              </Text>
            </View>
          </View>
          <View style={styles.aiInputRow}>
            <Text style={styles.aiPlaceholder}>
              ¿Qué debería comer hoy {selectedPet?.name ?? "mi mascota"}?
            </Text>
            <TouchableOpacity style={styles.aiSend}>
              <Ionicons name="paper-plane" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const resolveAvatarUrl = (avatarUrl: string) => {
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  return `${API_BASE_URL}${avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`}`;
};

type StatProps = {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: "purple" | "blue";
};

const StatCard = ({ title, value, icon, variant }: StatProps) => (
  <View
    style={[
      styles.statCard,
      variant === "blue" ? styles.statBlue : styles.statPurple,
    ]}
  >
    <Ionicons name={icon} size={18} color="#fff" />
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const MiniMetric = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.miniMetric}>
    <Ionicons name={icon} size={16} color="#fff" />
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

//--------------- styles ---------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scroll: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
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
  muted: { color: COLORS.textSecondary, fontSize: 13 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: { flexDirection: "row", gap: 10 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#271a44",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  primaryIconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#4EC9F5",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6b6b",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  petSelector: {
    marginTop: 10,
    gap: 10,
    paddingRight: 6,
  },
  petChip: {
    width: 200,
    backgroundColor: "#20163d",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  petChipActive: {
    borderColor: COLORS.cardBlue,
    backgroundColor: "#241a45",
  },
  petAvatar: { width: 44, height: 44, borderRadius: 12 },
  petPlaceholder: {
    backgroundColor: COLORS.cardPurple,
    alignItems: "center",
    justifyContent: "center",
  },
  petName: { color: "#fff", fontWeight: "700" },
  petBreed: { color: COLORS.textSecondary, fontSize: 12 },
  emptyPetCard: {
    backgroundColor: "#241a45",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  petCardText: { color: "#fff", fontWeight: "600" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2f234f",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  bannerText: { color: "#fff", fontWeight: "600" },
  bannerAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#4EC9F5",
  },
  bannerActionText: { color: "#fff", fontWeight: "700" },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: "flex-start",
    gap: 4,
  },
  statPurple: { backgroundColor: "#2d1f4b" },
  statBlue: { backgroundColor: "#243556" },
  statTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  statValue: { color: "#fff", fontSize: 16, fontWeight: "800" },
  petPanel: {
    backgroundColor: "#1f163c",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  petPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  panelSubtitle: { color: COLORS.textSecondary, fontSize: 13 },
  editBtn: {
    backgroundColor: "#2c2347",
    borderRadius: 10,
    padding: 8,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  miniMetric: {
    flex: 1,
    backgroundColor: "#2a1f4f",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  metricLabel: { color: COLORS.textSecondary, fontSize: 12 },
  metricValue: { color: "#fff", fontWeight: "700", fontSize: 16 },
  section: { marginTop: 6 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sectionLink: { color: COLORS.cardBlue, fontWeight: "700", fontSize: 12 },
  emptyUpcoming: {
    backgroundColor: "#211842",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  aiCard: {
    backgroundColor: "#1f163c",
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    gap: 10,
  },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#4EC9F5",
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: { color: "#fff", fontSize: 15, fontWeight: "800" },
  aiSubtitle: { color: COLORS.textSecondary, fontSize: 12 },
  aiInputRow: {
    backgroundColor: "#241a45",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiPlaceholder: { color: COLORS.textSecondary, fontSize: 13 },
  aiSend: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#4EC9F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
