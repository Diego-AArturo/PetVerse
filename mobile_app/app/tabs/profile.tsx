import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../../src/Theme/colors";
import { getTokens } from "../../src/data/tokenStorage";
import { fetchMyProfile } from "../../src/data/userService";
import {
  listPets,
  createPet,
  updatePet,
  PetCreatePayload,
  PetUpdatePayload,
} from "../../src/data/petService";
import { PetSummary } from "../../src/data/model/pet";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "../../src/data/config";

type FormState = {
  name: string;
  species: string;
  breed?: string;
  weight?: string;
  sex?: string;
};

const emptyForm: FormState = {
  name: "",
  species: "",
  breed: "",
  weight: "",
  sex: "",
};

export default function ProfileTab() {
  const [pets, setPets] = useState<PetSummary[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetSummary | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const params = useLocalSearchParams();
  const router = useRouter();

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? pets[0],
    [pets, selectedPetId]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const tokens = await getTokens();
        if (!tokens) throw new Error("No hay sesión activa");
        setToken(tokens.access_token);
        const me = await fetchMyProfile(tokens.access_token);
        setProfileName(me.name ?? "Usuario");
        const petList = await listPets(tokens.access_token);
        setPets(petList);
        setSelectedPetId(petList[0]?.id ?? null);
      } catch (e: any) {
        setError(e?.message ?? "No se pudo cargar tu información");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (params.add === "1") {
      openCreate();
      router.replace("/tabs/profile" as any);
    }
  }, [params.add, router]);

  const openCreate = () => {
    setEditingPet(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (pet: PetSummary) => {
    setEditingPet(pet);
    setForm({
      name: pet.name ?? "",
      species: pet.species ?? "",
      breed: pet.breed ?? "",
      weight: pet.weight ? String(pet.weight) : "",
      sex: pet.sex ?? "",
    });
    setIsFormOpen(true);
  };

  const savePet = async () => {
    if (!token) return;
    if (!form.name || !form.species) {
      setError("Nombre y especie son obligatorios");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: PetCreatePayload | PetUpdatePayload = {
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        sex: form.sex || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
      };
      if (editingPet) {
        const updated = await updatePet(editingPet.id, payload, token);
        setPets((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setSelectedPetId(updated.id);
      } else {
        const created = await createPet(payload as PetCreatePayload, token);
        setPets((prev) => [...prev, created]);
        setSelectedPetId(created.id);
      }
      setIsFormOpen(false);
      setEditingPet(null);
      setForm(emptyForm);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar la mascota");
    } finally {
      setSaving(false);
    }
  };

  const changeAvatar = async () => {
    if (!token || !selectedPet) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Se requiere permiso de galería");
      return;
    }
    const maybeMediaType = (ImagePicker as any).MediaType?.Images;
    const result = await ImagePicker.launchImageLibraryAsync(
      maybeMediaType
        ? { mediaTypes: maybeMediaType, quality: 0.8 }
        : { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 }
    );
    if (result.canceled || !result.assets?.[0]?.uri) return;
    const localUri = result.assets[0].uri;
    try {
      setSaving(true);
      // guardamos el path local en avatar_url
      const updated = await updatePet(
        selectedPet.id,
        { avatar_url: localUri },
        token
      );
      setPets((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, avatar_url: localUri } : p))
      );
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar la imagen");
    } finally {
      setSaving(false);
    }
  };

  const resolveAvatarUrl = (avatarUrl?: string | null) => {
    if (!avatarUrl) return "";
    if (
      avatarUrl.startsWith("http://") ||
      avatarUrl.startsWith("https://") ||
      avatarUrl.startsWith("file://")
    ) {
      return avatarUrl;
    }
    return `${API_BASE_URL}${avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.textPrimary} />
        <Text style={styles.muted}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.topRow}>
            <Text style={styles.headerTitle}>Perfil de Mascota</Text>
            {selectedPet && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEdit(selectedPet)}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Avatar + info */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              {selectedPet?.avatar_url ? (
                <Image
                  source={{ uri: resolveAvatarUrl(selectedPet.avatar_url) }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Ionicons name="paw" size={26} color={COLORS.textPrimary} />
                </View>
              )}
              <TouchableOpacity style={styles.cameraFab} onPress={changeAvatar}>
                <Ionicons name="camera" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName}>{selectedPet?.name ?? "Sin mascota"}</Text>
            <Text style={styles.petBreed}>{selectedPet?.breed ?? selectedPet?.species ?? ""}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{selectedPet?.sex ?? "—"}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>Peso: {selectedPet?.weight ?? "—"} kg</Text>
            </View>
          </View>

          {/* Selector de mascotas */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petSelector}
          >
            {pets.map((pet) => {
              const active = pet.id === selectedPet?.id;
              return (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => setSelectedPetId(pet.id)}
                  style={[styles.petChip, active && styles.petChipActive]}
                >
                  <Text style={styles.petChipText}>{pet.name}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.addChip} onPress={openCreate}>
              <Ionicons name="add" size={16} color={COLORS.textPrimary} />
              <Text style={styles.petChipText}>Agregar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Quick info */}
        <View style={styles.infoGrid}>
          <InfoCard title="Peso" value={selectedPet?.weight ? `${selectedPet.weight} kg` : "—"} icon="scale-outline" />
          <InfoCard title="Vacunas" value="—" icon="medkit-outline" highlight />
          <InfoCard title="Meds" value="—" icon="pulse-outline" />
          <InfoCard title="Edad" value="—" icon="time-outline" highlight />
        </View>

        {/* Microchip */}
        <View style={styles.chipCard}>
          <View>
            <Text style={styles.chipLabel}>Microchip</Text>
            <Text style={styles.chipValue}>No registrado</Text>
          </View>
          <TouchableOpacity style={styles.copyButton}>
            <Text style={styles.copyText}>Copiar</Text>
          </TouchableOpacity>
        </View>

        {/* Menú */}
        <View style={styles.menuList}>
          <MenuItem label="Historial médico" icon="heart-outline" badge="3" />
          <MenuItem label="Carnet de vacunas" icon="medkit-outline" />
          <MenuItem label="Línea de tiempo" icon="time-outline" />
          <MenuItem label="Galería" icon="images-outline" badge="24" />
        </View>

        {/* Wellness */}
        <View style={styles.wellnessCard}>
          <View>
            <Text style={styles.wellnessLabel}>Índice de bienestar</Text>
            <Text style={styles.wellnessScore}>92/100</Text>
            <Text style={styles.wellnessHint}>Estado excelente</Text>
          </View>
          <View style={styles.wellnessCircle}>
            <Ionicons name="heart" size={32} color={COLORS.textPrimary} />
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={isFormOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPet ? "Editar mascota" : "Nueva mascota"}
              </Text>
              <Pressable onPress={() => setIsFormOpen(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            <TextInput
              placeholder="Nombre"
              placeholderTextColor={COLORS.tabInactive}
              style={styles.input}
              value={form.name}
              onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
            />
            <TextInput
              placeholder="Especie"
              placeholderTextColor={COLORS.tabInactive}
              style={styles.input}
              value={form.species}
              onChangeText={(t) => setForm((f) => ({ ...f, species: t }))}
            />
            <TextInput
              placeholder="Raza (opcional)"
              placeholderTextColor={COLORS.tabInactive}
              style={styles.input}
              value={form.breed}
              onChangeText={(t) => setForm((f) => ({ ...f, breed: t }))}
            />
            <TextInput
              placeholder="Peso en kg (opcional)"
              placeholderTextColor={COLORS.tabInactive}
              style={styles.input}
              keyboardType="numeric"
              value={form.weight}
              onChangeText={(t) => setForm((f) => ({ ...f, weight: t }))}
            />
            <TextInput
              placeholder="Sexo (opcional)"
              placeholderTextColor={COLORS.tabInactive}
              style={styles.input}
              value={form.sex}
              onChangeText={(t) => setForm((f) => ({ ...f, sex: t }))}
            />

            <TouchableOpacity
              style={styles.saveButton}
              disabled={saving}
              onPress={savePet}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.saveText}>
                  {editingPet ? "Guardar cambios" : "Crear mascota"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoCard = ({
  title,
  value,
  icon,
  highlight,
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  highlight?: boolean;
}) => (
  <View
    style={[
      styles.infoCard,
      highlight ? styles.infoCardBlue : styles.infoCardPurple,
    ]}
  >
    <Ionicons name={icon} size={18} color={COLORS.textPrimary} />
    <Text style={styles.infoValue}>{value}</Text>
    <Text style={styles.infoLabel}>{title}</Text>
  </View>
);

const MenuItem = ({
  label,
  icon,
  badge,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string | null;
}) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.menuIcon}>
      <Ionicons name={icon} size={18} color={COLORS.cardBlue} />
    </View>
    <Text style={styles.menuText}>{label}</Text>
    {badge ? <Text style={styles.menuBadge}>{badge}</Text> : null}
    <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  scroll: { padding: 16, paddingBottom: 120, gap: 12 },
  center: { justifyContent: "center", alignItems: "center" },
  muted: { color: COLORS.textSecondary, marginTop: 8 },

  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  editButton: {
    backgroundColor: COLORS.surfaceAlt,
    padding: 10,
    borderRadius: 12,
  },
  avatarWrapper: { alignItems: "center" },
  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 116, height: 116, borderRadius: 58 },
  avatarFallback: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: COLORS.cardPurple,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraFab: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  petInfo: { alignItems: "center", gap: 4 },
  petName: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "800" },
  petBreed: { color: COLORS.textSecondary },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { color: COLORS.textSecondary, fontSize: 12 },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textSecondary,
  },
  petSelector: { gap: 10, paddingTop: 4 },
  petChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.borderFaint,
  },
  petChipActive: {
    borderColor: COLORS.cardBlue,
  },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.cardBlue,
  },
  petChipText: { color: COLORS.textPrimary, fontWeight: "700" },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoCard: {
    width: "48%",
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  infoCardPurple: { backgroundColor: COLORS.cardPurple },
  infoCardBlue: { backgroundColor: COLORS.cardBlue },
  infoValue: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 16 },
  infoLabel: { color: COLORS.textSecondary, fontSize: 12 },

  chipCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chipLabel: { color: COLORS.textSecondary, fontSize: 12, letterSpacing: 1 },
  chipValue: { color: COLORS.textPrimary, fontFamily: "monospace", marginTop: 4 },
  copyButton: {
    backgroundColor: COLORS.cardBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  copyText: { color: COLORS.textPrimary, fontWeight: "700" },

  menuList: { gap: 10 },
  menuItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderFaint,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { color: COLORS.textPrimary, flex: 1, fontWeight: "700" },
  menuBadge: {
    backgroundColor: COLORS.cardPurple,
    color: COLORS.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "700",
  },

  wellnessCard: {
    backgroundColor: COLORS.cardBlue,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  wellnessLabel: { color: COLORS.textPrimary, opacity: 0.8 },
  wellnessScore: { color: COLORS.textPrimary, fontSize: 28, fontWeight: "800" },
  wellnessHint: { color: COLORS.textPrimary, opacity: 0.8, fontSize: 12 },
  wellnessCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: COLORS.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: "800" },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.textPrimary,
  },
  saveButton: {
    marginTop: 6,
    backgroundColor: COLORS.cardBlue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: { color: COLORS.textPrimary, fontWeight: "800" },
});
