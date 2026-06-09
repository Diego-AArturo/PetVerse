import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../Theme/colors";

type TabDef = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  center?: boolean;
};

const TABS: TabDef[] = [
  { name: "profile",   icon: "paw-outline",      activeIcon: "paw",      labelKey: "tabs.pets"       },
  { name: "community", icon: "people-outline",    activeIcon: "people",   labelKey: "tabs.community"  },
  { name: "home",      icon: "home",              activeIcon: "home",     labelKey: "",   center: true },
  { name: "map",       icon: "map-outline",       activeIcon: "map",      labelKey: "tabs.map"        },
  { name: "petia",     icon: "sparkles-outline",  activeIcon: "sparkles", labelKey: "tabs.petia"      },
];

const BAR_H   = 64;
const CTR_SZ  = 58;
const CTR_RISE = 16;

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const press = (route: typeof state.routes[0], isActive: boolean) => () => {
    const ev = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!isActive && !ev.defaultPrevented) navigation.navigate(route.name);
  };

  const leftRoutes  = state.routes.slice(0, 2);
  const centerRoute = state.routes[2];
  const rightRoutes = state.routes.slice(3);

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 10 }]}>
      <View style={styles.bar}>
        {leftRoutes.map((route, i) => {
          const tab = TABS[i];
          const active = state.index === i;
          return (
            <TouchableOpacity key={route.key} onPress={press(route, active)} style={styles.tab} activeOpacity={0.75}>
              <Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={active ? COLORS.primary : COLORS.tabInactive} />
              <Text style={[styles.label, { color: active ? COLORS.primary : COLORS.tabInactive }]}>{t(tab.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.centerGap} />

        {rightRoutes.map((route, i) => {
          const tab = TABS[3 + i];
          const active = state.index === 3 + i;
          return (
            <TouchableOpacity key={route.key} onPress={press(route, active)} style={styles.tab} activeOpacity={0.75}>
              <Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={active ? COLORS.primary : COLORS.tabInactive} />
              <Text style={[styles.label, { color: active ? COLORS.primary : COLORS.tabInactive }]}>{t(tab.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.centerContainer} pointerEvents="box-none">
        <TouchableOpacity onPress={press(centerRoute, state.index === 2)} activeOpacity={0.85}>
          <LinearGradient
            colors={[COLORS.accentMagenta, COLORS.accentPurple, COLORS.accentCyan]}
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
    borderColor: COLORS.borderFaint,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 20,
  },
});
