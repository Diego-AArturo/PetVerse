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

// ── Helpers ───────────────────────────────────────────────────────────────────
function petAge(birthdate?: string | null, t?: (k: string, o?: any) => string): string {
  if (!birthdate) return "";
  const d = new Date(birthdate);
  const now = new Date();
  const years = now.getFullYear() - d.getFullYear();
  if (years === 0) {
    const raw = now.getMonth() - d.getMonth();
    const m = raw < 0 ? raw + 12 : raw;
    return t ? t("profile.age.months", { count: m }) : `${m} meses`;
  }
  return t
    ? t(years === 1 ? "profile.age.year" : "profile.age.years", { count: years })
    : `${years} ${years === 1 ? "año" : "años"}`;
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
function Sparkline({ data, color = COLORS.primary, w, h = 90 }: { data: number[]; color?: string; w: number; h?: number }) {
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

// ── Sección header ─────────────────────────────────────────────────────────────
function SecHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.textPrimary }}>{title}</Text>
      {action && <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: "600" }}>{action}</Text>}
    </View>
  );
}

// ── Status badge (carnet) ──────────────────────────────────────────────────────
type VaccineStatus = "ok" | "pending" | "overdue";
function StatusBadge({ status }: { status: VaccineStatus }) {
  const { t } = useTranslation();
  const config = {
    ok:      { bg: COLORS.statusOkBg,      color: COLORS.statusOkText,      labelKey: "profile.carnet.badge.ok"      },
    pending: { bg: COLORS.statusPendingBg,  color: COLORS.statusPendingText,  labelKey: "profile.carnet.badge.pending"  },
    overdue: { bg: COLORS.statusOverdueBg,  color: COLORS.statusOverdueText,  labelKey: "profile.carnet.badge.overdue"  },
  }[status];
  return (
    <View style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99, backgroundColor: config.bg }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: config.color }}>● {t(config.labelKey)}</Text>
    </View>
  );
}

// ── QR placeholder ────────────────────────────────────────────────────────────
function QRPlaceholder() {
  return (
    <View style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: COLORS.card, padding: 5 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", width: 46, height: 46 }}>
        {Array.from({ length: 64 }).map((_, i) => {
          const x = i % 8, y = Math.floor(i / 8);
          const filled = (x + y * 13) % 7 < 3;
          return (
            <View key={i} style={{ width: 5.75, height: 5.75, backgroundColor: filled ? COLORS.textPrimary : "transparent" }} />
          );
        })}
      </View>
    </View>
  );
}

// ── Data: vacunas, medicamentos, visitas ──────────────────────────────────────
type Vacuna = { name: string; date: string; next: string; status: VaccineStatus };
const VACUNAS: Vacuna[] = [
  { name: "Polivalente (DHPP)", date: "12 Mar 2026", next: "12 Mar 2027", status: "ok"      },
  { name: "Antirrábica",        date: "5 Feb 2026",  next: "5 Feb 2027",  status: "ok"      },
  { name: "Bordetella",         date: "20 Ene 2026", next: "20 Jul 2026", status: "pending"  },
  { name: "Leptospirosis",      date: "12 Mar 2026", next: "12 Mar 2027", status: "ok"      },
  { name: "Giardia",            date: "15 Oct 2025", next: "15 Abr 2026", status: "overdue"  },
];

type Medicamento = { name: string; desc: string; next: string; color: string };
const MEDICAMENTOS: Medicamento[] = [
  { name: "Bravecto",          desc: "Antiparasitario · 1 cada 3 meses", next: "En 23 días", color: COLORS.accentAmber  },
  { name: "Drontal",           desc: "Desparasitante · Mensual",         next: "En 8 días",  color: COLORS.timelineGreen },
  { name: "Omega-3 articular", desc: "1 cápsula · diario",               next: "En 1 día",   color: COLORS.accentCyan   },
];

type Visita = { date: string; title: string; vet: string; clinic: string };
const VISITAS: Visita[] = [
  { date: "12 Mar 2026", title: "Control anual",           vet: "Dr. Patricia García", clinic: "VetCare Centro" },
  { date: "5 Feb 2026",  title: "Antirrábica + revisión",  vet: "Dr. Patricia García", clinic: "VetCare Centro" },
  { date: "8 Dic 2025",  title: "Limpieza dental",         vet: "Dr. Carlos M.",       clinic: "Pet Dental"     },
];

// ── Timeline data ─────────────────────────────────────────────────────────────
type TimelineEv = { date: string; title: string; sub: string; emoji: string; color: string };
const TIMELINE_DATA: TimelineEv[] = [
  { date: "Hoy",         title: "Paseo de 45 min",            sub: "Parque El Virrey",         emoji: "🌳", color: COLORS.timelineGreen       },
  { date: "Ayer",        title: "Vacuna polivalente aplicada", sub: "Dr. Patricia G.",          emoji: "💉", color: COLORS.timelineMustard     },
  { date: "Hace 3 días", title: "Foto agregada al álbum",     sub: "Domingo en la playa",      emoji: "📸", color: COLORS.timelinePurpleLight  },
  { date: "Hace 1 sem",  title: "Peso registrado · 12.4 kg",  sub: "+0.3 kg vs. mes anterior", emoji: "⚖️", color: COLORS.timelinePurple       },
];

const WEIGHT_DATA   = [10.2, 10.6, 11.0, 11.4, 11.8, 12.1, 12.4];
const WEIGHT_LABELS = ["Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago"];

// ── Carnet: tarjetas de ítem ──────────────────────────────────────────────────
function VaccineCard({ v }: { v: Vacuna }) {
  const { t } = useTranslation();
  return (
    <View style={cs.itemCard}>
      <View style={cs.itemIcon}>
        <Ionicons name="create-outline" size={20} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={cs.itemTitle}>{v.name}</Text>
        <Text style={cs.itemSub}>{t("profile.carnet.vaccineItem", { date: v.date, next: v.next })}</Text>
      </View>
      <StatusBadge status={v.status} />
    </View>
  );
}

function MedCard({ m }: { m: Medicamento }) {
  return (
    <View style={cs.itemCard}>
      <View style={[cs.itemIcon, { backgroundColor: m.color + "33" }]}>
        <Ionicons name="flask-outline" size={20} color={m.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={cs.itemTitle}>{m.name}</Text>
        <Text style={cs.itemSub}>{m.desc}</Text>
      </View>
      <View style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99, backgroundColor: COLORS.statusPendingBg }}>
        <Text style={{ fontSize: 11, fontWeight: "600", color: COLORS.statusPendingText }}>{m.next}</Text>
      </View>
    </View>
  );
}

function VisitCard({ v }: { v: Visita }) {
  return (
    <View style={cs.itemCard}>
      <View style={[cs.itemIcon, { backgroundColor: COLORS.bgAlt }]}>
        <Ionicons name="medical-outline" size={20} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[cs.itemSub, { marginBottom: 3, letterSpacing: 0.4 }]}>{v.date}</Text>
        <Text style={cs.itemTitle}>{v.title}</Text>
        <Text style={cs.itemSub}>{v.vet} · {v.clinic}</Text>
      </View>
    </View>
  );
}

// ── CarnetView (pantalla completa) ────────────────────────────────────────────
function CarnetView({ pet, onBack }: { pet: PetSummary | undefined; onBack: () => void }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"vacunas" | "medicamentos" | "visitas">("vacunas");
  const emoji = petEmoji(pet?.species);

  const tabDefs = [
    { id: "vacunas" as const,       labelKey: "profile.carnet.tabs.vaccines"     },
    { id: "medicamentos" as const,  labelKey: "profile.carnet.tabs.medications"  },
    { id: "visitas" as const,       labelKey: "profile.carnet.tabs.visits"       },
  ];

  return (
    <SafeAreaView style={cs.root} edges={["top"]}>
      {/* Header */}
      <View style={cs.header}>
        <TouchableOpacity style={cs.backBtn} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={cs.headerSub}>{t("profile.carnet.subtitle")}</Text>
          <Text style={cs.headerTitle}>{t("profile.carnet.title")}</Text>
        </View>
        <TouchableOpacity style={cs.addBtn} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ID Card */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
        <View style={cs.idCard}>
          <View style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
            <Ionicons name="paw" size={140} color="#fff" />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={cs.idLabel}>{t("profile.carnet.idLabel")}</Text>
              <Text style={cs.idName}>{pet?.name ?? "Luna"}</Text>
              <Text style={cs.idMicro}>{t("profile.carnet.microchip")} · 985 112 003 481 220</Text>
            </View>
            <View style={cs.idAvatar}>
              <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 18, gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={cs.idFieldLabel}>{t("profile.carnet.vaccinesLabel")}</Text>
              <Text style={cs.idFieldValue}>{t("profile.carnet.vaccinesValue")}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cs.idFieldLabel}>{t("profile.carnet.issuedLabel")}</Text>
              <Text style={cs.idFieldValue}>{t("profile.carnet.issuedValue")}</Text>
            </View>
            <QRPlaceholder />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={cs.tabsRow}>
        {tabDefs.map(({ id, labelKey }) => (
          <TouchableOpacity
            key={id}
            style={[cs.tabBtn, tab === id && cs.tabBtnActive]}
            onPress={() => setTab(id)}
            activeOpacity={0.85}
          >
            <Text style={[cs.tabTxt, tab === id && cs.tabTxtActive]}>{t(labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {tab === "vacunas"      && VACUNAS.map((v, i)     => <VaccineCard key={i} v={v} />)}
        {tab === "medicamentos" && MEDICAMENTOS.map((m, i) => <MedCard     key={i} m={m} />)}
        {tab === "visitas"      && VISITAS.map((v, i)      => <VisitCard   key={i} v={v} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
type FormState = { name: string; species: string; breed?: string; weight?: string; sex?: string };
const emptyForm: FormState = { name: "", species: "", breed: "", weight: "", sex: "" };

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
  const [view, setView]                   = useState<"profile" | "carnet">("profile");
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
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>{t("profile.loading")}</Text>
      </SafeAreaView>
    );
  }

  if (view === "carnet") {
    return <CarnetView pet={selectedPet} onBack={() => setView("profile")} />;
  }

  const pet = selectedPet;
  const avatarUri = resolveAvatarUrl(pet?.avatar_url);
  const emoji = petEmoji(pet?.species);
  const ageStr = petAge(pet?.birthdate, t);

  const formFields = [
    { key: "name" as const,    ph: t("profile.form.namePh"),    kb: undefined          },
    { key: "species" as const, ph: t("profile.form.speciesPh"), kb: undefined          },
    { key: "breed" as const,   ph: t("profile.form.breedPh"),   kb: undefined          },
    { key: "weight" as const,  ph: t("profile.form.weightPh"),  kb: "numeric" as const },
    { key: "sex" as const,     ph: t("profile.form.sexPh"),     kb: undefined          },
  ];

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
            <Text style={s.headerSub}>{t("profile.subtitle")}</Text>
            <Text style={s.headerTitle}>{pet?.name ?? t("profile.defaultTitle")}</Text>
          </View>
          <TouchableOpacity style={s.iconBtn} onPress={openCreate} activeOpacity={0.75}>
            <Ionicons name="add" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { marginLeft: 6 }]} onPress={() => pet && openEdit(pet)} activeOpacity={0.75}>
            <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Pet switcher ────────────────────────────────────────────────── */}
        {pets.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.switcherRow} style={{ marginBottom: 14 }}>
            {pets.map(p => {
              const active = p.id === selectedPet?.id;
              return (
                <TouchableOpacity key={p.id} onPress={() => setSelectedPetId(p.id)}
                  style={[s.switchChip, active && s.switchChipActive]} activeOpacity={0.75}>
                  {active && (
                    <LinearGradient colors={[COLORS.accentMagenta, COLORS.accentPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.switchDot} />
                  )}
                  {!active && <View style={[s.switchDot, { backgroundColor: COLORS.tabInactive }]} />}
                  <Text style={[s.switchChipTxt, active && { color: COLORS.primary }]}>{p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── Hero card con borde gradiente ───────────────────────────────── */}
        <LinearGradient
          colors={[COLORS.accentMagenta, COLORS.accentPurple, COLORS.accentCyan, COLORS.accentMagenta]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.heroGrad}
        >
          <View style={s.heroInner}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={s.avatar} />
                ) : (
                  <LinearGradient colors={[COLORS.accentMagenta, COLORS.accentPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.avatarFallback}>
                    <Text style={{ fontSize: 34 }}>{emoji}</Text>
                  </LinearGradient>
                )}
                <TouchableOpacity style={s.cameraBtn} onPress={changeAvatar} activeOpacity={0.85}>
                  <Ionicons name="camera" size={13} color={COLORS.card} />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={s.heroName}>{pet?.name ?? "—"}</Text>
                <Text style={s.heroBreed}>{pet?.breed ?? pet?.species ?? "—"}</Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {pet?.sex    && <View style={s.chip}><Text style={s.chipTxt}>{pet.sex}</Text></View>}
                  {ageStr      && <View style={s.chip}><Text style={s.chipTxt}>{ageStr}</Text></View>}
                  {pet?.weight && <View style={s.chip}><Text style={s.chipTxt}>{pet.weight} kg</Text></View>}
                </View>
              </View>
            </View>

            <View style={s.metaRow}>
              <View style={s.metaCell}>
                <Text style={s.metaLabel}>{t("profile.meta.birthday")}</Text>
                <Text style={s.metaValue}>{fmtDate(pet?.birthdate)}</Text>
              </View>
              <View style={s.metaDivider} />
              <View style={s.metaCell}>
                <Text style={s.metaLabel}>{t("profile.meta.species")}</Text>
                <Text style={s.metaValue}>{pet?.species ?? "—"}</Text>
              </View>
              <View style={s.metaDivider} />
              <View style={s.metaCell}>
                <Text style={s.metaLabel}>{t("profile.meta.sex")}</Text>
                <Text style={s.metaValue}>{pet?.sex ?? "—"}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Quick cards: Carnet digital + Álbum ────────────────────────── */}
        <View style={s.quickGrid}>
          <TouchableOpacity style={s.quickCard} onPress={() => setView("carnet")} activeOpacity={0.85}>
            <View style={s.quickIcon}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={s.quickTitle}>{t("profile.quickCards.carnetTitle")}</Text>
            <Text style={s.quickSub}>{t("profile.quickCards.carnetSub")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickCard} activeOpacity={0.85}>
            <View style={[s.quickIcon, { backgroundColor: COLORS.bgAlt }]}>
              <Ionicons name="images-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={s.quickTitle}>{t("profile.quickCards.albumTitle")}</Text>
            <Text style={s.quickSub}>{t("profile.quickCards.albumSub")}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Crecimiento ─────────────────────────────────────────────────── */}
        <SecHeader title={t("profile.growth.title")} action={t("profile.growth.action")} />
        <View style={s.growthCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
            <View>
              <Text style={s.growthLabel}>{t("profile.growth.weightLabel")}</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                <Text style={s.growthVal}>{pet?.weight ?? "12.4"}</Text>
                <Text style={s.growthUnit}>kg</Text>
              </View>
            </View>
            <View style={s.growthBadge}>
              <Ionicons name="trending-up" size={11} color={COLORS.statusOkText} />
              <Text style={s.growthBadgeTxt}>{t("profile.growth.weightBadge")}</Text>
            </View>
          </View>
          <Sparkline data={WEIGHT_DATA} color={COLORS.primary} w={SW - 80} h={90} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            {WEIGHT_LABELS.map(l => <Text key={l} style={s.growthAxisLbl}>{l}</Text>)}
          </View>
        </View>

        {/* ── Línea de tiempo ─────────────────────────────────────────────── */}
        <SecHeader title={t("profile.timeline.title")} action={t("profile.timeline.action")} />
        <View style={{ paddingBottom: 8 }}>
          {TIMELINE_DATA.map((ev, i) => (
            <View key={i} style={s.tlRow}>
              <View style={{ alignItems: "center" }}>
                <View style={[s.tlCircle, { backgroundColor: ev.color }]}>
                  <Text style={{ fontSize: 17 }}>{ev.emoji}</Text>
                </View>
                {i < TIMELINE_DATA.length - 1 && (
                  <View style={{ width: 2, flex: 1, backgroundColor: COLORS.borderFaint, marginTop: 4 }} />
                )}
              </View>
              <View style={{ flex: 1, paddingBottom: 14 }}>
                <Text style={s.tlDate}>{ev.date}</Text>
                <Text style={s.tlTitle}>{ev.title}</Text>
                <Text style={s.tlDesc}>{ev.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Error inline */}
        {error && (
          <View style={{ backgroundColor: COLORS.errorBg, borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: COLORS.errorBorder }}>
            <Text style={{ color: COLORS.badgeRed, fontSize: 13 }}>{error}</Text>
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
                {editingPet ? t("profile.form.editTitle") : t("profile.form.createTitle")}
              </Text>
              <Pressable onPress={() => setIsFormOpen(false)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </Pressable>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.tabInactive, marginBottom: 14 }}>
              {editingPet ? t("profile.form.editSub") : t("profile.form.createSub")}
            </Text>

            {formFields.map(field => (
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

            {error && <Text style={{ color: COLORS.badgeRed, fontSize: 12, marginBottom: 6 }}>{error}</Text>}

            <TouchableOpacity onPress={savePet} disabled={saving} style={{ borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
              <LinearGradient colors={[COLORS.accentMagenta, COLORS.accentPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 14, alignItems: "center", borderRadius: 99 }}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                      {editingPet ? t("profile.form.saveChanges") : t("profile.form.createPet")}
                    </Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Estilos principales ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },

  header: { flexDirection: "row", alignItems: "center", paddingTop: 6, paddingBottom: 14 },
  headerSub: {
    fontSize: 11, color: COLORS.tabInactive,
    letterSpacing: 1, textTransform: "uppercase", fontWeight: "600",
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary },
  iconBtn: {
    width: 40, height: 40, borderRadius: 99,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1, borderColor: COLORS.borderFaint,
    alignItems: "center", justifyContent: "center",
  },

  switcherRow: { gap: 8, paddingVertical: 2 },
  switchChip: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.borderFaint,
  },
  switchChipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  switchDot: { width: 8, height: 8, borderRadius: 4 },
  switchChipTxt: { fontSize: 13, fontWeight: "600", color: COLORS.tabInactive },

  heroGrad:  { borderRadius: 22, padding: 2, marginBottom: 16 },
  heroInner: { borderRadius: 20, padding: 18, backgroundColor: COLORS.card },
  avatar:    { width: 76, height: 76, borderRadius: 38 },
  avatarFallback: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  cameraBtn: {
    position: "absolute", bottom: -2, right: -2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.accentCyan,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: COLORS.card,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 4,
  },
  heroName:  { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary },
  heroBreed: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  chip:    { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, backgroundColor: COLORS.primaryLight },
  chipTxt: { fontSize: 12, color: COLORS.primary, fontWeight: "600" },
  metaRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: COLORS.borderFaint,
  },
  metaCell:    { flex: 1 },
  metaDivider: { width: 1, height: 28, backgroundColor: COLORS.borderFaint, marginHorizontal: 8 },
  metaLabel:   { fontSize: 9, color: COLORS.tabInactive, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: "600" },
  metaValue:   { fontSize: 12, fontWeight: "600", color: COLORS.textPrimary, marginTop: 3 },

  quickGrid: { flexDirection: "row", gap: 10, marginBottom: 4 },
  quickCard: {
    flex: 1, backgroundColor: COLORS.card,
    borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: COLORS.borderFaint,
  },
  quickIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  quickTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  quickSub:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  growthCard: {
    backgroundColor: COLORS.card, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: COLORS.borderFaint,
  },
  growthLabel:    { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
  growthVal:      { fontSize: 36, fontWeight: "800", color: COLORS.textPrimary },
  growthUnit:     { fontSize: 15, color: COLORS.textSecondary },
  growthBadge:    { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99, backgroundColor: COLORS.statusOkBg },
  growthBadgeTxt: { fontSize: 12, fontWeight: "700", color: COLORS.statusOkText },
  growthAxisLbl:  { fontSize: 10, color: COLORS.tabInactive },

  tlRow:   { flexDirection: "row", gap: 14, minHeight: 56 },
  tlCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  tlDate:  { fontSize: 10, color: COLORS.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  tlTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginTop: 2 },
  tlDesc:  { fontSize: 13, color: COLORS.textSecondary, marginTop: 1 },

  modalOverlay: { flex: 1, backgroundColor: COLORS.overlayModal, justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: 40,
    borderWidth: 1, borderColor: COLORS.borderFaint,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 99, backgroundColor: COLORS.borderMed, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  modalInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.textPrimary, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.borderFaint,
  },
});

// ── Estilos del Carnet ────────────────────────────────────────────────────────
const cs = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderFaint,
    alignItems: "center", justifyContent: "center",
  },
  headerSub: {
    fontSize: 11, color: COLORS.tabInactive,
    letterSpacing: 1, textTransform: "uppercase", fontWeight: "600",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
  },

  idCard: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 22, padding: 18,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  idLabel:      { fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "600", letterSpacing: 1.5 },
  idName:       { fontSize: 26, fontWeight: "700", color: "#fff", marginTop: 4 },
  idMicro:      { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  idAvatar:     { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  idFieldLabel: { fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1, fontWeight: "600" },
  idFieldValue: { fontSize: 18, fontWeight: "700", color: "#fff", marginTop: 2 },

  tabsRow: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1, borderColor: "transparent",
  },
  tabBtnActive: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.borderFaint,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabTxt:       { fontSize: 13, fontWeight: "600", color: COLORS.tabInactive },
  tabTxtActive: { color: COLORS.textPrimary },

  itemCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.borderFaint,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  itemIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  itemTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  itemSub:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});
