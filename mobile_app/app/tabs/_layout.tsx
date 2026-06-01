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
        {/* Orden: Mascota | Comunidad | Home (centro) | Mapa | PetIA */}
        <Tabs.Screen name="profile"   options={{ title: "Mascota"   }} />
        <Tabs.Screen name="community" options={{ title: "Comunidad" }} />
        <Tabs.Screen name="home"      options={{ title: "Inicio"    }} />
        <Tabs.Screen name="map"       options={{ title: "Mapa"      }} />
        <Tabs.Screen name="petia"     options={{ title: "PetIA"     }} />
      </Tabs>
      <FloatingActionButton />
    </View>
  );
}
