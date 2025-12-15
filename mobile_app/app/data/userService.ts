import { apiRequest } from "./httpClient";
import { UserProfile } from "./model/user";

export const fetchMyProfile = async (
  accessToken?: string
): Promise<UserProfile> => {
  if (!accessToken) {
    throw new Error("Falta el token de acceso");
  }
  return apiRequest<UserProfile>({
    path: "/users/me",
    method: "GET",
    token: accessToken,
  });
};
