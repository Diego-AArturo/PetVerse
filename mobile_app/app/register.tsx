import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerWithEmail } from "../src/data/authService";
// import GoogleAuthButton from "./components/auth/auth_google";

export default function Register() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!username || !email || !password) {
      setErrorMessage(t("auth.register.errors.emptyFields"));
      return;
    }
    setIsLoading(true);
    try {
      await registerWithEmail({ name: username, email, password });
      router.replace("/tabs/home" as any); // rutas tipadas desactualizadas
    } catch (e: any) {
      setErrorMessage(e?.message ?? t("auth.register.errors.registerFailed"));
    } finally {
      setIsLoading(false);
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
            <Image source={require('../assets/images/logo_blanco.png')} 
            style={styles.logoImage} />
          </View>

          <Text style={styles.title}>{t("common.appName")}</Text>
          <Text style={styles.subtitle}>{t("auth.register.title")}</Text>

          <View style={styles.form}>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                placeholder={t("auth.register.usernamePlaceholder")}
                placeholderTextColor="#bfb7e6"
                style={styles.textInput}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                placeholder={t("auth.register.emailPlaceholder")}
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
                placeholder={t("auth.register.passwordPlaceholder")}
                placeholderTextColor="#bfb7e6"
                style={styles.textInput}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}

              />
              <Pressable style={styles.eyeButton} onPress={() => setShowPass((v) => !v)}>
                <Text style={styles.eye}>{showPass ? "🙈" : "👁️"}</Text>
              </Pressable>
            </View>

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isLoading && { opacity: 0.7 },
              ]}
              activeOpacity={0.9}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>{t("auth.register.submitButton")}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>{t("common.orContinueWith")}</Text>
              <View style={styles.line} />
            </View>

            {/* <GoogleAuthButton
              onSuccess={() => router.push("/tabs/home" as any)}
              onError={setErrorMessage}
              style={styles.googleButton}
              textStyle={styles.googleText}
            /> */}

            <View style={styles.registerRow}>
              <Text style={styles.smallText}>{t("auth.register.hasAccount")} </Text>
              <Pressable onPress={() => router.push("/" as any)}>
                <Text style={styles.registerLink}>{t("auth.register.login")}</Text>
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
