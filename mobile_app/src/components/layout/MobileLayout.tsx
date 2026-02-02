import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import FloatingActionButton from "./FloatingActionButton";

type Props = {
  children: ReactNode;
  showFab?: boolean;
};

const MobileLayout = ({ children, showFab = false }: Props) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>{children}</View>
      {showFab && <FloatingActionButton />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1 },
});

export default MobileLayout;
