import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../Theme/colors";

type TabDef = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  center?: boolean;
};

const TABS: TabDef[] = [
  { name: "profile",   icon: "paw-outline",      activeIcon: "paw",      label: "Mascota"   },
  { name: "community", icon: "people-outline",    activeIcon: "people",   label: "Comunidad" },
  { name: "home",      icon: "home",              activeIcon: "home",     label: "",   center: true },
  { name: "map",       icon: "map-outline",       activeIcon: "map",      label: "Mapa"      },
  { name: "petia",     icon: "sparkles-outline",  activeIcon: "sparkles", label: "PetIA"     },
];

const BAR_H   = 64;
const CTR_SZ  = 58;
const CTR_RISE = 16; // px que el botón asoma sobre la barra

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const press = (route: typeof state.routes[0], isActive: boolean) => () => {
    const ev = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!isActive && !ev.defaultPrevented) navigation.navigate(route.name);
  };

  const leftRoutes  = state.routes.slice(0, 2);
  const centerRoute = state.routes[2];
  const rightRoutes = state.routes.slice(3);

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 10 }]}>
      {/* Barra de fondo */}
      <View style={styles.bar}>
        {/* Tabs izquierdas */}
        {leftRoutes.map((route, i) => {
          const tab = TABS[i];
          const active = state.index === i;
          return (
            <TouchableOpacity key={route.key} onPress={press(route, active)} style={styles.tab} activeOpacity={0.75}>
              <Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={active ? "#fff" : COLORS.tabInactive} />
              <Text style={[styles.label, { color: active ? "#fff" : COLORS.tabInactive }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Espacio central */}
        <View style={styles.centerGap} />

        {/* Tabs derechas */}
        {rightRoutes.map((route, i) => {
          const tab = TABS[3 + i];
          const active = state.index === 3 + i;
          return (
            <TouchableOpacity key={route.key} onPress={press(route, active)} style={styles.tab} activeOpacity={0.75}>
              <Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={active ? "#fff" : COLORS.tabInactive} />
              <Text style={[styles.label, { color: active ? "#fff" : COLORS.tabInactive }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botón central elevado — renderizado después para quedar encima */}
      <View style={styles.centerContainer} pointerEvents="box-none">
        <TouchableOpacity onPress={press(centerRoute, state.index === 2)} activeOpacity={0.85}>
          <LinearGradient
            colors={["#E056C7", "#7B3FE4", "#4FC3F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerBtn}
          >
            <Ionicons name="home" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "transparent",
    position: "relative",
  },

  bar: {
    flexDirection: "row",
    backgroundColor: COLORS.navBackground,
    marginHorizontal: 16,
    marginTop: CTR_RISE,
    borderRadius: 22,
    height: BAR_H,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
  },

  centerGap: {
    flex: 1.2,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
  },

  centerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
    elevation: 20,
  },

  centerBtn: {
    width: CTR_SZ,
    height: CTR_SZ,
    borderRadius: CTR_SZ / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.navBackground,
    shadowColor: "#E056C7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 20,
  },
});
