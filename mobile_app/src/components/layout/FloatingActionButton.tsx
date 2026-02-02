import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../Theme/colors";
import { useRouter } from "expo-router";

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actions = [
    {
      label: "Agregar mascota",
      icon: "paw" as const,
      onPress: () => router.push("/tabs/profile?add=1" as any),
    },
    { label: "Crear post", icon: "image-outline" as const, onPress: () => {} },
    { label: "Reservar servicio", icon: "calendar-outline" as const, onPress: () => {} },
  ];

  return (
    <View style={styles.container} pointerEvents="box-none">
      {isOpen && (
        <View style={styles.menu}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.action}
              activeOpacity={0.9}
              onPress={() => {
                action.onPress?.();
                setIsOpen(false);
              }}
            >
              <Ionicons name={action.icon} size={18} color={COLORS.textPrimary} />
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, isOpen && styles.fabOpen]}
        activeOpacity={0.9}
        onPress={() => setIsOpen((v) => !v)}
      >
        <Ionicons name="add" size={28} color={COLORS.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    right: 20,
    alignItems: "flex-end",
  },
  menu: {
    marginBottom: 12,
    gap: 8,
    width: 190,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderFaint,
  },
  actionText: { color: COLORS.textPrimary, fontWeight: "700" },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: COLORS.cardBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.shadowStrong,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  fabOpen: { transform: [{ rotate: "45deg" }] },
});

export default FloatingActionButton;
