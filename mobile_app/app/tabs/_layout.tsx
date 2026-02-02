// app/tabs/_layout.tsx
import { Tabs } from "expo-router";
import { View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import BottomNav from "../../src/components/layout/BottomNav";
import FloatingActionButton from "../../src/components/layout/FloatingActionButton";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props: BottomTabBarProps) => <BottomNav {...props} />}
      >
        <Tabs.Screen name="home" options={{ title: "Inicio" }} />
        <Tabs.Screen name="profile" options={{ title: "Mascotas" }} />
        <Tabs.Screen name="community" options={{ title: "Comunidad" }} />
        <Tabs.Screen name="map" options={{ title: "Mapa" }} />
        <Tabs.Screen name="services" options={{ title: "Servicios" }} />
      </Tabs>
      <FloatingActionButton />
    </View>
  );
}
