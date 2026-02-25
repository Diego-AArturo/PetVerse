// app/_layout.tsx
import { Stack } from "expo-router";
import { COLORS } from "../src/Theme/colors";
import "../src/i18n"; // Inicializar i18next

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bgDark },
      }}
    />
  );
}

