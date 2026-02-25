// import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { loginWithEmail } from "../src/data/authService";
// import * as Google from "expo-auth-session/providers/google";
// import * as WebBrowser from "expo-web-browser";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ NECESARIO para expo-auth-session (evita render error / pantalla en blanco)
// WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "738459768384-7p0kiash0oaolbrb8o5npjiubae8qdjn.apps.googleusercontent.com",
    iosClientId:
      "738459768384-pn476o3gbviv3ufvco52ifqvtnh8758i.apps.googleusercontent.com",
  }); */

  /* useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (!authentication) return;

      console.log("TOKEN GOOGLE:", authentication.accessToken);

      // ✅ manda al home (ajusta según tu ruta real)
      router.replace("/tabs/home" as any); // rutas tipadas desactualizadas
    }
  }, [response]); */

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage(t("auth.login.errors.emptyFields"));
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmail({ email, password });
      router.replace("/tabs/home" as any);
    } catch (err: any) {
      const message =
        err?.message ?? t("auth.login.errors.loginFailed");
      setErrorMessage(message);
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
            <Image
              source={require("../assets/images/logo_blanco.png")}
              style={styles.logoImage}
            />
          </View>

          <Text style={styles.title}>{t("common.appName")}</Text>
          <Text style={styles.subtitle}>{t("auth.login.title")}</Text>

          <View style={styles.form}>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                placeholder={t("auth.login.emailPlaceholder")}
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
                placeholder={t("auth.login.passwordPlaceholder")}
                placeholderTextColor="#bfb7e6"
                style={styles.textInput}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPass((v) => !v)}
              >
                <Text style={styles.eye}>{showPass ? "🙈" : "👁️"}</Text>
              </Pressable>
            </View>

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? t("auth.login.submitting") : t("auth.login.submitButton")}
              </Text>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.line} />
              <Text style={styles.orText}>{t("common.orContinueWith")}</Text>
              <View style={styles.line} />
            </View>

            {/* <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.9}
              onPress={() => promptAsync()}
              disabled={!request}
            >
              <Text style={styles.googleText}>G Google</Text>
            </TouchableOpacity> */}

            <View style={styles.registerRow}>
              <Text style={styles.smallText}>{t("auth.login.noAccount")} </Text>
              <Pressable onPress={() => router.push("/register")}>
                <Text style={styles.registerLink}>{t("auth.login.register")}</Text>
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

