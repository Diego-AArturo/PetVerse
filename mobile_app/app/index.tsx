import React, { useState } from "react";
import { useRouter } from "expo-router";

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
  Image,
  ActivityIndicator,
} from "react-native";

import { loginWithEmail } from "../src/data/authService";
import GoogleAuthButton from "./components/auth/auth_google";



export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("Completa tu correo y contraseña");
      return;
    }
    console.log("[login] intentando login email", email.trim());
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await loginWithEmail({ email: email.trim(), password });
      router.push("/onboarding" as any);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo más tarde.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#bfb7e6"
                style={styles.textInput}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Text style={styles.eye}>{showPassword ? "🙈" : "👁️"}</Text>
              </Pressable>
            </View>

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isSubmitting && { opacity: 0.7 },
              ]}
              activeOpacity={0.9}
              onPress={handleEmailLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>O continúa con</Text>
              <View style={styles.line} />
            </View>

            <GoogleAuthButton
              onSuccess={() => router.push("/onboarding" as any)}
              onError={setErrorMessage}
              style={[
                styles.googleButton,
                isSubmitting && { opacity: 0.6 },
              ]}
              textStyle={styles.googleText}
              disabled={isSubmitting}
            />

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
  errorText: {
    color: "#ffb4b4",
    textAlign: "center",
    marginBottom: 8,
  },
});
