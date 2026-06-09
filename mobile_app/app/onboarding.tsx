import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../src/Theme/colors";

const { width: SW } = Dimensions.get("window");

// ── Colores oscuros para steps cinematográficos (Diseño 1) ────────────────────
const DK = {
  bg:   "#0A0520",
  bg2:  "#120A2E",
  card: "rgba(255,255,255,0.05)",
  brd:  "rgba(255,255,255,0.10)",
  txt:  "#F5F0FF",
  dim:  "rgba(245,240,255,0.70)",
  mute: "rgba(245,240,255,0.48)",
};
const MAG = "#E056C7";
const PRP = "#7B3FE4";
const CYN = "#4FC3F7";

// ── Tipos de mascota (más opciones que Diseño 2) ──────────────────────────────
const PET_TYPES = [
  { id: "dog",      emoji: "🐶", label: "Perro"    },
  { id: "cat",      emoji: "🐱", label: "Gato"     },
  { id: "rabbit",   emoji: "🐰", label: "Conejo"   },
  { id: "bird",     emoji: "🦜", label: "Loro"     },
  { id: "hamster",  emoji: "🐹", label: "Hámster"  },
  { id: "fish",     emoji: "🐠", label: "Pez"      },
  { id: "turtle",   emoji: "🐢", label: "Tortuga"  },
  { id: "hedgehog", emoji: "🦔", label: "Erizo"    },
  { id: "reptile",  emoji: "🦎", label: "Reptil"   },
  { id: "other",    emoji: "✨", label: "Otra"     },
];

// ── Objetivos (Diseño 1) ──────────────────────────────────────────────────────
const GOALS = [
  { id: "health",    icon: "shield-checkmark-outline" as const, label: "Cuidar su salud"                 },
  { id: "community", icon: "people-outline"            as const, label: "Conocer otras mascotas"          },
  { id: "places",    icon: "location-outline"          as const, label: "Descubrir lugares pet-friendly"  },
  { id: "ai",        icon: "sparkles-outline"          as const, label: "Recibir consejos con IA"         },
  { id: "memories",  icon: "camera-outline"            as const, label: "Guardar sus momentos"            },
];

// ── Intereses (Diseño 2) ──────────────────────────────────────────────────────
const INTERESTS = [
  { id: "walks",     label: "Paseos 🌿"        },
  { id: "food",      label: "Nutrición 🥦"     },
  { id: "training",  label: "Entrenamiento 🎯" },
  { id: "photos",    label: "Fotos 📸"         },
  { id: "grooming",  label: "Grooming 🛁"      },
  { id: "health",    label: "Veterinaria 💊"   },
  { id: "toys",      label: "Juguetes 🎾"      },
  { id: "adoption",  label: "Adopción ❤️"      },
];

// ── Tipos de paso ─────────────────────────────────────────────────────────────
type StepId =
  | "splash" | "welcome" | "intro"
  | "petType" | "petName" | "petAge" | "petSex"
  | "goals" | "interests" | "permissions"
  | "creating" | "ready";

const STEP_ORDER: StepId[] = [
  "splash", "welcome", "intro",
  "petType", "petName", "petAge", "petSex",
  "goals", "interests", "permissions",
  "creating", "ready",
];
const Q_STEPS: StepId[] = ["petType", "petName", "petAge", "petSex", "goals", "interests", "permissions"];

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Splash (Diseño 1 oscuro animado)
// ─────────────────────────────────────────────────────────────────────────────
function SplashStep({ onDone }: { onDone: () => void }) {
  const spin1  = useRef(new Animated.Value(0)).current;
  const spin2  = useRef(new Animated.Value(0)).current;
  const orbitV = useRef(new Animated.Value(0)).current;
  const pulse  = useRef(new Animated.Value(1)).current;
  const fade   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(spin1,  { toValue: 1, duration: 6000,  easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(spin2,  { toValue: 1, duration: 9000,  easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(orbitV, { toValue: 1, duration: 8000,  easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.0,  duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 700, useNativeDriver: true }).start(onDone);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const rot1  = spin1.interpolate({ inputRange: [0, 1], outputRange: ["0deg",   "360deg"]  });
  const rot2  = spin2.interpolate({ inputRange: [0, 1], outputRange: ["0deg",  "-360deg"]  });
  const rotOrb = orbitV.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"]  });

  const RING_SZ = 224;
  const RING2_SZ = 176;
  const ORBIT_R  = RING_SZ / 2 - 2;

  const orbitDots = [0, 60, 120, 180, 240, 300].map(deg => {
    const rad = (deg * Math.PI) / 180;
    return {
      left: RING_SZ / 2 + Math.cos(rad) * ORBIT_R - 3,
      top:  RING_SZ / 2 + Math.sin(rad) * ORBIT_R - 3,
    };
  });

  return (
    <Animated.View style={{ flex: 1, backgroundColor: DK.bg, alignItems: "center", justifyContent: "center", opacity: fade }}>
      {/* Anillos + puntos orbitales */}
      <View style={{ width: RING_SZ, height: RING_SZ, alignItems: "center", justifyContent: "center" }}>
        {/* Ring 1 */}
        <Animated.View style={{
          position: "absolute", width: RING_SZ, height: RING_SZ, borderRadius: RING_SZ / 2,
          borderWidth: 1.5, borderColor: MAG,
          transform: [{ rotate: rot1 }],
          shadowColor: MAG, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 18,
        }} />
        {/* Ring 2 (reverse, cian) */}
        <Animated.View style={{
          position: "absolute", width: RING2_SZ, height: RING2_SZ, borderRadius: RING2_SZ / 2,
          borderWidth: 1, borderColor: CYN, opacity: 0.7,
          transform: [{ rotate: rot2 }],
        }} />
        {/* Puntos orbitales */}
        <Animated.View style={{
          position: "absolute", width: RING_SZ, height: RING_SZ,
          transform: [{ rotate: rotOrb }],
        }}>
          {orbitDots.map((dot, i) => (
            <View key={i} style={{
              position: "absolute",
              left: dot.left, top: dot.top,
              width: 6, height: 6, borderRadius: 3,
              backgroundColor: "#fff",
              shadowColor: MAG, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6,
            }} />
          ))}
        </Animated.View>
        {/* Centro: pata pulsante */}
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <LinearGradient
            colors={[PRP, "#1e0c4a"]}
            start={{ x: 0.3, y: 0.3 }} end={{ x: 1, y: 1 }}
            style={{
              width: 112, height: 112, borderRadius: 56,
              alignItems: "center", justifyContent: "center",
              shadowColor: PRP, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 28,
            }}
          >
            <Ionicons name="paw" size={50} color="#fff" />
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Texto inferior */}
      <View style={{ position: "absolute", bottom: 90, alignItems: "center" }}>
        <Text style={{ fontSize: 38, fontWeight: "700", letterSpacing: -0.5, color: DK.txt }}>
          Pet<Text style={{ color: MAG }}>Verse</Text>
        </Text>
        <Text style={{ color: DK.mute, fontSize: 12, letterSpacing: 1.8, textTransform: "uppercase", marginTop: 5 }}>
          El universo de tu mascota
        </Text>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Bienvenida (Diseño 2 texto + logo, fondo oscuro)
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  const pop = useRef(new Animated.Value(0.88)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, damping: 18, stiffness: 180, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.0,  duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: DK.bg2 }} edges={["top"]}>
      <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, transform: [{ scale: pop }] }}>
        {/* Logo con glow */}
        <Animated.View style={{
          width: 180, height: 180, borderRadius: 90,
          backgroundColor: "rgba(123,63,228,0.18)",
          alignItems: "center", justifyContent: "center",
          marginBottom: 30,
          transform: [{ scale: pulse }],
          shadowColor: PRP, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 40,
        }}>
          <Image
            source={require("../assets/images/logo_blanco.png")}
            style={{ width: 130, height: 130, resizeMode: "contain" }}
          />
          <Text style={{ position: "absolute", top: 6, right: 12, fontSize: 24 }}>✨</Text>
          <Text style={{ position: "absolute", bottom: 8, left: 6, fontSize: 18 }}>✨</Text>
        </Animated.View>

        <Text style={{ fontSize: 36, fontWeight: "700", textAlign: "center", color: DK.txt, lineHeight: 42, marginBottom: 14 }}>
          Bienvenido a{"\n"}
          <Text style={{ color: MAG }}>Pet</Text>
          <Text style={{ color: CYN }}>Verse</Text>
        </Text>
        <Text style={{ fontSize: 16, textAlign: "center", color: DK.dim, lineHeight: 24 }}>
          El universo digital donde{"\n"}tu mascota es la protagonista
        </Text>
      </Animated.View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 50 }}>
        <TouchableOpacity onPress={onNext} activeOpacity={0.88} style={{ borderRadius: 99, overflow: "hidden" }}>
          <LinearGradient colors={[MAG, PRP, CYN]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 17, alignItems: "center", borderRadius: 99 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Empezar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Intro "Creemos el universo" (Diseño 1)
// ─────────────────────────────────────────────────────────────────────────────
function IntroStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.09, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.0,  duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 0.7, duration: 2200, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.3, duration: 2200, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: DK.bg2 }} edges={["top"]}>
      {/* Botón saltar */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: 8 }}>
        <TouchableOpacity onPress={onSkip} activeOpacity={0.75}>
          <Text style={{ color: DK.dim, fontWeight: "600", fontSize: 15 }}>Saltar</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 26, paddingTop: 12 }}>
        {/* Ilustración de pata */}
        <View style={{ height: 190, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={{
            position: "absolute",
            width: 150, height: 150, borderRadius: 75,
            backgroundColor: MAG,
            opacity: glow,
          }} />
          <Animated.View style={{
            width: 118, height: 118, borderRadius: 59,
            backgroundColor: "rgba(255,255,255,0.08)",
            alignItems: "center", justifyContent: "center",
            transform: [{ scale: pulse }],
          }}>
            <Ionicons name="paw" size={64} color="#fff" style={{ opacity: 0.95 }} />
          </Animated.View>
        </View>

        {/* Texto */}
        <Text style={{ color: DK.mute, fontSize: 11, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 14 }}>
          Paso 1 · Te damos la bienvenida
        </Text>
        <Text style={{ color: DK.txt, fontSize: 30, fontWeight: "800", lineHeight: 37, marginBottom: 16 }}>
          Creemos el universo de tu mascota
        </Text>
        <Text style={{ color: DK.dim, fontSize: 15, lineHeight: 23 }}>
          Te haremos algunas preguntas para construir su hoja de vida digital. Puedes retroceder o avanzar cuando quieras.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 50 }}>
        <TouchableOpacity onPress={onNext} activeOpacity={0.88} style={{ borderRadius: 99, overflow: "hidden" }}>
          <LinearGradient colors={[MAG, PRP, CYN]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 17, alignItems: "center", borderRadius: 99 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout compartido para preguntas (Diseño 2, tema claro)
// ─────────────────────────────────────────────────────────────────────────────
function QuestionLayout({
  qIdx, title, subtitle, onNext, onBack, onSkip, canContinue, children,
}: {
  qIdx: number; title: string; subtitle?: string;
  onNext: () => void; onBack: () => void; onSkip: () => void;
  canContinue: boolean; children: React.ReactNode;
}) {
  const TOTAL = Q_STEPS.length;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={["top"]}>
      {/* Barra de progreso */}
      <View style={{ flexDirection: "row", gap: 4, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 99, backgroundColor: COLORS.borderFaint, overflow: "hidden" }}>
            {i <= qIdx && (
              <LinearGradient colors={[MAG, PRP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
            )}
          </View>
        ))}
      </View>

      {/* Top bar */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 6 }}>
        <TouchableOpacity onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.borderFaint, alignItems: "center", justifyContent: "center" }} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 11, color: COLORS.tabInactive, fontWeight: "700", letterSpacing: 1 }}>
          {String(qIdx + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </Text>
        <TouchableOpacity onPress={onSkip} activeOpacity={0.75}>
          <Text style={{ color: COLORS.tabInactive, fontWeight: "600", fontSize: 13 }}>Saltar</Text>
        </TouchableOpacity>
      </View>

      {/* Título */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 10 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: COLORS.textPrimary, letterSpacing: -0.5 }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 15, color: COLORS.textSecondary, marginTop: 5, lineHeight: 21 }}>{subtitle}</Text>}
      </View>

      {/* Contenido */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>

      {/* Botón continuar */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 44 }}>
        <TouchableOpacity onPress={onNext} disabled={!canContinue} activeOpacity={0.88} style={{ borderRadius: 99, overflow: "hidden" }}>
          <LinearGradient
            colors={canContinue ? [MAG, PRP] : [COLORS.borderFaint, COLORS.borderFaint]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 17, alignItems: "center", borderRadius: 99 }}
          >
            <Text style={{ color: canContinue ? "#fff" : COLORS.tabInactive, fontSize: 16, fontWeight: "700" }}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preguntas
// ─────────────────────────────────────────────────────────────────────────────
const CARD_W = (SW - 44 - 20) / 3; // 3 columnas

function PetTypeContent({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {PET_TYPES.map(pt => {
        const sel = value === pt.id;
        return (
          <TouchableOpacity
            key={pt.id}
            onPress={() => onChange(pt.id)}
            activeOpacity={0.85}
            style={{
              width: CARD_W,
              backgroundColor: sel ? COLORS.primaryLight : COLORS.card,
              borderRadius: 16,
              borderWidth: sel ? 2 : 1.5,
              borderColor: sel ? COLORS.primary : COLORS.borderFaint,
              paddingVertical: 16, paddingHorizontal: 8,
              alignItems: "center", gap: 7,
              shadowColor: sel ? COLORS.primary : "transparent",
              shadowOffset: { width: 0, height: sel ? 6 : 0 },
              shadowOpacity: sel ? 0.18 : 0,
              shadowRadius: 10, elevation: sel ? 4 : 0,
            }}
          >
            <Text style={{ fontSize: 34 }}>{pt.emoji}</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: sel ? COLORS.primary : COLORS.textPrimary, textAlign: "center" }}>
              {pt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function PetNameContent({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ backgroundColor: COLORS.card, borderRadius: 16, paddingHorizontal: 18, borderWidth: 1.5, borderColor: COLORS.borderFaint, marginBottom: 14 }}>
        <TextInput
          autoFocus
          value={value}
          onChangeText={onChange}
          placeholder="Ej: Max, Luna, Coco…"
          placeholderTextColor={COLORS.tabInactive}
          style={{ paddingVertical: 18, fontSize: 22, fontWeight: "700", color: COLORS.textPrimary }}
          returnKeyType="next"
        />
      </View>
      {value.trim().length > 0 && (
        <View style={{ padding: 14, borderRadius: 14, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary + "44" }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.primary }}>
            ✨  ¡Hola, {value}! Qué nombre tan bonito.
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function PetAgeContent({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const displayVal = value === 0 ? "< 1" : value;
  const unit = value < 1 ? "año" : value === 1 ? "año" : "años";

  return (
    <View style={{ alignItems: "center", paddingTop: 10 }}>
      <Text style={{ fontSize: 90, fontWeight: "800", color: COLORS.primary, lineHeight: 100, letterSpacing: -2 }}>
        {displayVal}
      </Text>
      <Text style={{ fontSize: 18, color: COLORS.textSecondary, fontWeight: "600", marginBottom: 30 }}>{unit}</Text>

      {/* +/- Controls */}
      <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(0, value - 1))}
          activeOpacity={0.8}
          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.borderFaint, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="remove" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ width: 80, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.primary }}>{value === 0 ? "bebé" : `${value} ${unit}`}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onChange(Math.min(20, value + 1))}
          activeOpacity={0.8}
          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 12, color: COLORS.tabInactive, marginTop: 20, textAlign: "center" }}>
        Toca + o − para ajustar la edad
      </Text>
    </View>
  );
}

function PetSexContent({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { id: "female", icon: "♀", label: "Hembra", color: "#C96FD0" },
    { id: "male",   icon: "♂", label: "Macho",  color: "#5B7FE8" },
  ];
  return (
    <View style={{ flexDirection: "row", gap: 14, paddingTop: 6 }}>
      {opts.map(o => {
        const sel = value === o.id;
        return (
          <TouchableOpacity
            key={o.id}
            onPress={() => onChange(o.id)}
            activeOpacity={0.85}
            style={{
              flex: 1, paddingVertical: 30, borderRadius: 20,
              backgroundColor: sel ? o.color : COLORS.card,
              borderWidth: sel ? 2 : 1.5,
              borderColor: sel ? o.color : COLORS.borderFaint,
              alignItems: "center", gap: 10,
              shadowColor: sel ? o.color : "transparent",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: sel ? 0.35 : 0,
              shadowRadius: 14, elevation: sel ? 6 : 0,
            }}
          >
            <Text style={{ fontSize: 40, lineHeight: 46, color: sel ? "#fff" : COLORS.textPrimary }}>{o.icon}</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: sel ? "#fff" : COLORS.textPrimary }}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function GoalsContent({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);

  return (
    <View style={{ gap: 10 }}>
      {GOALS.map(g => {
        const sel = value.includes(g.id);
        return (
          <TouchableOpacity
            key={g.id}
            onPress={() => toggle(g.id)}
            activeOpacity={0.85}
            style={{
              flexDirection: "row", alignItems: "center", gap: 14,
              padding: 16, borderRadius: 16,
              backgroundColor: sel ? COLORS.primaryLight : COLORS.card,
              borderWidth: sel ? 2 : 1.5,
              borderColor: sel ? COLORS.primary : COLORS.borderFaint,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 10,
              backgroundColor: sel ? COLORS.primary : COLORS.surfaceAlt,
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name={g.icon} size={20} color={sel ? "#fff" : COLORS.tabInactive} />
            </View>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: COLORS.textPrimary }}>{g.label}</Text>
            <View style={{
              width: 24, height: 24, borderRadius: 12,
              backgroundColor: sel ? COLORS.primary : "transparent",
              borderWidth: sel ? 0 : 1.5, borderColor: COLORS.borderMed,
              alignItems: "center", justifyContent: "center",
            }}>
              {sel && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function InterestsContent({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {INTERESTS.map(it => {
        const sel = value.includes(it.id);
        return (
          <TouchableOpacity
            key={it.id}
            onPress={() => toggle(it.id)}
            activeOpacity={0.85}
            style={{
              paddingVertical: 11, paddingHorizontal: 18, borderRadius: 99,
              backgroundColor: sel ? COLORS.textPrimary : COLORS.card,
              borderWidth: 1.5,
              borderColor: sel ? COLORS.textPrimary : COLORS.borderFaint,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: sel ? "#fff" : COLORS.textPrimary }}>
              {sel ? "✓ " : ""}{it.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function PermissionsContent({ value, onChange }: { value: Record<string, boolean>; onChange: (k: string) => void }) {
  const items = [
    { id: "notifications", icon: "notifications-outline" as const, label: "Notificaciones", desc: "Recordatorios de vacunas, citas y más" },
    { id: "location",      icon: "location-outline"      as const, label: "Ubicación",      desc: "Encuentra veterinarias y lugares pet-friendly cercanos" },
  ];
  return (
    <View style={{ gap: 12 }}>
      {items.map(it => {
        const on = !!value[it.id];
        return (
          <View key={it.id} style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.borderFaint }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: on ? COLORS.primary : COLORS.bgAlt, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={it.icon} size={22} color={on ? "#fff" : COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.textPrimary }}>{it.label}</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3, lineHeight: 17 }}>{it.desc}</Text>
            </View>
            <Switch
              value={on}
              onValueChange={() => onChange(it.id)}
              trackColor={{ false: COLORS.borderFaint, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 11 — Creando (spinner, auto-advance)
// ─────────────────────────────────────────────────────────────────────────────
function CreatingStep({ onDone }: { onDone: () => void }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })).start();
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 120, height: 120, marginBottom: 28 }}>
        <Animated.View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: 60, borderWidth: 4,
          borderColor: COLORS.primaryLight,
          borderTopColor: COLORS.primary,
          transform: [{ rotate: rotate }],
        }} />
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="paw" size={52} color={COLORS.primary} />
        </View>
      </View>
      <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.textPrimary, letterSpacing: -0.4 }}>Creando tu universo…</Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 15, marginTop: 8 }}>Un momento, por favor</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 12 — Universo activo (celebración)
// ─────────────────────────────────────────────────────────────────────────────
function ReadyStep({ petName, petType, onDone }: { petName: string; petType: string; onDone: () => void }) {
  const pop = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, damping: 14, stiffness: 160, useNativeDriver: true }).start();
  }, []);

  const emoji = PET_TYPES.find(p => p.id === petType)?.emoji ?? "🐾";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={["top"]}>
      <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, transform: [{ scale: pop }] }}>
        <View style={{ position: "relative", width: 180, height: 180, marginBottom: 28 }}>
          <LinearGradient
            colors={[COLORS.primaryLight, COLORS.bgAlt]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 90 }}
          />
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 90, lineHeight: 100 }}>{emoji}</Text>
          </View>
          <Text style={{ position: "absolute", top: 2, right: 8, fontSize: 28 }}>🎉</Text>
          <Text style={{ position: "absolute", bottom: 6, left: 6, fontSize: 20 }}>✨</Text>
        </View>

        <Text style={{ fontSize: 34, fontWeight: "800", color: COLORS.textPrimary, textAlign: "center", letterSpacing: -0.5, marginBottom: 10 }}>
          Universo activo ✨
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 16, textAlign: "center", lineHeight: 24 }}>
          {petName ? petName : "Tu mascota"} ya forma parte de PetVerse 💛
        </Text>
      </Animated.View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 50 }}>
        <TouchableOpacity onPress={onDone} activeOpacity={0.88} style={{ borderRadius: 99, overflow: "hidden" }}>
          <LinearGradient colors={[MAG, PRP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 17, alignItems: "center", borderRadius: 99 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Entrar al dashboard →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pantalla principal
// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();

  const [step, setStep]             = useState<StepId>("splash");
  const [petType, setPetType]       = useState("");
  const [petName, setPetName]       = useState("");
  const [petAge, setPetAge]         = useState(2);
  const [petSex, setPetSex]         = useState("");
  const [goals, setGoals]           = useState<string[]>([]);
  const [interests, setInterests]   = useState<string[]>([]);
  const [perms, setPerms]           = useState<Record<string, boolean>>({});

  const qIdx = Q_STEPS.indexOf(step);

  const goTo = (s: StepId) => setStep(s);

  const next = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i < STEP_ORDER.length - 1) setStep(STEP_ORDER[i + 1]);
  };

  const back = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) setStep(STEP_ORDER[i - 1]);
  };

  const skipToQuestions = () => goTo("petType");
  const complete = () => router.replace("/tabs/home" as any);

  // ── Cinematic steps ──────────────────────────────────────────────────────
  if (step === "splash")   return <SplashStep  onDone={next} />;
  if (step === "welcome")  return <WelcomeStep  onNext={next} />;
  if (step === "intro")    return <IntroStep    onNext={next} onSkip={skipToQuestions} />;
  if (step === "creating") return <CreatingStep onDone={next} />;
  if (step === "ready")    return <ReadyStep    petName={petName} petType={petType} onDone={complete} />;

  // ── Question steps ───────────────────────────────────────────────────────
  const questionProps = {
    qIdx,
    onBack: back,
    onSkip: () => goTo("creating"),
  };

  if (step === "petType") return (
    <QuestionLayout {...questionProps}
      title="¿Qué tipo de mascota tienes?"
      subtitle="Empecemos por lo más importante."
      onNext={next} canContinue={!!petType}
    >
      <PetTypeContent value={petType} onChange={setPetType} />
    </QuestionLayout>
  );

  if (step === "petName") return (
    <QuestionLayout {...questionProps}
      title="¿Cómo se llama?"
      subtitle="Así personalizaremos los mensajes dentro de PetVerse."
      onNext={next} canContinue={petName.trim().length >= 2}
    >
      <PetNameContent value={petName} onChange={setPetName} />
    </QuestionLayout>
  );

  if (step === "petAge") return (
    <QuestionLayout {...questionProps}
      title="¿Cuántos años tiene?"
      subtitle="Arrastra para seleccionar la edad aproximada."
      onNext={next} canContinue
    >
      <PetAgeContent value={petAge} onChange={setPetAge} />
    </QuestionLayout>
  );

  if (step === "petSex") return (
    <QuestionLayout {...questionProps}
      title="¿Cuál es su sexo?"
      subtitle="Algunos consejos varían según el sexo de tu mascota."
      onNext={next} canContinue={!!petSex}
    >
      <PetSexContent value={petSex} onChange={setPetSex} />
    </QuestionLayout>
  );

  if (step === "goals") return (
    <QuestionLayout {...questionProps}
      title="¿Qué te gustaría lograr?"
      subtitle="Puedes elegir varios. Priorizaremos las recomendaciones según esto."
      onNext={next} canContinue={goals.length > 0}
    >
      <GoalsContent value={goals} onChange={setGoals} />
    </QuestionLayout>
  );

  if (step === "interests") return (
    <QuestionLayout {...questionProps}
      title="¿Qué te interesa?"
      subtitle="Elige los temas que más te importan para tu mascota."
      onNext={next} canContinue
    >
      <InterestsContent value={interests} onChange={setInterests} />
    </QuestionLayout>
  );

  if (step === "permissions") return (
    <QuestionLayout {...questionProps}
      title="Permisos"
      subtitle="Para darte la mejor experiencia en PetVerse."
      onNext={next} canContinue
    >
      <PermissionsContent
        value={perms}
        onChange={k => setPerms(p => ({ ...p, [k]: !p[k] }))}
      />
    </QuestionLayout>
  );

  return null;
}
