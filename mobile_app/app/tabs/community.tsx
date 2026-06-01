import React, { useState } from "react";
import {
  Dimensions, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../../src/Theme/colors";

const { width: SW } = Dimensions.get("window");
const MAG = "#E056C7";
const PRP = "#7B3FE4";
const CYN = "#4FC3F7";
const GRN = "#3DDC97";
const AMB = "#FFB547";

// ── Datos estáticos placeholder ───────────────────────────────────────────────
const STORIES = [
  { name: "Luna",   emoji: "🐱", hue: PRP,     hasNew: true  },
  { name: "Rocky",  emoji: "🐶", hue: MAG,     hasNew: true  },
  { name: "Mía",    emoji: "🐩", hue: CYN,     hasNew: false },
  { name: "Kiwi",   emoji: "🦜", hue: AMB,     hasNew: true  },
  { name: "Toby",   emoji: "🐕", hue: GRN,     hasNew: false },
  { name: "Nala",   emoji: "🐈", hue: "#FF6BD6", hasNew: true },
];

type Post = {
  id: number; user: string; pet: string; when: string;
  text: string; likes: number; comments: number;
  hue: string; tag: string; emoji: string;
  verified: boolean; inFeed: boolean;
};
const ALL_POSTS: Post[] = [
  {
    id: 1, user: "Laura M.", pet: "Rocky · Labrador", when: "12 min",
    text: "Primer día en el parque de la 93 🥹 miren esa cara de felicidad. ¿Alguien más va los domingos?",
    likes: 42, comments: 8, hue: MAG, tag: "Parques", emoji: "🐕", verified: false, inFeed: true,
  },
  {
    id: 2, user: "Dra. Camila R.", pet: "Veterinaria · Chapinero", when: "1 h",
    text: "Recordatorio: la desparasitación mensual es CLAVE en temporada de lluvias. Les dejo mi guía rápida ↓",
    likes: 128, comments: 24, hue: PRP, tag: "Salud", emoji: "🩺", verified: true, inFeed: false,
  },
  {
    id: 3, user: "Andrés V.", pet: "Mía · Poodle", when: "3 h",
    text: "Buscando recomendaciones de peluquería canina en Teusaquillo. Mía quedó hermosa la última vez 🐩",
    likes: 17, comments: 11, hue: CYN, tag: "Grooming", emoji: "🐩", verified: false, inFeed: true,
  },
  {
    id: 4, user: "Sara T.", pet: "Bolt · Beagle", when: "5 h",
    text: "Los beagles son TAN traviesos pero TAN amados 😅 hoy se comió mi audífono. ¡Cuéntenme sus historias!",
    likes: 89, comments: 34, hue: AMB, tag: "Vida pet", emoji: "🐶", verified: false, inFeed: true,
  },
  {
    id: 5, user: "PetVerse", pet: "Comunidad oficial", when: "1 d",
    text: "¡Semana de adopción! Esta semana publicaremos historias de mascotas que buscan hogar. ¿Los compartirías? 🏠",
    likes: 342, comments: 67, hue: GRN, tag: "Adopción", emoji: "🐾", verified: true, inFeed: false,
  },
];

const SUGGESTIONS = [
  { id: 1, name: "María L.",    info: "3 Golden Retrievers", followers: "1.2k", hue: MAG, emoji: "🐕" },
  { id: 2, name: "Dr. Arango",  info: "Veterinario UNAL",    followers: "4.8k", hue: CYN, emoji: "🩺" },
  { id: 3, name: "Casa Felina", info: "Refugio · Bogotá",    followers: "890",  hue: PRP, emoji: "🐱" },
  { id: 4, name: "Camilo P.",   info: "Bulldog Francés",     followers: "560",  hue: AMB, emoji: "🐶" },
];

type Tip = { id: number; title: string; category: string; readTime: string; color: string; author: string; emoji: string; text: string };
const TIPS: Tip[] = [
  {
    id: 1, title: "7 señales de que tu perro está ansioso",
    category: "Comportamiento", readTime: "3 min", color: PRP,
    author: "PetIA · Inteligencia artificial", emoji: "🧠",
    text: "Los perros no hablan, pero sus cuerpos dicen mucho. Aprende a leer el lenguaje corporal de tu mascota antes de que sea tarde...",
  },
  {
    id: 2, title: "Golden Retrievers: guía de alimentación por etapas",
    category: "Nutrición", readTime: "5 min", color: AMB,
    author: "Dra. Camila R. · Veterinaria", emoji: "🍗",
    text: "La nutrición de un Golden varía mucho entre cachorro, adulto y senior. Aquí un resumen completo con porciones y marcas recomendadas...",
  },
  {
    id: 3, title: "Cómo introducir un segundo gato en casa",
    category: "Convivencia", readTime: "4 min", color: CYN,
    author: "Sara T. · Usuaria", emoji: "🐱",
    text: "Después de tres intentos fallidos, encontré el método que funciona: cuarentena, intercambio de olores y presentación progresiva...",
  },
  {
    id: 4, title: "Primeros auxilios para mascotas: lo básico",
    category: "Salud", readTime: "6 min", color: GRN,
    author: "PetVerse · Equipo editorial", emoji: "🏥",
    text: "¿Sabes qué hacer si tu mascota se atraganta o tiene una convulsión? Este artículo puede salvar vidas. Compártelo con tu familia...",
  },
  {
    id: 5, title: "Razas más activas para apartamento pequeño",
    category: "Razas", readTime: "4 min", color: MAG,
    author: "PetIA · Inteligencia artificial", emoji: "🏠",
    text: "Contrario a lo que muchos creen, no necesitas una casa grande para tener un perro activo. Estas razas se adaptan perfecto...",
  },
];

const GROUPS = [
  { name: "Golden Retrievers CO",  members: "2.4k", hue: MAG, emoji: "🐕" },
  { name: "Gatos de apartamento",  members: "890",  hue: PRP, emoji: "🐱" },
  { name: "Adopción responsable",  members: "5.1k", hue: CYN, emoji: "🐾" },
  { name: "Nutrición canina",      members: "1.1k", hue: GRN, emoji: "🥗" },
];

type Filter = "parati" | "feed" | "todos" | "consejos";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "parati",   label: "Para ti"  },
  { id: "feed",     label: "Feed"     },
  { id: "todos",    label: "Todos"    },
  { id: "consejos", label: "Consejos" },
];

// ── Componentes menores ───────────────────────────────────────────────────────

// Placeholder visual de imagen en posts
function ImgBlock({ hue, label }: { hue: string; label: string }) {
  // Elige par de colores según hue
  const dark = hue + "22";
  return (
    <LinearGradient
      colors={["#1a0e3e", hue + "55"]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={s.imgBlock}
    >
      <View style={{ position: "absolute", inset: 0, opacity: 0.12 } as any}>
        {/* stripes simuladas */}
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

// Tarjeta de post
function PostCard({ post, onLike }: { post: Post; onLike: (id: number) => void }) {
  return (
    <View style={s.postCard}>
      {/* Cabecera */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <LinearGradient
          colors={[post.hue, "#2a1560"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.postAvatar}
        >
          <Text style={{ fontSize: 18 }}>{post.emoji}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={s.postUser}>{post.user}</Text>
            {post.verified && (
              <Ionicons name="checkmark-circle" size={13} color={CYN} />
            )}
          </View>
          <Text style={s.postMeta}>{post.pet} · hace {post.when}</Text>
        </View>
        <View style={[s.tagChip, { borderColor: post.hue + "55", backgroundColor: post.hue + "18" }]}>
          <Text style={[s.tagTxt, { color: post.hue }]}>{post.tag}</Text>
        </View>
      </View>

      {/* Texto */}
      <Text style={s.postText}>{post.text}</Text>

      {/* Imagen placeholder */}
      <ImgBlock hue={post.hue} label={post.tag} />

      {/* Acciones */}
      <View style={s.postActions}>
        <TouchableOpacity style={s.actionBtn} onPress={() => onLike(post.id)} activeOpacity={0.75}>
          <Ionicons name="heart-outline" size={18} color={COLORS.tabInactive} />
          <Text style={s.actionTxt}>{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} activeOpacity={0.75}>
          <Ionicons name="chatbubble-outline" size={17} color={COLORS.tabInactive} />
          <Text style={s.actionTxt}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { marginLeft: "auto" }]} activeOpacity={0.75}>
          <Ionicons name="paper-plane-outline" size={17} color={COLORS.tabInactive} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Tarjeta de consejo
function TipCard({ tip }: { tip: Tip }) {
  return (
    <View style={s.tipCard}>
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
            <Text style={s.tipReadTime}>· {tip.readTime} lectura</Text>
          </View>
          <Text style={s.tipTitle}>{tip.title}</Text>
          <Text style={s.tipText} numberOfLines={2}>{tip.text}</Text>
          <Text style={s.tipAuthor}>{tip.author}</Text>
        </View>
      </View>
    </View>
  );
}

// Tarjeta de perfil sugerido
function SuggestionCard({ sug, onFollow }: { sug: typeof SUGGESTIONS[0]; onFollow: () => void }) {
  const [following, setFollowing] = useState(false);
  return (
    <View style={s.sugCard}>
      <LinearGradient
        colors={[sug.hue, sug.hue + "55"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.sugAvatar}
      >
        <Text style={{ fontSize: 26 }}>{sug.emoji}</Text>
      </LinearGradient>
      <Text style={s.sugName} numberOfLines={1}>{sug.name}</Text>
      <Text style={s.sugInfo} numberOfLines={1}>{sug.info}</Text>
      <Text style={s.sugFollowers}>{sug.followers} seguidores</Text>
      <TouchableOpacity
        style={{ borderRadius: 99, overflow: "hidden", marginTop: 10 }}
        onPress={() => { setFollowing(f => !f); onFollow(); }}
        activeOpacity={0.8}
      >
        {following ? (
          <View style={[s.followBtn, { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }]}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: "700" }}>Siguiendo</Text>
          </View>
        ) : (
          <LinearGradient colors={[MAG, PRP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.followBtn}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Seguir</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const [filter, setFilter]         = useState<Filter>("parati");
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery]           = useState("");
  const [likes, setLikes]           = useState<Record<number, boolean>>({});
  const [notifCount]                = useState(3);

  const toggleLike = (id: number) =>
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  const visiblePosts =
    filter === "feed"  ? ALL_POSTS.filter(p => p.inFeed) :
    filter === "parati"? ALL_POSTS.slice(0, 3) :
    ALL_POSTS;

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
              placeholder="Buscar personas, mascotas, consejos…"
              placeholderTextColor={COLORS.tabInactive}
              style={s.searchInput}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setQuery(""); }}>
              <Text style={{ color: MAG, fontWeight: "700", fontSize: 13 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerSub}>COMUNIDAD PETVERSE</Text>
              <Text style={s.headerTitle}>
                Feed <Text style={{ color: MAG }}>pet</Text>
              </Text>
            </View>
            <TouchableOpacity style={s.iconBtn} onPress={() => setShowSearch(true)} activeOpacity={0.75}>
              <Ionicons name="search" size={18} color="#fff" />
            </TouchableOpacity>
            <View style={{ position: "relative", marginLeft: 6 }}>
              <TouchableOpacity style={s.iconBtn} activeOpacity={0.75}>
                <Ionicons name="notifications-outline" size={18} color="#fff" />
              </TouchableOpacity>
              {notifCount > 0 && (
                <View style={s.notifBadge}>
                  <Text style={s.notifTxt}>{notifCount}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Stories ─────────────────────────────────────────────────────── */}
        {!showSearch && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.storiesRow}
          >
            {/* Tu story */}
            <View style={s.storyWrap}>
              <View style={s.myStory}>
                <Ionicons name="add" size={22} color={COLORS.tabInactive} />
              </View>
              <Text style={s.storyName}>Tu story</Text>
            </View>

            {/* Stories de amigos */}
            {STORIES.map(story => (
              <TouchableOpacity key={story.name} style={s.storyWrap} activeOpacity={0.85}>
                {story.hasNew ? (
                  <LinearGradient
                    colors={[MAG, PRP, CYN, MAG]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.storyRing}
                  >
                    <View style={[s.storyInner, { backgroundColor: story.hue }]}>
                      <Text style={{ fontSize: 26 }}>{story.emoji}</Text>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={[s.storyRingGray]}>
                    <View style={[s.storyInner, { backgroundColor: story.hue }]}>
                      <Text style={{ fontSize: 26 }}>{story.emoji}</Text>
                    </View>
                  </View>
                )}
                <Text style={s.storyName}>{story.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Filtros ──────────────────────────────────────────────────────── */}
        {!showSearch && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtersRow}
          >
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={{ borderRadius: 99, overflow: "hidden" }}
                activeOpacity={0.75}
              >
                {filter === f.id ? (
                  <LinearGradient
                    colors={[MAG, PRP]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.filterActive}
                  >
                    <Text style={[s.filterTxt, { color: "#fff" }]}>{f.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={s.filterInactive}>
                    <Text style={s.filterTxt}>{f.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Contenido: PARA TI ───────────────────────────────────────────── */}
        {!showSearch && filter === "parati" && (
          <View>
            {/* Sugerencias de perfiles */}
            <View style={s.secHeader}>
              <Text style={s.secTitle}>Sugerencias para ti</Text>
              <Text style={s.secAction}>Ver más</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.sugRow}
            >
              {SUGGESTIONS.map(sug => (
                <SuggestionCard key={sug.id} sug={sug} onFollow={() => {}} />
              ))}
            </ScrollView>

            {/* Posts recomendados */}
            <View style={s.secHeader}>
              <Text style={s.secTitle}>Recomendado</Text>
            </View>
            {visiblePosts.map(post => (
              <PostCard key={post.id} post={{ ...post, likes: post.likes + (likes[post.id] ? 1 : 0) }} onLike={toggleLike} />
            ))}
          </View>
        )}

        {/* ── Contenido: FEED ──────────────────────────────────────────────── */}
        {!showSearch && filter === "feed" && (
          <View>
            {visiblePosts.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 32, marginBottom: 10 }}>🐾</Text>
                <Text style={s.emptyTitle}>Tu feed está vacío</Text>
                <Text style={s.emptySub}>Sigue a personas para ver sus publicaciones aquí.</Text>
              </View>
            ) : (
              visiblePosts.map(post => (
                <PostCard key={post.id} post={{ ...post, likes: post.likes + (likes[post.id] ? 1 : 0) }} onLike={toggleLike} />
              ))
            )}
          </View>
        )}

        {/* ── Contenido: TODOS ─────────────────────────────────────────────── */}
        {!showSearch && filter === "todos" && (
          <View>
            {ALL_POSTS.map(post => (
              <PostCard key={post.id} post={{ ...post, likes: post.likes + (likes[post.id] ? 1 : 0) }} onLike={toggleLike} />
            ))}
          </View>
        )}

        {/* ── Contenido: CONSEJOS ──────────────────────────────────────────── */}
        {!showSearch && filter === "consejos" && (
          <View>
            <View style={s.secHeader}>
              <Text style={s.secTitle}>Consejos y guías</Text>
              <View style={[s.tagChip, { borderColor: `${PRP}55`, backgroundColor: `${PRP}18` }]}>
                <Text style={[s.tagTxt, { color: PRP }]}>IA + usuarios</Text>
              </View>
            </View>
            {TIPS.map(tip => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </View>
        )}

        {/* ── Grupos para ti (siempre visible, excepto buscando) ───────────── */}
        {!showSearch && filter !== "consejos" && (
          <View>
            <View style={s.secHeader}>
              <Text style={s.secTitle}>Grupos para ti</Text>
              <Text style={s.secAction}>Ver todos</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.groupsRow}
            >
              {GROUPS.map(g => (
                <TouchableOpacity key={g.name} style={s.groupCard} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[g.hue, "#1a0e3e"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.groupImg}
                  >
                    <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                  </LinearGradient>
                  <View style={{ padding: 10 }}>
                    <Text style={s.groupName} numberOfLines={2}>{g.name}</Text>
                    <Text style={s.groupMembers}>{g.members} miembros</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Vista de búsqueda ────────────────────────────────────────────── */}
        {showSearch && (
          <View>
            {query.trim() === "" ? (
              <View>
                <Text style={s.searchHint}>Tendencias</Text>
                {["#GoldenRetriever", "#AdopciónBogotá", "#GatosDeApartamento", "#NutriciónCanina"].map(tag => (
                  <TouchableOpacity key={tag} style={s.trendRow} activeOpacity={0.75}>
                    <View style={[s.trendIcon, { backgroundColor: `${MAG}22` }]}>
                      <Ionicons name="trending-up" size={15} color={MAG} />
                    </View>
                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{tag}</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.tabInactive} style={{ marginLeft: "auto" }} />
                  </TouchableOpacity>
                ))}
                <Text style={[s.searchHint, { marginTop: 18 }]}>Perfiles sugeridos</Text>
                {SUGGESTIONS.slice(0, 3).map(sug => (
                  <TouchableOpacity key={sug.id} style={s.searchResultRow} activeOpacity={0.75}>
                    <LinearGradient colors={[sug.hue, sug.hue + "55"]} style={s.searchResultAvatar}>
                      <Text style={{ fontSize: 20 }}>{sug.emoji}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>{sug.name}</Text>
                      <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>{sug.info}</Text>
                    </View>
                    <Text style={{ color: MAG, fontSize: 12, fontWeight: "700" }}>Seguir</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 32, marginBottom: 10 }}>🔍</Text>
                <Text style={s.emptyTitle}>Buscando "{query}"</Text>
                <Text style={s.emptySub}>Los resultados de búsqueda se conectarán al backend.</Text>
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
  root:   { flex: 1, backgroundColor: COLORS.bgDark },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },

  // Header
  header:    { flexDirection: "row", alignItems: "center", paddingTop: 6, paddingBottom: 10 },
  headerSub: { fontSize: 11, color: COLORS.tabInactive, letterSpacing: 1, textTransform: "uppercase", fontWeight: "600" },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  notifBadge: {
    position: "absolute", top: 2, right: 2,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: "#ff6b6b", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifTxt: { color: "#fff", fontSize: 9, fontWeight: "800" },

  // Search bar
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    marginTop: 6, marginBottom: 14,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 14 },

  // Stories
  storiesRow: { paddingVertical: 4, marginBottom: 14 },
  storyWrap:  { alignItems: "center", marginRight: 14 },
  myStory: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.15)",
    borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  storyRing: {
    width: 64, height: 64, borderRadius: 32, padding: 2,
    alignItems: "center", justifyContent: "center",
  },
  storyRingGray: {
    width: 64, height: 64, borderRadius: 32, padding: 2,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  storyInner: {
    width: "100%", height: "100%", borderRadius: 30,
    alignItems: "center", justifyContent: "center",
  },
  storyName: { fontSize: 10, color: "#fff", marginTop: 5, fontWeight: "500", maxWidth: 60, textAlign: "center" },

  // Filters
  filtersRow:    { paddingBottom: 14, gap: 6 },
  filterActive:  { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99 },
  filterInactive: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  filterTxt: { fontSize: 13, fontWeight: "600", color: COLORS.tabInactive },

  // Section header
  secHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 6 },
  secTitle:  { fontSize: 16, fontWeight: "700", color: "#fff" },
  secAction: { fontSize: 13, color: MAG, fontWeight: "600" },

  // Post card
  postCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20, padding: 14, marginBottom: 14,
  },
  postAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  postUser:   { fontSize: 13, fontWeight: "700", color: "#fff" },
  postMeta:   { fontSize: 10, color: COLORS.tabInactive, marginTop: 1 },
  postText:   { fontSize: 14, color: "#fff", lineHeight: 21, marginBottom: 10 },
  tagChip: {
    paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99,
    borderWidth: 1,
  },
  tagTxt: { fontSize: 10, fontWeight: "700" },
  imgBlock: {
    height: 160, borderRadius: 12, overflow: "hidden",
    justifyContent: "flex-end", padding: 8, marginBottom: 2,
  },
  imgLabel: {
    alignSelf: "flex-start", borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 8, paddingVertical: 3,
  },
  postActions: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  actionBtn:   { flexDirection: "row", alignItems: "center", gap: 5, marginRight: 18 },
  actionTxt:   { fontSize: 12, color: COLORS.tabInactive, fontWeight: "600" },

  // Tip card
  tipCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18, padding: 14, marginBottom: 10,
  },
  tipIcon:     { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipTitle:    { fontSize: 15, fontWeight: "700", color: "#fff", marginBottom: 5, lineHeight: 20 },
  tipText:     { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
  tipAuthor:   { fontSize: 11, color: COLORS.tabInactive, fontWeight: "600" },
  tipReadTime: { fontSize: 11, color: COLORS.tabInactive },

  // Suggestion card
  sugRow:  { paddingBottom: 4 },
  sugCard: {
    width: 140,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18, padding: 14,
    alignItems: "center", marginRight: 10,
  },
  sugAvatar:    { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  sugName:      { fontSize: 13, fontWeight: "700", color: "#fff", textAlign: "center" },
  sugInfo:      { fontSize: 11, color: COLORS.textSecondary, textAlign: "center", marginTop: 2 },
  sugFollowers: { fontSize: 11, color: COLORS.tabInactive, marginTop: 2, textAlign: "center" },
  followBtn:    { paddingVertical: 7, paddingHorizontal: 20, borderRadius: 99, alignItems: "center" },

  // Groups
  groupsRow: { paddingBottom: 4 },
  groupCard: {
    width: 170,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18, overflow: "hidden", marginRight: 10,
  },
  groupImg:     { height: 80, alignItems: "center", justifyContent: "center" },
  groupName:    { fontSize: 13, fontWeight: "700", color: "#fff" },
  groupMembers: { fontSize: 11, color: COLORS.tabInactive, marginTop: 2 },

  // Search results
  searchHint:       { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.5 },
  trendRow:         { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  trendIcon:        { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  searchResultRow:  { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  searchResultAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#fff", marginBottom: 6 },
  emptySub:   { fontSize: 13, color: COLORS.textSecondary, textAlign: "center", lineHeight: 20 },
});
