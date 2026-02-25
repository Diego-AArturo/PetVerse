// app/tabs/_layout.tsx
import { Tabs } from "expo-router";
import { View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import BottomNav from "../../src/components/layout/BottomNav";
import FloatingActionButton from "../../src/components/layout/FloatingActionButton";

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props: BottomTabBarProps) => <BottomNav {...props} />}
      >
        <Tabs.Screen name="home" options={{ title: t("tabs.home") }} />
        <Tabs.Screen name="profile" options={{ title: t("tabs.pets") }} />
        <Tabs.Screen name="community" options={{ title: t("tabs.community") }} />
        <Tabs.Screen name="map" options={{ title: t("tabs.map") }} />
        <Tabs.Screen name="services" options={{ title: t("tabs.services") }} />
      </Tabs>
      <FloatingActionButton />
    </View>
  );
}
