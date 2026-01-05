import * as SecureStore from "expo-secure-store";
import { AuthTokens } from "./model/auth";

const TOKEN_KEY = "petverse.auth.tokens";
let inMemoryTokens: AuthTokens | null = null;

const secureStoreAvailable = async (): Promise<boolean> => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const saveTokens = async (tokens: AuthTokens) => {
  const serialized = JSON.stringify(tokens);
  if (await secureStoreAvailable()) {
    await SecureStore.setItemAsync(TOKEN_KEY, serialized);
  } else {
    inMemoryTokens = tokens;
  }
};

export const getTokens = async (): Promise<AuthTokens | null> => {
  if (await secureStoreAvailable()) {
    const value = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as AuthTokens;
    } catch {
      return null;
    }
  }
  return inMemoryTokens;
};

export const clearTokens = async () => {
  if (await secureStoreAvailable()) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  inMemoryTokens = null;
};
