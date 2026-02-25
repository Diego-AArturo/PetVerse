import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "../../public/locales/es/translation.json";

// Definir los recursos de traducción
const resources = {
  es: {
    translation: es,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es", // Idioma por defecto
  fallbackLng: "es",
  compatibilityJSON: "v4", // Requerido para React Native

  interpolation: {
    escapeValue: false, // React ya escapa los valores
  },

  // Configuración adicional para mejor rendimiento
  react: {
    useSuspense: false, // Deshabilitamos Suspense para React Native
  },
});

export default i18n;
