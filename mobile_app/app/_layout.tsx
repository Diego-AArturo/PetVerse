// app/_layout.tsx
import { Stack } from "expo-router";
import { COLORS } from "../src/Theme/colors";

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

