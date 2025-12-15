import { UserSummary } from "./user";

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface EmailLoginPayload {
  email: string;
  password: string;
}

export interface BackendAuthResponse extends AuthTokens {
  user?: UserSummary | null;
}
