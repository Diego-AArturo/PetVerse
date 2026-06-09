import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../src/Theme/colors";
import { listPets } from "../../src/data/petService";
import { getTokens } from "../../src/data/tokenStorage";

type Pet = { id: number; name: string; species?: string; breed?: string | null };
type Msg = { role: "ai" | "user"; text: string };

const GREETING = (name?: string) =>
  `¡Hola! Soy PetIA, la asistente de${name ? ` ${name}` : " tus mascotas"}. Puedes preguntarme sobre salud, comportamiento o cuidados. ¿Qué te inquieta hoy?`;

// ── Animación de puntos "escribiendo" ─────────────────────────────────────────
function TypingDots() {
  const d0 = useRef(new Animated.Value(0.25)).current;
  const d1 = useRef(new Animated.Value(0.25)).current;
  const d2 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const pulse = (d: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(d, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.25, duration: 320, useNativeDriver: true }),
        ])
      );
    const a0 = pulse(d0, 0), a1 = pulse(d1, 220), a2 = pulse(d2, 440);
    a0.start(); a1.start(); a2.start();
    return () => { a0.stop(); a1.stop(); a2.stop(); };
  }, []);

  return (
    <View style={s.bubbleAI}>
      <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
        {[d0, d1, d2].map((d, i) => (
          <Animated.View key={i} style={{
            width: 7, height: 7, borderRadius: 3.5,
            backgroundColor: COLORS.tabInactive,
            opacity: d,
          }} />
        ))}
      </View>
    </View>
  );
}

// ── Respuestas mock (reemplazar con llamada al backend cuando esté listo) ──────
const MOCK: Record<string, string> = {
  paseo:   "Se recomiendan al menos 2 paseos diarios de 20-30 minutos. La frecuencia ideal depende de la raza y energía. Razas activas necesitan más tiempo al aire libre 🐕",
  fruta:   "Sí, muchas frutas son seguras: manzana (sin semillas), sandía, arándanos y banana. Evita uvas, pasas y aguacate — son tóxicos para perros y gatos 🍎",
  vacuna:  "Las vacunas esenciales son rabia, moquillo, parvovirus y hepatitis. La mayoría se aplican en el primer año con refuerzos anuales. ¡Consulta el calendario con tu vet! 💉",
  estres:  "Señales de estrés incluyen: jadeos, lamido compulsivo, orejas hacia atrás y evitar contacto. Una rutina estable y enriquecimiento ambiental ayudan mucho 🧡",
  default: "Es una excelente pregunta. Para una evaluación precisa te recomiendo consultar a tu veterinario. En general, rutinas estables de alimentación, ejercicio y revisiones periódicas son clave 🐾",
};

function getReply(q: string, petName: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("paseo") || lower.includes("caminar") || lower.includes("ejercici")) return MOCK.paseo;
  if (lower.includes("fruta") || lower.includes("comer") || lower.includes("aliment"))    return MOCK.fruta;
  if (lower.includes("vacuna"))                                                             return MOCK.vacuna;
  if (lower.includes("estres") || lower.includes("estrés") || lower.includes("ansied"))   return MOCK.estres;
  return `Para ${petName}: ` + MOCK.default;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PetIAScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [pet, setPet]         = useState<Pet | null>(null);
  const [msgs, setMsgs]       = useState<Msg[]>([{ role: "ai", text: GREETING() }]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      const tok = await getTokens();
      if (!tok?.access_token) return;
      const pets = await listPets(tok.access_token);
      if (pets?.length) {
        const p = pets[0];
        setPet(p);
        setMsgs(prev =>
          prev.length === 1 && prev[0].role === "ai"
            ? [{ role: "ai", text: GREETING(p.name) }]
            : prev
        );
      }
    })();
  }, []);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => { scrollToEnd(); }, [msgs, loading]);

  const suggestions = pet
    ? [
        t("petia.suggestions.walks"),
        t("petia.suggestions.fruit", { name: pet.name }),
        t("petia.suggestions.vaccines"),
        t("petia.suggestions.stress"),
      ]
    : [];

  async function ask(q: string) {
    if (!q.trim() || loading || !pet) return;
    setMsgs(m => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
    setMsgs(m => [...m, { role: "ai", text: getReply(q, pet.name) }]);
    setLoading(false);
  }

  const speciesLabel = (() => {
    const sp = pet?.species?.toLowerCase() ?? "";
    if (sp.includes("perro") || sp.includes("dog")) return "perros";
    if (sp.includes("gato") || sp.includes("cat"))  return "gatos";
    return "mascotas";
  })();

  const canSend = input.trim().length > 0 && !loading;

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerSub}>{t("petia.subtitle")}</Text>
            <Text style={s.headerTitle}>
              Pet<Text style={{ color: COLORS.primary }}>IA</Text>
            </Text>
          </View>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.75}>
            <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Persona strip ───────────────────────────────────────────────── */}
        <View style={s.persona}>
          <LinearGradient
            colors={[COLORS.accentMagenta, COLORS.accentPurple, COLORS.accentCyan]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.personaIcon}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={s.personaName}>{t("petia.title")}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={s.onlineDot} />
              <Text style={s.onlineTxt}>{t("petia.online", { species: speciesLabel })}</Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Chat ────────────────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={s.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {msgs.map((m, i) =>
            m.role === "ai" ? (
              <View key={i} style={s.bubbleAI}>
                <Text style={[s.msgTxt, { color: COLORS.textPrimary }]}>{m.text}</Text>
              </View>
            ) : (
              <LinearGradient
                key={i}
                colors={[COLORS.accentMagenta, COLORS.accentPurple]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.bubbleUser}
              >
                <Text style={s.msgTxt}>{m.text}</Text>
              </LinearGradient>
            )
          )}
          {loading && <TypingDots />}
        </ScrollView>

        {/* ── Sugerencias (solo al inicio) ────────────────────────────────── */}
        {msgs.length <= 1 && !loading && suggestions.length > 0 && (
          <View style={s.suggestions}>
            {suggestions.map(sg => (
              <TouchableOpacity
                key={sg} style={s.chip}
                onPress={() => ask(sg)} activeOpacity={0.75}
              >
                <Text style={s.chipTxt}>{sg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input bar ───────────────────────────────────────────────────── */}
        <View style={[s.inputRow, { paddingBottom: (insets.bottom || 12) + 4 }]}>
          <View style={s.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => ask(input)}
              placeholder={pet ? t("petia.placeholder", { name: pet.name }) : t("petia.placeholderDefault")}
              placeholderTextColor={COLORS.tabInactive}
              style={s.input}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={() => ask(input)}
              disabled={!canSend}
              activeOpacity={0.8}
              style={{ borderRadius: 99, overflow: "hidden" }}
            >
              {canSend ? (
                <LinearGradient
                  colors={[COLORS.accentMagenta, COLORS.accentPurple]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.sendBtn}
                >
                  <Ionicons name="send" size={15} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={[s.sendBtn, s.sendBtnDim]}>
                  <Ionicons name="send" size={15} color={COLORS.tabInactive} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.micBtn} activeOpacity={0.75}>
            <Ionicons name="mic" size={18} color={COLORS.tabInactive} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDark },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingTop: 6, paddingBottom: 2,
  },
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

  persona: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  personaIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    shadowColor: COLORS.accentMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 14, elevation: 8,
  },
  personaName: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  onlineDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.accentGreen,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 4,
  },
  onlineTxt: { fontSize: 10, color: COLORS.accentGreen, fontWeight: "500" },
  divider: { height: 1, backgroundColor: COLORS.borderFaint, marginHorizontal: 18 },

  chatContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
  bubbleAI: {
    alignSelf: "flex-start", maxWidth: "82%",
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.borderFaint,
    borderRadius: 18, borderBottomLeftRadius: 4,
    padding: 12, marginBottom: 10,
  },
  bubbleUser: {
    alignSelf: "flex-end", maxWidth: "82%",
    borderRadius: 18, borderBottomRightRadius: 4,
    padding: 12, marginBottom: 10, overflow: "hidden",
  },
  msgTxt: { color: "#fff", fontSize: 13.5, lineHeight: 20 },

  suggestions: {
    paddingHorizontal: 14, paddingBottom: 6,
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },
  chip: {
    paddingVertical: 8, paddingHorizontal: 13, borderRadius: 99,
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.borderFaint,
  },
  chipTxt: { color: COLORS.textPrimary, fontSize: 12 },

  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingTop: 8,
  },
  inputWrap: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 6,
    paddingLeft: 14, paddingRight: 6, paddingVertical: 4,
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.borderFaint,
    borderRadius: 99,
  },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 14, paddingVertical: 9 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  sendBtnDim: { backgroundColor: COLORS.surfaceAlt },
  micBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1, borderColor: COLORS.borderFaint,
    alignItems: "center", justifyContent: "center",
  },
});
