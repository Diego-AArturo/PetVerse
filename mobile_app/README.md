# PetVerse Mobile App 🐾

Aplicación móvil para la gestión de mascotas construida con [Expo](https://expo.dev) y React Native.

## Comenzar

1. Instalar dependencias

   ```bash
   npm install
   ```

2. Iniciar la app

   ```bash
   npx expo start
   ```

En la consola encontrarás opciones para abrir la app en:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), sandbox limitado para pruebas rápidas

## Nota sobre Expo Go

Para pruebas locales con Expo Go, la autenticación con Google está temporalmente comentada en `app/login.tsx` y `app/register.tsx`. Reactiva esas líneas para producción o al usar un development build.

## Arquitectura del proyecto

```
mobile_app/
├── app/                      # Rutas y pantallas (file-based routing)
│   ├── _layout.tsx           # Layout raíz, inicializa i18n
│   ├── index.tsx             # Redirige a login
│   ├── login.tsx             # Pantalla de inicio de sesión
│   ├── register.tsx          # Pantalla de registro
│   └── tabs/                 # Navegación por pestañas
│       ├── _layout.tsx       # Configuración de tabs
│       ├── home.tsx          # Dashboard principal
│       ├── profile.tsx       # Perfil de mascotas
│       ├── community.tsx     # Feed de comunidad
│       ├── map.tsx           # Mapa de servicios
│       └── services.tsx      # Reservas de servicios
├── src/                      # Lógica de negocio y utilidades
│   ├── components/           # Componentes reutilizables
│   │   ├── auth/             # Componentes de autenticación
│   │   └── layout/           # BottomNav, FloatingActionButton
│   ├── data/                 # Capa de datos
│   │   ├── authService.ts    # Login, registro, restaurar sesión
│   │   ├── userService.ts    # Perfil de usuario
│   │   ├── petService.ts     # CRUD de mascotas
│   │   ├── httpClient.ts     # Cliente HTTP base
│   │   ├── tokenStorage.ts   # Almacenamiento seguro de tokens
│   │   ├── config.ts         # URL base y configuración
│   │   └── model/            # Tipos TypeScript
│   │       ├── auth.ts
│   │       ├── user.ts
│   │       └── pet.ts
│   ├── i18n/                 # Internacionalización
│   │   ├── index.ts          # Configuración de i18next
│   │   └── i18next.d.ts      # Tipos para autocompletado
│   └── Theme/
│       └── colors.ts         # Paleta de colores
├── public/
│   └── locales/              # Archivos de traducción
│       └── es/
│           └── translation.json
└── assets/
    └── images/               # Imágenes y logos
```

### `app/` - Rutas y UI
- **File-based routing** con `expo-router`
- El layout raíz (`_layout.tsx`) inicializa i18next importando `../src/i18n`
- Pantallas de autenticación: `login.tsx` y `register.tsx`
- Navegación por tabs en `tabs/_layout.tsx` con 5 pestañas principales

### `src/components/` - Componentes UI
- `layout/BottomNav.tsx` - Barra de navegación inferior personalizada
- `layout/FloatingActionButton.tsx` - Botón flotante para agregar mascotas
- `auth/auth_google.tsx` - Botón de autenticación con Google

### `src/data/` - Capa de datos
- **authService.ts** - Maneja login, registro y restauración de sesión
- **userService.ts** - Obtiene perfil del usuario
- **petService.ts** - CRUD completo de mascotas
- **httpClient.ts** - Cliente HTTP con interceptores y manejo de errores
- **tokenStorage.ts** - Almacenamiento seguro con expo-secure-store
- **config.ts** - Resolución de URL base del API

### `src/Theme/` - Estilos globales
- `colors.ts` - Paleta de colores consistente para toda la app

---

## Internacionalización (i18n)

La app usa [react-i18next](https://react.i18next.com/) para el manejo de traducciones.

### Estructura de traducciones

Las traducciones están organizadas por módulo en `public/locales/{idioma}/translation.json`:

```json
{
  "common": {
    "appName": "PetVerse",
    "loading": "Cargando...",
    "retry": "Reintentar",
    "save": "Guardar",
    ...
  },
  "tabs": {
    "home": "Inicio",
    "pets": "Mascotas",
    ...
  },
  "auth": {
    "login": { ... },
    "register": { ... }
  },
  "home": { ... },
  "community": { ... },
  "map": { ... },
  "services": { ... },
  "profile": { ... }
}
```

### Uso en componentes

```tsx
import { useTranslation } from "react-i18next";

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Text>{t("common.appName")}</Text>
    <Text>{t("home.pets.keepVaccinesUpToDate", { name: "Max" })}</Text>
  );
}
```

### Agregar un nuevo idioma

1. **Crear el archivo de traducción:**
   ```
   public/locales/{codigo-idioma}/translation.json
   ```
   Por ejemplo, para inglés: `public/locales/en/translation.json`

2. **Copiar la estructura** de `public/locales/es/translation.json` y traducir los valores

3. **Registrar el idioma** en `src/i18n/index.ts`:
   ```ts
   import i18n from "i18next";
   import { initReactI18next } from "react-i18next";
   import es from "../../public/locales/es/translation.json";
   import en from "../../public/locales/en/translation.json"; // Nuevo

   const resources = {
     es: { translation: es },
     en: { translation: en }, // Nuevo
   };

   i18n.use(initReactI18next).init({
     resources,
     lng: "es", // Idioma por defecto
     fallbackLng: "es",
     // ...
   });
   ```

4. **Actualizar tipos** (opcional pero recomendado) en `src/i18n/i18next.d.ts` si necesitas autocompletado específico para el nuevo idioma.

### Cambiar idioma en runtime

```ts
import i18n from "../src/i18n";

// Cambiar a inglés
i18n.changeLanguage("en");

// Obtener idioma actual
const currentLang = i18n.language;
```

---

## Reiniciar proyecto

Para empezar desde cero:

```bash
npm run reset-project
```

Este comando moverá el código actual a **app-example** y creará un directorio **app** vacío.

## Recursos

- [Documentación de Expo](https://docs.expo.dev/)
- [Tutorial de Expo](https://docs.expo.dev/tutorial/introduction/)
- [react-i18next docs](https://react.i18next.com/)

## Comunidad

- [Expo en GitHub](https://github.com/expo/expo)
- [Discord de Expo](https://chat.expo.dev)

---

**SHA1 Android:** `2C:62:2C:4F:86:98:56:90:0F:06:2D:E8:26:F6:5A:F4:28:C1:D8:6A`
