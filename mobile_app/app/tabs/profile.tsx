import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Dimensions, Image, Modal, Pressable,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../src/Theme/colors";
import { getTokens } from "../../src/data/tokenStorage";
import { fetchMyProfile } from "../../src/data/userService";
import {
  listPets, createPet, updatePet,
  PetCreatePayload, PetUpdatePayload,
} from "../../src/data/petService";
import { PetSummary } from "../../src/data/model/pet";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "../../src/data/config";

const { width: SW } = Dimensions.get("window");
const MAG = "#E056C7";
const PRP = "#7B3FE4";
const CYN = "#4FC3F7";
const GRN = "#3DDC97";
const AMB = "#FFB547";

// ── Helpers ───────────────────────────────────────────────────────────────────
function petAge(birthdate?: string | null): string {
  if (!birthdate) return "";
  const d = new Date(birthdate);
  const now = new Date();
  const years = now.getFullYear() - d.getFullYear();
  if (years === 0) {
    const m = now.getMonth() - d.getMonth();
    return `${m < 0 ? m + 12 : m} meses`;
  }
  return `${years} ${years === 1 ? "año" : "años"}`;
}

function fmtDate(birthdate?: string | null): string {
  if (!birthdate) return "—";
  const d = new Date(birthdate);
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function petEmoji(species?: string | null): string {
  const sp = species?.toLowerCase() ?? "";
  if (sp.includes("gato") || sp.includes("cat")) return "🐱";
  return "🐶";
}

// ── Sparkline sin SVG ─────────────────────────────────────────────────────────
function Sparkline({ data, color = MAG, w, h = 90 }: { data: number[]; color?: string; w: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: i * step,
    y: h - ((v - min) / range) * (h * 0.82) - 4,
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
            top:  pt.y + dy / 2 - 1.25,
            width: len, height: 2.5,
            backgroundColor: color, borderRadius: 2,
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

// ── Encabezado de sección ─────────────────────────────────────────────────────
function SecHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>{title}</Text>
      {action && <Text style={{ fontSize: 13, color: MAG, fontWeight: "600" }}>{action}</Text>}
    </View>
  );
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
type FormState = { name: string; species: string; breed?: string; weight?: string; sex?: string };
const emptyForm: FormState = { name: "", species: "", breed: "", weight: "", sex: "" };

type IoniconName = keyof typeof Ionicons.glyphMap;
type TimelineItem = { d: string; title: string; sub: string; icon: IoniconName; c: string };

// ── Datos estáticos (placeholder hasta que el backend tenga estos endpoints) ──
const VACUNAS = [
  { n: "Antirrábica",         d: "12 mar 2025", status: "ok",      next: "12 mar 2026" },
  { n: "Polivalente (DHPPi)", d: "05 feb 2025", status: "ok",      next: "05 feb 2026" },
  { n: "Traqueobronquitis",   d: "15 abr 2025", status: "warn",    next: "15 oct 2025" },
  { n: "Leishmaniasis",       d: "—",           status: "pending", next: "Programar"   },
];
const MEDS = [
  { n: "NexGard Spectra",   dose: "28 kg · mensual",     color: CYN },
  { n: "Omega-3 articular", dose: "1 cápsula · diario",  color: MAG },
];
const TIMELINE: TimelineItem[] = [
  { d: "Hoy",    title: "Paseo de 45 min",             sub: "Parque de la 93",         icon: "compass-outline",   c: CYN },
  { d: "Ayer",   title: "Sesión de juego",              sub: "Pelota de olfato · 25 min", icon: "heart-outline",   c: MAG },
  { d: "15 abr", title: "Vacuna traqueobronquitis",     sub: "Clínica Patitas Felices",   icon: "medkit-outline",  c: GRN },
  { d: "10 abr", title: "Baño y corte",                 sub: "PetSpa Chapinero",         icon: "sparkles-outline", c: PRP },
  { d: "02 abr", title: "Control veterinario",          sub: "Todo en orden · 28.1 kg",  icon: "shield-outline",  c: AMB },
  { d: "20 mar", title: "Adopción oficial",             sub: "Día 1 en PetVerse",        icon: "paw-outline",     c: MAG },
];
const WEIGHT_DATA   = [26.8, 27.2, 27.5, 27.9, 28.0, 28.2, 28.4];
const WEIGHT_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"];
const ALBUM_LABELS  = ["Paseo", "Siesta", "Parque", "Con familia", "Cumpleaños", "Baño"];
const ALBUM_GRADS: [string, string][] = [
  [PRP, MAG], [MAG, CYN], [CYN, PRP], [PRP, MAG], [MAG, PRP], [CYN, MAG],
];

type InnerTab = "carnet" | "peso" | "timeline" | "album";
const INNER_TABS: InnerTab[] = ["carnet", "peso", "timeline", "album"];
const INNER_TAB_LABELS: Record<InnerTab, string> = {
  carnet: "Carnet", peso: "Peso", timeline: "Timeline", album: "Álbum",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const { t } = useTranslation();
  const [pets, setPets]                   = useState<PetSummary[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [token, setToken]                 = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingPet, setEditingPet]       = useState<PetSummary | null>(null);
  const [form, setForm]                   = useState<FormState>(emptyForm);
  const [saving, setSaving]               = useState(false);
  const [innerTab, setInnerTab]           = useState<InnerTab>("carnet");
  const params = useLocalSearchParams();
  const router = useRouter();

  const selectedPet = useMemo(
    () => pets.find(p => p.id === selectedPetId) ?? pets[0],
    [pets, selectedPetId]
  );

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const tokens = await getTokens();
        if (!tokens) throw new Error(t("common.noSession"));
        setToken(tokens.access_token);
        await fetchMyProfile(tokens.access_token);
        const petList = await listPets(tokens.access_token);
        setPets(petList);
        setSelectedPetId(petList[0]?.id ?? null);
      } catch (e: any) {
        setError(e?.message ?? t("profile.errors.couldNotLoad"));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  useEffect(() => {
    if (params.add === "1") {
      openCreate();
      router.replace("/tabs/profile" as any);
    }
  }, [params.add, router]);

  const openCreate = () => { setEditingPet(null); setForm(emptyForm); setIsFormOpen(true); };
  const openEdit = (pet: PetSummary) => {
    setEditingPet(pet);
    setForm({
      name: pet.name ?? "", species: pet.species ?? "",
      breed: pet.breed ?? "", weight: pet.weight ? String(pet.weight) : "", sex: pet.sex ?? "",
    });
    setIsFormOpen(true);
  };

  const savePet = async () => {
    if (!token) return;
    if (!form.name || !form.species) { setError(t("profile.errors.requiredFields")); return; }
    setSaving(true); setError(null);
    try {
      const payload: PetCreatePayload | PetUpdatePayload = {
        name: form.name, species: form.species, breed: form.breed || undefined,
        sex: form.sex || undefined, weight: form.weight ? Number(form.weight) : undefined,
      };
      if (editingPet) {
        const updated = await updatePet(editingPet.id, payload, token);
        setPets(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSelectedPetId(updated.id);
      } else {
        const created = await createPet(payload as PetCreatePayload, token);
        setPets(prev => [...prev, created]);
        setSelectedPetId(created.id);
      }
      setIsFormOpen(false); setEditingPet(null); setForm(emptyForm);
    } catch (e: any) {
      setError(e?.message ?? t("profile.errors.couldNotSavePet"));
    } finally {
      setSaving(false);
    }
  };

  const changeAvatar = async () => {
    if (!token || !selectedPet) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setError(t("profile.errors.galleryPermission")); return; }
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
      const updated = await updatePet(selectedPet.id, { avatar_url: localUri }, token);
      setPets(prev => prev.map(p => p.id === updated.id ? { ...p, avatar_url: localUri } : p));
    } catch (e: any) {
      setError(e?.message ?? t("profile.errors.couldNotSaveImage"));
    } finally {
      setSaving(false);
    }
  };

  const resolveAvatarUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[s.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={MAG} size="large" />
        <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>{t("profile.loading")}</Text>
      </SafeAreaView>
    );
  }

  const pet = selectedPet;
  const avatarUri = resolveAvatarUrl(pet?.avatar_url);
  const emoji = petEmoji(pet?.species);
  const ageStr = petAge(pet?.birthdate);

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerSub}>HOJA DE VIDA DIGITAL</Text>
            <Text style={s.headerTitle}>{pet?.name ?? "Mascotas"}</Text>
          </View>
          <TouchableOpacity style={s.iconBtn} onPress={openCreate} activeOpacity={0.75}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { marginLeft: 6 }]} onPress={() => pet && openEdit(pet)} activeOpacity={0.75}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Pet switcher (>1 mascota) ────────────────────────────────────── */}
        {pets.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.switcherRow}
            style={{ marginBottom: 14 }}
          >
            {pets.map(p => {
              const active = p.id === selectedPet?.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPetId(p.id)}
                  style={[s.switchChip, active && s.switchChipActive]}
                  activeOpacity={0.75}
                >
                  {active && (
                    <LinearGradient colors={[MAG, PRP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.switchDot} />
                  )}
                  {!active && <View style={[s.switchDot, { backgroundColor: COLORS.tabInactive }]} />}
                  <Text style={[s.switchChipTxt, active && { color: "#fff" }]}>{p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── Hero card con borde gradiente ───────────────────────────────── */}
        <LinearGradient
          colors={[MAG, PRP, CYN, MAG]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.heroGrad}
        >
          <View style={s.heroInner}>
            {/* Avatar + datos */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              {/* Avatar */}
              <View>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={s.avatar} />
                ) : (
                  <LinearGradient
                    colors={[MAG, PRP]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.avatarFallback}
                  >
                    <Text style={{ fontSize: 34 }}>{emoji}</Text>
                  </LinearGradient>
                )}
                <TouchableOpacity style={s.cameraBtn} onPress={changeAvatar} activeOpacity={0.85}>
                  <Ionicons name="camera" size={13} color="#0A0520" />
                </TouchableOpacity>
              </View>

              {/* Nombre, raza, chips */}
              <View style={{ flex: 1 }}>
                <Text style={s.heroName}>{pet?.name ?? "—"}</Text>
                <Text style={s.heroBreed}>{pet?.breed ?? pet?.species ?? "—"}</Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {pet?.sex     && <View style={s.chip}><Text style={s.chipTxt}>{pet.sex}</Text></View>}
                  {ageStr       && <View style={s.chip}><Text style={s.chipTxt}>{ageStr}</Text></View>}
                  {pet?.weight  && <View style={s.chip}><Text style={s.chipTxt}>{pet.weight} kg</Text></View>}
                </View>
              </View>
            </View>

            {/* Fila de datos: CUMPLE | ESPECIE | SEXO */}
            <View style={s.metaRow}>
              <View style={s.metaCell}>
                <Text style={s.metaLabel}>CUMPLE</Text>
                <Text style={s.metaValue}>{fmtDate(pet?.birthdate)}</Text>
              </View>
              <View style={s.metaDivider} />
              <View style={s.metaCell}>
                <Text style={s.metaLabel}>ESPECIE</Text>
                <Text style={s.metaValue}>{pet?.species ?? "—"}</Text>
              </View>
              <View style={s.metaDivider} />
              <View style={s.metaCell}>
                <Text style={s.metaLabel}>SEXO</Text>
                <Text style={s.metaValue}>{pet?.sex ?? "—"}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Tabs internos ────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.innerTabsRow}
        >
          {INNER_TABS.map(tabId => (
            <TouchableOpacity
              key={tabId}
              onPress={() => setInnerTab(tabId)}
              style={{ borderRadius: 99, overflow: "hidden" }}
              activeOpacity={0.75}
            >
              {innerTab === tabId ? (
                <LinearGradient
                  colors={[MAG, PRP]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.innerTabActive}
                >
                  <Text style={[s.innerTabTxt, { color: "#fff" }]}>{INNER_TAB_LABELS[tabId]}</Text>
                </LinearGradient>
              ) : (
                <View style={s.innerTabInactive}>
                  <Text style={s.innerTabTxt}>{INNER_TAB_LABELS[tabId]}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── CARNET ───────────────────────────────────────────────────────── */}
        {innerTab === "carnet" && (
          <View>
            <SecHeader title="Vacunas" action="+ Añadir" />
            {VACUNAS.map(v => {
              const ok = v.status === "ok";
              const warn = v.status === "warn";
              const iconColor = ok ? GRN : (warn ? AMB : AMB);
              return (
                <View key={v.n} style={s.card}>
                  <View style={[s.cardIcon, {
                    backgroundColor: ok ? `${GRN}22` : `${AMB}22`,
                    borderColor:     ok ? `${GRN}55` : `${AMB}55`,
                  }]}>
                    <Ionicons name="medkit" size={18} color={iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{v.n}</Text>
                    <Text style={s.cardSub}>Aplicada {v.d}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.nextLabel}>PRÓX.</Text>
                    <Text style={[s.nextValue, v.status === "pending" && { color: AMB }]}>
                      {v.next}
                    </Text>
                  </View>
                </View>
              );
            })}

            <SecHeader title="Medicamentos activos" />
            {MEDS.map(m => (
              <View key={m.n} style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: `${m.color}22`, borderColor: `${m.color}55` }]}>
                  <Ionicons name="flask" size={18} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{m.n}</Text>
                  <Text style={s.cardSub}>{m.dose}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── PESO ─────────────────────────────────────────────────────────── */}
        {innerTab === "peso" && (
          <View>
            <SecHeader title="Peso" />
            <View style={[s.card, { flexDirection: "column", alignItems: "flex-start" }]}>
              <Text style={{ fontSize: 11, color: COLORS.tabInactive, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: "600" }}>
                Peso actual
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <Text style={{ fontSize: 40, fontWeight: "800", color: MAG }}>
                  {pet?.weight ?? "—"}
                </Text>
                <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>kg</Text>
              </View>
              <Text style={{ fontSize: 12, color: GRN, marginTop: 2 }}>
                +1.6 kg últimos 6 meses · saludable
              </Text>
              <View style={{ marginTop: 16, width: "100%" }}>
                <Sparkline data={WEIGHT_DATA} color={MAG} w={SW - 80} h={100} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 8 }}>
                {WEIGHT_LABELS.map(l => (
                  <Text key={l} style={{ fontSize: 10, color: COLORS.tabInactive }}>{l}</Text>
                ))}
              </View>
            </View>

            <SecHeader title="Análisis" />
            <View style={[s.card, { flexDirection: "column", alignItems: "flex-start" }]}>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 }}>
                {pet?.name ?? "Tu mascota"} está dentro del rango saludable para su raza y especie.
                Su ritmo de ganancia de peso es estable y consistente.
              </Text>
            </View>
          </View>
        )}

        {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
        {innerTab === "timeline" && (
          <View style={{ paddingTop: 8 }}>
            {/* Línea vertical de la timeline */}
            <View style={{
              position: "absolute", left: 13, top: 12, bottom: 12,
              width: 1.5, backgroundColor: `${MAG}40`,
            }} />
            {TIMELINE.map((ev, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <View style={[s.tlIcon, { backgroundColor: `${ev.c}22`, borderColor: `${ev.c}99` }]}>
                  <Ionicons name={ev.icon} size={13} color={ev.c} />
                </View>
                <View style={[s.card, { flex: 1, marginBottom: 0 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{ev.title}</Text>
                    <Text style={s.cardSub}>{ev.sub}</Text>
                  </View>
                  <Text style={s.nextLabel}>{ev.d.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── ÁLBUM ────────────────────────────────────────────────────────── */}
        {innerTab === "album" && (
          <View>
            <SecHeader title="Álbum de fotos" />
            <View style={s.albumGrid}>
              {ALBUM_LABELS.map((label, i) => (
                <LinearGradient
                  key={i}
                  colors={ALBUM_GRADS[i % ALBUM_GRADS.length]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.albumCell}
                >
                  <Text style={s.albumLabel}>{label}</Text>
                </LinearGradient>
              ))}
            </View>
            <TouchableOpacity style={s.albumAdd} activeOpacity={0.75}>
              <Ionicons name="add" size={16} color={COLORS.textSecondary} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: "600" }}>
                Añadir foto o video
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error inline */}
        {error && (
          <View style={{ backgroundColor: "rgba(255,107,107,0.1)", borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: "rgba(255,107,107,0.25)" }}>
            <Text style={{ color: "#ff6b6b", fontSize: 13 }}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Modal: crear / editar mascota ───────────────────────────────────── */}
      <Modal visible={isFormOpen} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHandle} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={s.modalTitle}>
                {editingPet ? "Editar mascota" : "Agregar mascota"}
              </Text>
              <Pressable onPress={() => setIsFormOpen(false)}>
                <Ionicons name="close" size={22} color="#fff" />
              </Pressable>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.tabInactive, marginBottom: 14 }}>
              {editingPet
                ? "Actualiza los datos de tu mascota."
                : "Crea el perfil digital de tu nueva mascota."}
            </Text>

            {(
              [
                { key: "name",    ph: "Nombre *",                    kb: undefined          },
                { key: "species", ph: "Especie * (ej. Perro, Gato)", kb: undefined          },
                { key: "breed",   ph: "Raza",                        kb: undefined          },
                { key: "weight",  ph: "Peso (kg)",                   kb: "numeric" as const },
                { key: "sex",     ph: "Sexo (Macho / Hembra)",       kb: undefined          },
              ] as const
            ).map(field => (
              <TextInput
                key={field.key}
                placeholder={field.ph}
                placeholderTextColor={COLORS.tabInactive}
                style={s.modalInput}
                value={(form as any)[field.key]}
                keyboardType={field.kb}
                onChangeText={txt => setForm(prev => ({ ...prev, [field.key]: txt }))}
              />
            ))}

            {error && <Text style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 6 }}>{error}</Text>}

            <TouchableOpacity onPress={savePet} disabled={saving} style={{ borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
              <LinearGradient
                colors={[MAG, PRP]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 14, alignItems: "center", borderRadius: 99 }}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                      {editingPet ? "Guardar cambios" : "Crear mascota"}
                    </Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: COLORS.bgDark },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },

  // Header
  header: { flexDirection: "row", alignItems: "center", paddingTop: 6, paddingBottom: 14 },
  headerSub: {
    fontSize: 11, color: COLORS.tabInactive,
    letterSpacing: 1, textTransform: "uppercase", fontWeight: "600",
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },

  // Pet switcher
  switcherRow: { gap: 8, paddingVertical: 2 },
  switchChip: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  switchChipActive: { backgroundColor: `${MAG}1A`, borderColor: `${MAG}66` },
  switchDot: { width: 8, height: 8, borderRadius: 4 },
  switchChipTxt: { fontSize: 13, fontWeight: "600", color: COLORS.tabInactive },

  // Hero card
  heroGrad:  { borderRadius: 22, padding: 2, marginBottom: 16 },
  heroInner: { borderRadius: 20, padding: 18, backgroundColor: "#120A2E" },
  avatar:    { width: 76, height: 76, borderRadius: 38 },
  avatarFallback: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  cameraBtn: {
    position: "absolute", bottom: -2, right: -2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: CYN, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#120A2E",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
  },
  heroName:  { fontSize: 22, fontWeight: "700", color: "#fff" },
  heroBreed: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  chip:    { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.1)" },
  chipTxt: { fontSize: 12, color: "#fff", fontWeight: "600" },
  metaRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)",
  },
  metaCell:    { flex: 1 },
  metaDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 8 },
  metaLabel:   { fontSize: 9, color: COLORS.tabInactive, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: "600" },
  metaValue:   { fontSize: 12, fontWeight: "600", color: "#fff", marginTop: 3 },

  // Inner tabs
  innerTabsRow:    { gap: 6, paddingBottom: 4, marginBottom: 8 },
  innerTabActive:  { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99 },
  innerTabInactive: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  innerTabTxt: { fontSize: 13, fontWeight: "600", color: COLORS.tabInactive },

  // Cards genéricas
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 12, marginBottom: 8,
  },
  cardIcon:  { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#fff" },
  cardSub:   { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  nextLabel: { fontSize: 9, color: COLORS.tabInactive, letterSpacing: 0.8, textTransform: "uppercase" },
  nextValue: { fontSize: 11, color: "#fff", fontWeight: "500", marginTop: 2 },

  // Timeline
  tlIcon: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginTop: 4, zIndex: 1,
  },

  // Álbum
  albumGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  albumCell: {
    width: (SW - 44) / 3, height: 100,
    borderRadius: 12, justifyContent: "flex-end",
    padding: 7, overflow: "hidden",
  },
  albumLabel: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: "700" },
  albumAdd: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginTop: 14, paddingVertical: 12,
    borderRadius: 99, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(10,5,32,0.88)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#1a0f3a",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: 40,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center", marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: "#fff", marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
});
