import React, { useState } from "react";
import {
  Dimensions, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../src/Theme/colors";

const { width: SW } = Dimensions.get("window");

// ── Datos ─────────────────────────────────────────────────────────────────────
type Post = {
  id: number; user: string; pet: string; when: string;
  text: string; likes: number; comments: number;
  hue: string; tag: string; emoji: string;
  verified: boolean; mine?: boolean;
};

const ALL_POSTS: Post[] = [
  {
    id: 1, user: "Laura M.", pet: "Rocky · Labrador", when: "12 min",
    text: "Primer día en el parque de la 93 🥹 miren esa cara de felicidad. ¿Alguien más va los domingos?",
    likes: 42, comments: 8, hue: COLORS.accentMagenta, tag: "Parques", emoji: "🐕", verified: false,
  },
  {
    id: 2, user: "Dra. Camila R.", pet: "Veterinaria · Chapinero", when: "1 h",
    text: "Recordatorio: la desparasitación mensual es CLAVE en temporada de lluvias. Les dejo mi guía rápida ↓",
    likes: 128, comments: 24, hue: COLORS.accentPurple, tag: "Salud", emoji: "🩺", verified: true,
  },
  {
    id: 3, user: "Andrés V.", pet: "Mía · Poodle", when: "3 h",
    text: "Buscando recomendaciones de peluquería canina en Teusaquillo. Mía quedó hermosa la última vez 🐩",
    likes: 17, comments: 11, hue: COLORS.accentCyan, tag: "Grooming", emoji: "🐩", verified: false,
  },
  {
    id: 4, user: "Sara T.", pet: "Bolt · Beagle", when: "5 h",
    text: "Los beagles son TAN traviesos pero TAN amados 😅 hoy se comió mi audífono. ¡Cuéntenme sus historias!",
    likes: 89, comments: 34, hue: COLORS.accentAmber, tag: "Vida pet", emoji: "🐶", verified: false,
  },
  {
    id: 5, user: "PetVerse", pet: "Comunidad oficial", when: "1 d",
    text: "¡Semana de adopción! Esta semana publicaremos historias de mascotas que buscan hogar. ¿Los compartirías? 🏠",
    likes: 342, comments: 67, hue: COLORS.accentGreen, tag: "Adopción", emoji: "🐾", verified: true,
  },
];

const MY_POSTS: Post[] = [
  {
    id: 10, user: "Tú", pet: "Luna · Golden Mix", when: "1 h",
    text: "Luna descubrió que le encanta el parque 🐾 miren esa carota de felicidad. Cada paseo es una aventura nueva.",
    likes: 24, comments: 7, hue: COLORS.accentPurple, tag: "Vida pet", emoji: "🐶", verified: false, mine: true,
  },
  {
    id: 11, user: "Tú", pet: "Luna · Golden Mix", when: "3 d",
    text: "¡Consulta de hoy perfecta! 12.4 kg y muy sana según la Dra. Patricia 🩺 Gracias VetCare Centro.",
    likes: 56, comments: 12, hue: COLORS.accentGreen, tag: "Salud", emoji: "🩺", verified: false, mine: true,
  },
];

type Tip = { id: number; title: string; category: string; readTime: string; color: string; author: string; emoji: string; text: string; mine?: boolean };
const TIPS: Tip[] = [
  {
    id: 1, title: "7 señales de que tu perro está ansioso",
    category: "Comportamiento", readTime: "3 min", color: COLORS.accentPurple,
    author: "PetIA · Inteligencia artificial", emoji: "🧠",
    text: "Los perros no hablan, pero sus cuerpos dicen mucho. Aprende a leer el lenguaje corporal de tu mascota antes de que sea tarde...",
  },
  {
    id: 2, title: "Golden Retrievers: guía de alimentación por etapas",
    category: "Nutrición", readTime: "5 min", color: COLORS.accentAmber,
    author: "Dra. Camila R. · Veterinaria", emoji: "🍗",
    text: "La nutrición de un Golden varía mucho entre cachorro, adulto y senior. Aquí un resumen completo con porciones y marcas recomendadas...",
  },
  {
    id: 3, title: "Cómo introducir un segundo gato en casa",
    category: "Convivencia", readTime: "4 min", color: COLORS.accentCyan,
    author: "Sara T. · Usuaria", emoji: "🐱",
    text: "Después de tres intentos fallidos, encontré el método que funciona: cuarentena, intercambio de olores y presentación progresiva...",
  },
  {
    id: 4, title: "Primeros auxilios para mascotas: lo básico",
    category: "Salud", readTime: "6 min", color: COLORS.accentGreen,
    author: "PetVerse · Equipo editorial", emoji: "🏥",
    text: "¿Sabes qué hacer si tu mascota se atraganta o tiene una convulsión? Este artículo puede salvar vidas. Compártelo con tu familia...",
  },
  {
    id: 5, title: "Razas más activas para apartamento pequeño",
    category: "Razas", readTime: "4 min", color: COLORS.accentMagenta,
    author: "PetIA · Inteligencia artificial", emoji: "🏠",
    text: "Contrario a lo que muchos creen, no necesitas una casa grande para tener un perro activo. Estas razas se adaptan perfecto...",
  },
  {
    id: 6, title: "Cómo llevar el peso de tu mascota mes a mes",
    category: "Bienestar", readTime: "3 min", color: COLORS.accentPurple,
    author: "Tú · Mi consejo", emoji: "⚖️",
    text: "Registrar el peso mensual me ayudó a detectar a tiempo que Luna estaba ganando peso muy rápido. Comparto mi método...",
    mine: true,
  },
];

const GROUPS = [
  { name: "Golden Retrievers CO",  members: "2.4k", hue: COLORS.accentMagenta, emoji: "🐕" },
  { name: "Gatos de apartamento",  members: "890",  hue: COLORS.accentPurple,  emoji: "🐱" },
  { name: "Adopción responsable",  members: "5.1k", hue: COLORS.accentCyan,    emoji: "🐾" },
  { name: "Nutrición canina",      members: "1.1k", hue: COLORS.accentGreen,   emoji: "🥗" },
];

type Filter = "parati" | "consejos" | "todos" | "miperfil";
const FILTER_IDS: Filter[] = ["parati", "consejos", "todos", "miperfil"];

// ── Componentes menores ───────────────────────────────────────────────────────
function ImgBlock({ hue, label }: { hue: string; label: string }) {
  return (
    <LinearGradient
      colors={[COLORS.primaryLight, hue + "AA"]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={s.imgBlock}
    >
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.12 }}>
        {[0,1,2,3,4,5].map(i => (
          <View key={i} style={{ position: "absolute", left: i * 40 - 20, top: -20, width: 16, height: 220, backgroundColor: "#fff", transform: [{ rotate: "135deg" }] }} />
        ))}
      </View>
      <View style={s.imgLabel}>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "600" }}>{label}</Text>
      </View>
    </LinearGradient>
  );
}

function PostCard({ post, onLike, showMine }: { post: Post; onLike: (id: number) => void; showMine?: boolean }) {
  return (
    <View style={[s.postCard, post.mine && showMine && { borderColor: COLORS.primary + "44", borderWidth: 1.5 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <LinearGradient
          colors={[post.hue, post.hue + "88"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.postAvatar}
        >
          <Text style={{ fontSize: 18 }}>{post.emoji}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={s.postUser}>{post.user}</Text>
            {post.verified && <Ionicons name="checkmark-circle" size={13} color={COLORS.accentCyan} />}
          </View>
          <Text style={s.postMeta}>{post.pet} · hace {post.when}</Text>
        </View>
        <View style={[s.tagChip, { borderColor: post.hue + "55", backgroundColor: post.hue + "18" }]}>
          <Text style={[s.tagTxt, { color: post.hue }]}>{post.tag}</Text>
        </View>
      </View>

      <Text style={s.postText}>{post.text}</Text>
      <ImgBlock hue={post.hue} label={post.tag} />

      <View style={s.postActions}>
        <TouchableOpacity style={s.actionBtn} onPress={() => onLike(post.id)} activeOpacity={0.75}>
          <Ionicons name="heart-outline" size={18} color={COLORS.tabInactive} />
          <Text style={s.actionTxt}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} activeOpacity={0.75}>
          <Ionicons name="chatbubble-outline" size={17} color={COLORS.tabInactive} />
          <Text style={s.actionTxt}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { marginLeft: "auto" as any }]} activeOpacity={0.75}>
          <Ionicons name="paper-plane-outline" size={17} color={COLORS.tabInactive} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TipCard({ tip }: { tip: Tip }) {
  const { t } = useTranslation();
  return (
    <View style={[s.tipCard, tip.mine && { borderColor: COLORS.primary + "44", borderWidth: 1.5 }]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <LinearGradient
          colors={[tip.color, tip.color + "88"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.tipIcon}
        >
          <Text style={{ fontSize: 20 }}>{tip.emoji}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <View style={[s.tagChip, { borderColor: tip.color + "55", backgroundColor: tip.color + "18" }]}>
              <Text style={[s.tagTxt, { color: tip.color }]}>{tip.category}</Text>
            </View>
            <Text style={s.tipReadTime}>· {tip.readTime} {t("community.readTime")}</Text>
          </View>
          <Text style={s.tipTitle}>{tip.title}</Text>
          <Text style={s.tipText} numberOfLines={2}>{tip.text}</Text>
          <Text style={s.tipAuthor}>{tip.author}</Text>
        </View>
      </View>
    </View>
  );
}

function SecHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={s.secHeader}>
      <Text style={s.secTitle}>{title}</Text>
      {action && <Text style={s.secAction}>{action}</Text>}
    </View>
  );
}

// ── Mi Perfil ─────────────────────────────────────────────────────────────────
function MyProfileView({ onLike }: { onLike: (id: number) => void }) {
  const { t } = useTranslation();
  const myTips = TIPS.filter(tip => tip.mine);

  return (
    <View>
      <View style={s.profileCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <LinearGradient
            colors={[COLORS.accentMagenta, COLORS.accentPurple, COLORS.accentCyan]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.profileAvatar}
          >
            <Text style={{ fontSize: 30 }}>🐶</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{t("community.profile.name")}</Text>
            <Text style={s.profileBio}>{t("community.profile.bio")}</Text>
          </View>
          <TouchableOpacity style={s.editBtn} activeOpacity={0.8}>
            <Ionicons name="pencil-outline" size={15} color={COLORS.primary} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.primary }}>{t("community.profile.editBtn")}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          {[
            { value: `${MY_POSTS.length + myTips.length}`, labelKey: "community.profile.stats.posts" },
            { value: "142", labelKey: "community.profile.stats.followers" },
            { value: "89",  labelKey: "community.profile.stats.following"  },
          ].map((stat, i, arr) => (
            <React.Fragment key={stat.labelKey}>
              <View style={s.statCell}>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{t(stat.labelKey)}</Text>
              </View>
              {i < arr.length - 1 && <View style={s.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <TouchableOpacity style={{ borderRadius: 99, overflow: "hidden", marginBottom: 20 }} activeOpacity={0.88}>
        <LinearGradient colors={[COLORS.accentMagenta, COLORS.accentPurple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 99 }}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{t("community.profile.newPost")}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <SecHeader title={t("community.sections.myPosts")} />
      {MY_POSTS.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 32, marginBottom: 10 }}>{t("community.empty.noPostsIcon")}</Text>
          <Text style={s.emptyTitle}>{t("community.empty.noPostsTitle")}</Text>
          <Text style={s.emptySub}>{t("community.empty.noPostsSub")}</Text>
        </View>
      ) : (
        MY_POSTS.map(post => <PostCard key={post.id} post={post} onLike={onLike} showMine />)
      )}

      {myTips.length > 0 && (
        <>
          <SecHeader title={t("community.sections.myTips")} />
          {myTips.map(tip => <TipCard key={tip.id} tip={tip} />)}
        </>
      )}
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const { t } = useTranslation();
  const [filter, setFilter]         = useState<Filter>("parati");
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery]           = useState("");
  const [likes, setLikes]           = useState<Record<number, boolean>>({});
  const [notifCount]                = useState(3);

  const toggleLike = (id: number) =>
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  const withLikes = (posts: Post[]) =>
    posts.map(p => ({ ...p, likes: p.likes + (likes[p.id] ? 1 : 0) }));

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        {showSearch ? (
          <View style={s.searchBar}>
            <Ionicons name="search" size={16} color={COLORS.tabInactive} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder={t("community.searchPlaceholder")}
              placeholderTextColor={COLORS.tabInactive}
              style={s.searchInput}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setQuery(""); }}>
              <Text style={{ color: COLORS.accentMagenta, fontWeight: "700", fontSize: 13 }}>{t("community.searchCancel")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerSub}>{t("community.subtitle")}</Text>
              <Text style={s.headerTitle}>
                {t("community.title")} <Text style={{ color: COLORS.accentMagenta }}>{t("community.titleHighlight")}</Text>
              </Text>
            </View>
            <TouchableOpacity style={s.iconBtn} onPress={() => setShowSearch(true)} activeOpacity={0.75}>
              <Ionicons name="search" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={{ position: "relative", marginLeft: 6 }}>
              <TouchableOpacity style={s.iconBtn} activeOpacity={0.75}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
              {notifCount > 0 && (
                <View style={s.notifBadge}>
                  <Text style={s.notifTxt}>{notifCount}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Filtros ──────────────────────────────────────────────────────── */}
        {!showSearch && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtersRow}
          >
            {FILTER_IDS.map(id => (
              <TouchableOpacity
                key={id}
                onPress={() => setFilter(id)}
                style={{ borderRadius: 99, overflow: "hidden" }}
                activeOpacity={0.75}
              >
                {filter === id ? (
                  <LinearGradient
                    colors={[COLORS.accentMagenta, COLORS.accentPurple]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.filterActive}
                  >
                    <Text style={[s.filterTxt, { color: "#fff" }]}>{t(`community.filters.${id}`)}</Text>
                  </LinearGradient>
                ) : (
                  <View style={s.filterInactive}>
                    <Text style={s.filterTxt}>{t(`community.filters.${id}`)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── PARA TI ──────────────────────────────────────────────────────── */}
        {!showSearch && filter === "parati" && (
          <View>
            <SecHeader title={t("community.sections.recommended")} />
            {withLikes(ALL_POSTS.slice(0, 3)).map(post => (
              <PostCard key={post.id} post={post} onLike={toggleLike} />
            ))}
            <SecHeader title={t("community.sections.groupsForYou")} action={t("common.viewAllPlural")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.groupsRow}>
              {GROUPS.map(g => (
                <TouchableOpacity key={g.name} style={s.groupCard} activeOpacity={0.85}>
                  <LinearGradient colors={[g.hue, g.hue + "55"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.groupImg}>
                    <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                  </LinearGradient>
                  <View style={{ padding: 10 }}>
                    <Text style={s.groupName} numberOfLines={2}>{g.name}</Text>
                    <Text style={s.groupMembers}>{g.members} {t("community.members")}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── CONSEJOS ─────────────────────────────────────────────────────── */}
        {!showSearch && filter === "consejos" && (
          <View>
            <View style={[s.secHeader, { marginBottom: 14 }]}>
              <Text style={s.secTitle}>{t("community.sections.tipsTitle")}</Text>
              <View style={[s.tagChip, { borderColor: COLORS.accentPurple + "55", backgroundColor: COLORS.accentPurple + "18" }]}>
                <Text style={[s.tagTxt, { color: COLORS.accentPurple }]}>{t("community.sections.tipsBadge")}</Text>
              </View>
            </View>
            {TIPS.map(tip => <TipCard key={tip.id} tip={tip} />)}
          </View>
        )}

        {/* ── TODOS ────────────────────────────────────────────────────────── */}
        {!showSearch && filter === "todos" && (
          <View>
            <SecHeader title={t("community.sections.allPosts")} />
            {withLikes(ALL_POSTS).map(post => (
              <PostCard key={post.id} post={post} onLike={toggleLike} />
            ))}
            <SecHeader title={t("community.sections.groups")} action={t("common.viewAllPlural")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.groupsRow}>
              {GROUPS.map(g => (
                <TouchableOpacity key={g.name} style={s.groupCard} activeOpacity={0.85}>
                  <LinearGradient colors={[g.hue, g.hue + "55"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.groupImg}>
                    <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                  </LinearGradient>
                  <View style={{ padding: 10 }}>
                    <Text style={s.groupName} numberOfLines={2}>{g.name}</Text>
                    <Text style={s.groupMembers}>{g.members} {t("community.members")}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── MI PERFIL ────────────────────────────────────────────────────── */}
        {!showSearch && filter === "miperfil" && (
          <MyProfileView onLike={toggleLike} />
        )}

        {/* ── Búsqueda ─────────────────────────────────────────────────────── */}
        {showSearch && (
          <View>
            {query.trim() === "" ? (
              <View>
                <Text style={s.searchHint}>{t("community.search.trends")}</Text>
                {["#GoldenRetriever", "#AdopciónBogotá", "#GatosDeApartamento", "#NutriciónCanina"].map(tag => (
                  <TouchableOpacity key={tag} style={s.trendRow} activeOpacity={0.75}>
                    <View style={[s.trendIcon, { backgroundColor: COLORS.accentMagenta + "22" }]}>
                      <Ionicons name="trending-up" size={15} color={COLORS.accentMagenta} />
                    </View>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: "600" }}>{tag}</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.tabInactive} style={{ marginLeft: "auto" as any }} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 32, marginBottom: 10 }}>{t("community.search.searchIcon")}</Text>
                <Text style={s.emptyTitle}>{t("community.search.searchingFor", { query })}</Text>
                <Text style={s.emptySub}>{t("community.search.backendNote")}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },

  header:    { flexDirection: "row", alignItems: "center", paddingTop: 6, paddingBottom: 10 },
  headerSub: { fontSize: 11, color: COLORS.tabInactive, letterSpacing: 1, textTransform: "uppercase", fontWeight: "600" },
  headerTitle: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary },
  iconBtn: {
    width: 40, height: 40, borderRadius: 99,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1, borderColor: COLORS.borderFaint,
    alignItems: "center", justifyContent: "center",
  },
  notifBadge: {
    position: "absolute", top: 2, right: 2,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.badgeRed,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  notifTxt: { color: "#fff", fontSize: 9, fontWeight: "800" },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderFaint,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    marginTop: 6, marginBottom: 14,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },

  filtersRow:    { paddingBottom: 14, gap: 6 },
  filterActive:  { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 99 },
  filterInactive: {
    paddingVertical: 9, paddingHorizontal: 18, borderRadius: 99,
    backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.borderFaint,
  },
  filterTxt: { fontSize: 13, fontWeight: "600", color: COLORS.tabInactive },

  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 6 },
  secTitle:  { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  secAction: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },

  postCard: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderFaint,
    borderRadius: 20, padding: 14, marginBottom: 14,
  },
  postAvatar:   { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  postUser:     { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  postMeta:     { fontSize: 10, color: COLORS.tabInactive, marginTop: 1 },
  postText:     { fontSize: 14, color: COLORS.textPrimary, lineHeight: 21, marginBottom: 10 },
  tagChip:      { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99, borderWidth: 1 },
  tagTxt:       { fontSize: 10, fontWeight: "700" },
  imgBlock: {
    height: 160, borderRadius: 12, overflow: "hidden",
    justifyContent: "flex-end", padding: 8, marginBottom: 2,
  },
  imgLabel: {
    alignSelf: "flex-start", borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 8, paddingVertical: 3,
  },
  postActions:  { flexDirection: "row", alignItems: "center", marginTop: 10 },
  actionBtn:    { flexDirection: "row", alignItems: "center", gap: 5, marginRight: 18 },
  actionTxt:    { fontSize: 12, color: COLORS.tabInactive, fontWeight: "600" },

  tipCard: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderFaint,
    borderRadius: 18, padding: 14, marginBottom: 10,
  },
  tipIcon:     { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipTitle:    { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 5, lineHeight: 20 },
  tipText:     { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
  tipAuthor:   { fontSize: 11, color: COLORS.tabInactive, fontWeight: "600" },
  tipReadTime: { fontSize: 11, color: COLORS.tabInactive },

  groupsRow: { paddingBottom: 4 },
  groupCard: {
    width: 170, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.borderFaint,
    borderRadius: 18, overflow: "hidden", marginRight: 10,
  },
  groupImg:     { height: 80, alignItems: "center", justifyContent: "center" },
  groupName:    { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  groupMembers: { fontSize: 11, color: COLORS.tabInactive, marginTop: 2 },

  profileCard: {
    backgroundColor: COLORS.card, borderRadius: 22,
    borderWidth: 1, borderColor: COLORS.borderFaint,
    padding: 16, marginBottom: 16,
  },
  profileAvatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
  },
  profileName: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  profileBio:  { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 99,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1, borderColor: COLORS.primary + "44",
  },
  statsRow:    { flexDirection: "row", alignItems: "center", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.borderFaint },
  statCell:    { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.borderFaint },
  statValue:   { fontSize: 20, fontWeight: "800", color: COLORS.textPrimary },
  statLabel:   { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontWeight: "600" },

  searchHint:   { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.5 },
  trendRow:     { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderFaint },
  trendIcon:    { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },

  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: COLORS.textSecondary, textAlign: "center", lineHeight: 20 },
});
