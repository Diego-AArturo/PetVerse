// src/Theme/colors.ts — Paleta centralizada PetVerse
export const COLORS = {
  // ── Fondos ────────────────────────────────────────────────────────────────
  bg:           "#F5F0FE",
  bgAlt:        "#ECE4FA",
  bgDark:       "#F5F0FE",

  // ── Superficies / tarjetas ────────────────────────────────────────────────
  card:         "#FFFFFF",
  surface:      "#FFFFFF",
  surfaceAlt:   "#F8F5FF",

  // ── Marca principal ───────────────────────────────────────────────────────
  primary:      "#6C3DD9",
  primaryDark:  "#5226B8",
  primaryLight: "#E4D7FB",

  // ── Acentos con alias semántico (usar estos en las tabs) ──────────────────
  accentMagenta: "#E056C7",   // magenta · gradientes, highlights
  accentPurple:  "#7B3FE4",   // morado vibrante · cards, chat
  accentCyan:    "#4FC3F7",   // cyan · links, verified
  accentGreen:   "#3DDC97",   // verde vibrante · salud, online
  accentAmber:   "#FFB547",   // ámbar · medicamentos, advertencias suaves
  accentWarn:    "#FF9A3C",   // naranja · advertencias más fuertes

  // ── Alias legacy (mantener para compatibilidad con map.tsx) ───────────────
  gradientStart: "#E056C7",
  gradientEnd:   "#4FC3F7",
  cardPurple:    "#7B3FE4",
  cardBlue:      "#4FC3F7",

  // ── Texto ─────────────────────────────────────────────────────────────────
  textPrimary:   "#1B143A",
  textSecondary: "#6E6796",

  // ── Navegación ────────────────────────────────────────────────────────────
  tabInactive:   "#8C84B8",
  navBackground: "#FFFFFF",

  // ── Bordes ────────────────────────────────────────────────────────────────
  borderFaint:   "rgba(27,20,58,0.08)",
  borderMed:     "rgba(27,20,58,0.14)",

  // ── Estados de salud (carnet) ─────────────────────────────────────────────
  statusOkBg:        "rgba(168,213,186,0.4)",
  statusOkText:      "#2C7A4F",
  statusPendingBg:   "rgba(242,196,106,0.4)",
  statusPendingText: "#B47A1C",
  statusOverdueBg:   "rgba(224,120,86,0.28)",
  statusOverdueText: "#C66344",

  // ── Acentos de línea de tiempo ────────────────────────────────────────────
  timelineGreen:       "#A8D5BA",
  timelineMustard:     "#F2C46A",
  timelinePurpleLight: "#C9A8FF",
  timelinePurple:      "#9B7FE8",

  // ── Paleta adicional ──────────────────────────────────────────────────────
  mustard:   "#F2C46A",
  mint:      "#B0DFD0",
  badgeRed:  "#FF6B6B",

  // ── Feedback visual ───────────────────────────────────────────────────────
  errorLight:   "#ffb4b4",
  successLight: "#bfffdc",
  errorBg:      "rgba(255,107,107,0.1)",
  errorBorder:  "rgba(255,107,107,0.25)",

  // ── Superposiciones ───────────────────────────────────────────────────────
  overlayModal: "rgba(10,5,32,0.55)",
  overlayDark:  "rgba(0,0,0,0.3)",

  // ── Sombras ───────────────────────────────────────────────────────────────
  shadowStrong: "rgba(108,61,217,0.15)",
};
