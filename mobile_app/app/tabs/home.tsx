import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, ScrollView, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../src/Theme/colors";
import { restoreProfile } from "../../src/data/authService";
import { getTokens } from "../../src/data/tokenStorage";
import { listPets } from "../../src/data/petService";
import { API_BASE_URL } from "../../src/data/config";

const { width: SW } = Dimensions.get("window");

// Colores del Diseño1
const MAG = "#E056C7";
const PRP = "#7B3FE4";
const CYN = "#4FC3F7";
const GRN = "#3DDC97";
const AMB = "#FFB547";
const WRN = "#FF9A3C";

type PetCard = {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  weight?: number | null;
  avatar_url?: string | null;
};

// ── Anillo decorativo (sin react-native-svg) ──────────────────────────────────
function Ring({
  value, color = GRN, size = 50, stroke = 6,
}: {
  value: number; color?: string; size?: number; stroke?: number;
}) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      borderWidth: stroke, borderColor: color,
      alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ color: "#fff", fontSize: size * 0.26, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}

// ── Sparkline con segmentos absolutos ─────────────────────────────────────────
function Sparkline({ data, color = MAG }: { data: number[]; color?: string }) {
  const w = SW - 72;
  const h = 44;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);

  const pts = data.map((v, i) => ({
    x: i * step,
    y: h - ((v - min) / range) * (h * 0.82) - 3,
  }));

  return (
    <View style={{ width: w, height: h }}>
      {pts.slice(0, -1).map((pt, i) => {
        const nx = pts[i + 1];
        const dx = nx.x - pt.x, dy = nx.y - pt.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View key={i} style={{
            position: "absolute",
            left: pt.x + dx / 2 - len / 2,
            top:  pt.y + dy / 2 - 1,
            width: len, height: 2,
            backgroundColor: color, borderRadius: 1,
            transform: [{ rotate: `${angle}deg` }],
          }} />
        );
      })}
      {pts.map((pt, i) => (
        <View key={`d${i}`} style={{
          position: "absolute",
          left: pt.x - 3, top: pt.y - 3,
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: color,
        }} />
      ))}
    </View>
  );
}

// ── Avatar de mascota ─────────────────────────────────────────────────────────
function PetAvatar({ pet, size = 64 }: { pet: PetCard; size?: number }) {
  const emoji = pet.species === "Gato" || pet.species?.toLowerCase() === "cat" ? "🐱" : "🐶";
  const avatarUri = pet.avatar_url
    ? pet.avatar_url.startsWith("http") ? pet.avatar_url : `${API_BASE_URL}${pet.avatar_url}`
    : null;
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, overflow: "hidden",
      backgroundColor: `${MAG}33`,
      alignItems: "center", justifyContent: "center",
    }}>
      {avatarUri
        ? <Image source={{ uri: avatarUri }} style={{ width: size, height: size }} />
        : <Text style={{ fontSize: size * 0.52 }}>{emoji}</Text>}
    </View>
  );
}

// ── Cabecera de sección ───────────────────────────────────────────────────────
function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <View style={s.secRow}>
      <Text style={s.secTitle}>{title}</Text>
      {link && <Text style={s.secLink}>{link}</Text>}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function HomeScreen() {
  const { t } = useTranslation();
  const [pets, setPets] = useState<PetCard[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const weightHistory = [27.2, 27.8, 28.0, 27.9, 28.2, 28.1, 28.4];

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const tokens = await getTokens();
      if (!tokens) { setErrorMessage(t("home.noActiveSession")); return; }
      await restoreProfile();
      const list = await listPets(tokens.access_token);
      setPets(list);
      setSelectedPet(list?.[0] ?? null);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : t("home.couldNotLoadInfo"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) {
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <ActivityIndicator color={MAG} size="large" />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <Text style={s.errTxt}>{errorMessage}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={load}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>{t("common.retry")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const petName = selectedPet?.name ?? "tu mascota";

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── TopBar ─────────────────────────────────────────────────── */}
        <View style={s.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={s.topSub}>Hola, tutor de {petName}</Text>
            <Text style={s.topTitle}>
              Panel{" "}
              <Text style={{ color: MAG }}>PetVerse</Text>
            </Text>
          </View>
          <View style={s.topActions}>
            <TouchableOpacity style={s.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              <View style={s.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}>
              <Ionicons name="settings-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Selector de mascotas ───────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
          {pets.map((pet) => {
            const active = selectedPet?.id === pet.id;
            return (
              <TouchableOpacity key={pet.id} onPress={() => setSelectedPet(pet)}
                style={[s.petChip, active && s.petChipActive]}>
                <PetAvatar pet={pet} size={26} />
                <View>
                  <Text style={[s.petChipName, { color: active ? "#fff" : COLORS.textSecondary }]}>
                    {pet.name}
                  </Text>
                  {pet.breed || pet.species ? (
                    <Text style={s.petChipBreed} numberOfLines={1}>
                      {pet.breed ?? pet.species}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={s.petChipAdd}>
            <Ionicons name="add" size={14} color={COLORS.tabInactive} />
            <Text style={{ color: COLORS.tabInactive, fontSize: 12, fontWeight: "600" }}>Agregar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── Hero card mascota ──────────────────────────────────────── */}
        {selectedPet && (
          <LinearGradient
            colors={[`${MAG}28`, `${CYN}1E`]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.heroCard}
          >
            <PetAvatar pet={selectedPet} size={64} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <Text style={s.heroName}>{selectedPet.name}</Text>
                <View style={[s.chip, { backgroundColor: `${GRN}22`, borderColor: `${GRN}44` }]}>
                  <Text style={{ color: GRN, fontSize: 10, fontWeight: "700" }}>En forma</Text>
                </View>
              </View>
              <Text style={s.heroBio}>
                {[selectedPet.breed, selectedPet.species, selectedPet.weight ? `${selectedPet.weight} kg` : null]
                  .filter(Boolean).join(" · ")}
              </Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <View style={s.chip}>
                  <Ionicons name="paw" size={12} color={COLORS.textSecondary} />
                  <Text style={s.chipTxt}>Perfil</Text>
                </View>
                <View style={s.chip}>
                  <Ionicons name="sparkles-outline" size={12} color={COLORS.textSecondary} />
                  <Text style={s.chipTxt}>IA</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* ── 4 Tarjetas métricas ────────────────────────────────────── */}
        <View style={s.metricsGrid}>
          {/* Salud */}
          <View style={s.metCard}>
            <Ring value={86} color={GRN} size={50} stroke={6} />
            <View style={{ marginLeft: 10 }}>
              <Text style={s.metLabel}>SALUD</Text>
              <Text style={[s.metValue, { color: "#bfffdc" }]}>Excelente</Text>
            </View>
          </View>

          {/* Vacunas */}
          <View style={s.metCard}>
            <View style={s.metRow}>
              <Text style={s.metLabel}>VACUNAS</Text>
              <Ionicons name="medkit-outline" size={14} color={MAG} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <Text style={s.metBig}>3</Text>
              <Text style={s.metSub}>/ 4 al día</Text>
            </View>
            <Text style={[s.metSub, { color: WRN }]}>1 pendiente</Text>
          </View>

          {/* Medicación */}
          <View style={s.metCard}>
            <View style={s.metRow}>
              <Text style={s.metLabel}>MEDICACIÓN</Text>
              <Ionicons name="pulse-outline" size={14} color={CYN} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <Text style={s.metBig}>2</Text>
              <Text style={s.metSub}>activas</Text>
            </View>
            <Text style={s.metSub}>Próx. dosis: hoy 8pm</Text>
          </View>

          {/* Última visita */}
          <View style={s.metCard}>
            <View style={s.metRow}>
              <Text style={s.metLabel}>ÚLTIMA VISITA</Text>
              <Ionicons name="calendar-outline" size={14} color={AMB} />
            </View>
            <Text style={[s.metBig, { fontSize: 18, marginTop: 4 }]}>02 abr</Text>
            <Text style={s.metSub}>Control general · OK</Text>
          </View>
        </View>

        {/* ── Peso ──────────────────────────────────────────────────── */}
        <SectionHeader title="Peso" link="Ver detalles" />
        <View style={s.glassCard}>
          <View style={s.metRow}>
            <Text style={s.metLabel}>PESO ACTUAL</Text>
            <Ionicons name="trending-up-outline" size={14} color={MAG} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
            <Text style={s.weightVal}>{selectedPet?.weight?.toFixed(1) ?? "28.4"}</Text>
            <Text style={s.metSub}>kg</Text>
          </View>
          <Text style={[s.metSub, { marginBottom: 10 }]}>+0.3 kg este mes</Text>
          <Sparkline data={weightHistory} color={MAG} />
        </View>

        {/* ── Próximos recordatorios ─────────────────────────────────── */}
        <SectionHeader title="Próximos recordatorios" link="Ver todos" />
        {[
          { icon: "medkit-outline", color: MAG,  title: "Refuerzo antirrábico",  when: "Mañana · 10:30 am",  sub: "Vet: Dr. Andrés Vargas" },
          { icon: "pulse-outline",  color: CYN,  title: "Antipulgas mensual",    when: "Sáb · todo el día",  sub: "NexGard 28 kg" },
          { icon: "calendar-outline", color: AMB, title: "Control veterinario", when: "15 mayo · 4:00 pm",  sub: "Clínica Patitas Felices" },
        ].map((r) => (
          <View key={r.title} style={s.reminderCard}>
            <View style={[s.reminderIcon, { backgroundColor: `${r.color}22`, borderColor: `${r.color}44` }]}>
              <Ionicons name={r.icon as any} size={20} color={r.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.reminderTitle}>{r.title}</Text>
              <Text style={s.reminderSub}>{r.when} · {r.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.tabInactive} />
          </View>
        ))}

        {/* ── Consejo del día ───────────────────────────────────────── */}
        <SectionHeader title="Consejo del día" link="Más tips" />
        <LinearGradient
          colors={[`${MAG}2E`, `${CYN}24`]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.aiCard}
        >
          <View style={s.aiHeader}>
            <LinearGradient colors={[MAG, PRP]} style={s.aiIconBg}>
              <Ionicons name="sparkles" size={16} color="#fff" />
            </LinearGradient>
            <Text style={s.aiHeaderTxt}>PetIA · recomendación</Text>
          </View>
          <Text style={s.aiBody}>
            {selectedPet?.species === "Gato" || selectedPet?.species?.toLowerCase() === "cat"
              ? `${petName} necesita enriquecimiento vertical: coloca rascadores altos y ventanas accesibles. Gatos de interior pierden motivación sin altura que explorar.`
              : `${petName} viene ganando peso de forma saludable. Mantén 2 paseos diarios de 25 min y agrega juegos de olfato para estimular su mente.`}
          </Text>
          <TouchableOpacity style={s.aiBtn}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Hablar con PetIA →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Servicios cerca ───────────────────────────────────────── */}
        <SectionHeader title="Servicios cerca" link="Mapa" />
        <View style={s.servicesGrid}>
          {[
            { icon: "add-circle-outline", label: "Vet"    },
            { icon: "storefront-outline", label: "Tienda" },
            { icon: "heart-outline",      label: "Spa"    },
            { icon: "compass-outline",    label: "Parque" },
          ].map((sv) => (
            <TouchableOpacity key={sv.label} style={s.serviceBtn}>
              <LinearGradient
                colors={[`${MAG}33`, `${CYN}22`]}
                style={s.serviceIconBg}
              >
                <Ionicons name={sv.icon as any} size={20} color="#fff" />
              </LinearGradient>
              <Text style={s.serviceLabel}>{sv.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bgDark },
  center: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: 18, paddingBottom: 130, gap: 14 },

  errTxt:   { color: "#ffb4b4", textAlign: "center", marginBottom: 16 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.cardBlue },

  // TopBar
  topBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topSub:     { fontSize: 11, color: COLORS.textSecondary, letterSpacing: 0.8, textTransform: "uppercase" },
  topTitle:   { fontSize: 26, fontWeight: "800", color: "#fff", marginTop: 2 },
  topActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute", top: 9, right: 9,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: COLORS.badgeRed,
  },

  // Pet chips
  petChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 99, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  petChipActive: {
    backgroundColor: `${MAG}22`,
    borderColor: `${MAG}66`,
  },
  petChipName:  { fontSize: 13, fontWeight: "600" },
  petChipBreed: { fontSize: 10, color: COLORS.tabInactive, marginTop: 1 },
  petChipAdd: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderStyle: "dashed",
  },

  // Hero card
  heroCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 18,
    borderWidth: 1, borderColor: `${MAG}40`,
  },
  heroName: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroBio:  { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  chip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.14)",
  },
  chipTxt: { color: COLORS.textSecondary, fontSize: 11, fontWeight: "600" },

  // Métricas
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metCard: {
    width: (SW - 46) / 2,
    padding: 14, borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    flexDirection: "row", alignItems: "center",
    flexWrap: "wrap",
  },
  metRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 4 },
  metLabel: { fontSize: 10, color: COLORS.textSecondary, letterSpacing: 0.8 },
  metValue: { fontSize: 13, fontWeight: "700" },
  metBig:   { fontSize: 24, fontWeight: "800", color: "#fff" },
  metSub:   { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  // Peso / glass card
  glassCard: {
    padding: 16, borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  weightVal: { fontSize: 30, fontWeight: "800", color: "#fff" },

  // Sección header
  secRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  secTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  secLink:  { fontSize: 12, fontWeight: "600", color: CYN },

  // Recordatorios
  reminderCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderRadius: 16, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  reminderIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  reminderTitle: { fontSize: 14, fontWeight: "700", color: "#fff" },
  reminderSub:   { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  // AI card
  aiCard: {
    padding: 16, borderRadius: 18,
    borderWidth: 1, borderColor: `${MAG}4D`,
    gap: 10,
  },
  aiHeader:    { flexDirection: "row", alignItems: "center", gap: 8 },
  aiIconBg:    { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  aiHeaderTxt: { fontSize: 13, fontWeight: "700", color: "#fff" },
  aiBody: { fontSize: 14, color: "#fff", lineHeight: 22, opacity: 0.9 },
  aiBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },

  // Servicios
  servicesGrid: { flexDirection: "row", gap: 10 },
  serviceBtn: {
    flex: 1, alignItems: "center", gap: 8,
    paddingVertical: 14, borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  serviceIconBg: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  serviceLabel: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
});
