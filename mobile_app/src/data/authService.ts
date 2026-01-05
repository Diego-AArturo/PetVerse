import { apiRequest } from "./httpClient";
import {
  AuthTokens,
  BackendAuthResponse,
  EmailLoginPayload,
  RegisterPayload,
} from "./model/auth";
import { UserProfile, UserSummary } from "./model/user";
import { fetchMyProfile } from "./userService";
import { clearTokens, getTokens, saveTokens } from "./tokenStorage";

export interface AuthSession {
  tokens: AuthTokens;
  user?: UserSummary | null;
  profile?: UserProfile;
}

const persistTokens = async (
  response: BackendAuthResponse
): Promise<AuthSession> => {
  const tokens: AuthTokens = {
    access_token: response.access_token,
    token_type: response.token_type,
  };
  await saveTokens(tokens);
  return { tokens, user: response.user };
};

type AuthRequestPayload =
  | RegisterPayload
  | EmailLoginPayload
  | { id_token: string };

const authenticate = async (
  path: string,
  payload: AuthRequestPayload
): Promise<AuthSession> => {
  const response = await apiRequest<BackendAuthResponse>({
    path,
    method: "POST",
    body: payload,
  });
  const session = await persistTokens(response);
  const profile = await fetchMyProfile(session.tokens.access_token);
  return { ...session, profile };
};

export const loginWithGoogleIdToken = async (
  idToken: string
): Promise<AuthSession> => authenticate("/auth/google/callback", { id_token: idToken });

export const registerWithEmail = async (
  payload: RegisterPayload
): Promise<AuthSession> => authenticate("/auth/register", payload);

export const loginWithEmail = async (
  payload: EmailLoginPayload
): Promise<AuthSession> => authenticate("/auth/login", payload);

export const restoreProfile = async (): Promise<UserProfile | null> => {
  const tokens = await getTokens();
  if (!tokens) {
    return null;
  }
  try {
    return await fetchMyProfile(tokens.access_token);
  } catch {
    return null;
  }
};

export const logout = async () => {
  await clearTokens();
};
