import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../Theme/colors";

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  profile: "paw-outline",
  community: "people-outline",
  map: "map-outline",
  services: "bag-handle-outline",
};

// const labelMap: Record<string, string> = {
//   home: "Inicio",
//   profile: "Mascotas",
//   community: "Comunidad",
//   map: "Mapa",
//   services: "Servicios",
// };

export default function BottomNav({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.navWrapper}>
      <View style={styles.navBar}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const iconName = iconMap[route.name] ?? "ellipse-outline";
          // const label = labelMap[route.name] ?? route.name;
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.9}
            >
              {isActive ? (
                <LinearGradient
                  colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeBubble}
                >
                  <Ionicons name={iconName} size={20} color={COLORS.textPrimary} />
                  {/* <Text style={styles.activeLabel}>{label}</Text> */}
                </LinearGradient>
              ) : (
                <View style={styles.inactiveBubble}>
                  <Ionicons name={iconName} size={20} color={COLORS.tabInactive} />
                  {/* <Text style={styles.inactiveLabel}>{label}</Text> */}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    backgroundColor: "transparent",
  },
  navBar: {
    flexDirection: "row",
    backgroundColor: COLORS.navBackground,
    marginHorizontal: 16,
    marginBottom: 14,
    marginTop: 4,
    borderRadius: 18,
    paddingVertical: 8,
    justifyContent: "space-around",
    shadowColor: COLORS.shadowStrong,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  activeBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  inactiveBubble: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
  },
  activeLabel: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 12,
  },
  inactiveLabel: {
    color: COLORS.tabInactive,
    fontSize: 12,
    fontWeight: "600",
  },
});
