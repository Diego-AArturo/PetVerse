import React from "react";
import { Link, useRouter } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import Constants, { ExecutionEnvironment } from "expo-constants";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Image
} from "react-native";



export default function Index() {
  const router = useRouter();
  const expoProxyClientId =
    "738459768384-rnm8kjf2p1mbuajh34kshjbj2hbg0ked.apps.googleusercontent.com"; // el ID del cliente web que tiene https://auth.expo.io/@diegv/mobile_app
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const googleConfig: Partial<Google.GoogleAuthRequestConfig> = {
    clientId: expoProxyClientId,
    webClientId: expoProxyClientId,
    androidClientId: isExpoGo
      ? undefined
      : "738459768384-7p0kiash0oaolbrb8o5npjiubae8qdjn.apps.googleusercontent.com",
    iosClientId: isExpoGo
      ? undefined
      : "738459768384-pn476o3gbviv3ufvco52ifqvtnh8758i.apps.googleusercontent.com",
    ...(isExpoGo
      ? { redirectUri: "https://auth.expo.io/@diegu/mobile_app" }
      : {}),
  };
  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     androidClientId: "738459768384-7p0kiash0oaolbrb8o5npjiubae8qdjn.apps.googleusercontent.com",
//     iosClientId: "738459768384-pn476o3gbviv3ufvco52ifqvtnh8758i.apps.googleusercontent.com",
//     clientId: "738459768384-rnm8kjf2p1mbuajh34kshjbj2hbg0ked.apps.googleusercontent.com",
// });

   // Manejar respuesta de Google
React.useEffect(() => {
  if (response?.type === "success") {
    const { authentication } = response;

    if (!authentication) return; // ⬅️ Evita el error TS

    console.log("TOKEN GOOGLE:", authentication.accessToken);
    alert("Login exitoso");
  }
}, [response]);



  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/logo_blanco.png')} style={styles.logoImage} />
          </View>

          <Text style={styles.title}>PetVerse</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <View style={styles.form}>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#bfb7e6"
                style={styles.textInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#bfb7e6"
                style={styles.textInput}
                secureTextEntry
              />
              <Pressable style={styles.eyeButton}>
                <Text style={styles.eye}>👁️</Text>
              </Pressable>
            </View>

            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>O continúa con</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.googleButton} activeOpacity={0.9}
            onPress={() => {console.log("Navegando a /loginWithGoogle" as any);
            promptAsync()}}>
              <Text style={styles.googleText}>G  Google</Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.smallText}>¿No tienes cuenta? </Text>
              <Pressable onPress={() => router.push("/register" as any)}>
                <Text style={styles.registerLink}>Regístrate</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const COLORS = {
  background: "#141033",
  inputBackground: "#2f2252",
  primary: "#9b6cff",
  lightPrimary: "#b58bff",
  textLight: "#e9e6ff",
  muted: "#bfb7e6",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoImage: { width: 160, height: 160, resizeMode: "contain" },
  logoEmoji: { fontSize: 44 },
  title: {
    color: COLORS.textLight,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    color: COLORS.muted,
    marginTop: 6,
    marginBottom: 20,
  },
  form: { width: "100%", marginTop: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10, fontSize: 18 },
  textInput: { flex: 1, color: COLORS.textLight, fontSize: 16 },
  eyeButton: { paddingHorizontal: 8 },
  eye: { fontSize: 18, color: COLORS.muted },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#3a2a60",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryButtonText: { color: "white", fontWeight: "700", fontSize: 16 },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  orText: { color: COLORS.muted, marginHorizontal: 12 },
  googleButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#3a2a60",
    alignItems: "center",
    justifyContent: "center",
  },
  googleText: { color: COLORS.textLight, fontWeight: "600" },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  smallText: { color: COLORS.muted },
  registerLink: { color: COLORS.primary, fontWeight: "700" },
});

