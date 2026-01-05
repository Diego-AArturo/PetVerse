import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import {
  GoogleSignin,
  statusCodes as GoogleStatusCodes,
} from "@react-native-google-signin/google-signin";

import { loginWithGoogleIdToken } from "../../../src/data/authService";

type GoogleAuthButtonProps = {
  onSuccess: () => void;
  onError?: (message: string | null) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
};

const WEB_CLIENT_ID =
  "738459768384-rnm8kjf2p1mbuajh34kshjbj2hbg0ked.apps.googleusercontent.com";
const ANDROID_CLIENT_ID =
  "738459768384-7p0kiash0oaolbrb8o5npjiubae8qdjn.apps.googleusercontent.com";
const IOS_CLIENT_ID =
  "738459768384-pn476o3gbviv3ufvco52ifqvtnh8758i.apps.googleusercontent.com";

let googleConfigured = false;
const ensureGoogleConfigured = () => {
  if (googleConfigured) {
    return;
  }
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    // iosClientId: IOS_CLIENT_ID,
    // androidClientId: ANDROID_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
    profileImageSize: 120,
  });
  googleConfigured = true;
};

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  label = "G  Google",
  style,
  textStyle,
  disabled,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    ensureGoogleConfigured();
  }, []);

  const handlePress = async () => {
  onError?.(null);
  setIsLoading(true);

  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // 1️⃣ Login del usuario
    await GoogleSignin.signIn();

    // 2️⃣ Obtener tokens (FORMA CORRECTA)
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) {
      throw new Error("No se obtuvo el idToken de Google");
    }

    // 3️⃣ Enviar al backend
    await loginWithGoogleIdToken(idToken);
    onSuccess();
  } catch (error: any) {
    let message = "No se pudo iniciar sesión con Google";

    if (error?.code === GoogleStatusCodes.SIGN_IN_CANCELLED) {
      message = "Inicio de sesión cancelado";
    } else if (error?.code === GoogleStatusCodes.IN_PROGRESS) {
      message = "Operación de Google ya en progreso";
    } else if (
      error?.code === GoogleStatusCodes.PLAY_SERVICES_NOT_AVAILABLE
    ) {
      message = "Google Play Services no está disponible";
    } else if (error instanceof Error && error.message) {
      message = error.message;
    }

    onError?.(message);
  } finally {
    setIsLoading(false);
  }
};

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={style}
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

export { GoogleAuthButton };
export default GoogleAuthButton;
