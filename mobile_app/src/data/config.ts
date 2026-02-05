import { Platform } from "react-native";
import Constants from "expo-constants";

type ExtraConfig = {
  apiBaseUrl?: string;
};

const DEFAULT_ANDROID_BASE_URL = "http://192.168.20.75:8000";
const DEFAULT_IOS_BASE_URL = "http://192.168.1.19:8000";

const getEnvBaseUrl = (): string | undefined => {
  try {
    return process.env.EXPO_PUBLIC_API_URL;
  } catch {
    return undefined;
  }
};

const getExtraBaseUrl = (): string | undefined => {
  const extra = (Constants.expoConfig?.extra ??
    // @ts-ignore: manifest is deprecated on SDK 54 but still populated locally
    Constants.manifest?.extra) as ExtraConfig | undefined;
  return extra?.apiBaseUrl;
};

const getPlatformFallback = (): string => {
  if (Platform.OS === "android") {
    return DEFAULT_ANDROID_BASE_URL;
  }
  return DEFAULT_IOS_BASE_URL;
};

export const API_BASE_URL =
  getEnvBaseUrl() ?? getExtraBaseUrl() ?? getPlatformFallback();

// Debug helper para verificar hacia dónde se apuntan las peticiones.
console.log("[config] API_BASE_URL", API_BASE_URL);

export const REQUEST_TIMEOUT_MS = 10000;
