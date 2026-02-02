import { apiRequest } from "./httpClient";
import { API_BASE_URL } from "./config";
import { PetSummary } from "./model/pet";

export type PetCreatePayload = {
  name: string;
  species: string;
  breed?: string | null;
  sex?: string | null;
  birthdate?: string | null;
  weight?: number | null;
  avatar_url?: string | null;
};

export type PetUpdatePayload = Partial<PetCreatePayload>;

export const listPets = async (token: string): Promise<PetSummary[]> => {
  return apiRequest<PetSummary[]>({
    path: "/pets",
    method: "GET",
    token,
  });
};

export const createPet = async (
  payload: PetCreatePayload,
  token: string
): Promise<PetSummary> => {
  return apiRequest<PetSummary>({
    path: "/pets",
    method: "POST",
    body: payload,
    token,
  });
};

export const updatePet = async (
  petId: number,
  payload: PetUpdatePayload,
  token: string
): Promise<PetSummary> => {
  return apiRequest<PetSummary>({
    path: `/pets/${petId}`,
    method: "PUT",
    body: payload,
    token,
  });
};

export const deletePet = async (petId: number, token: string) => {
  await apiRequest<void>({
    path: `/pets/${petId}`,
    method: "DELETE",
    token,
  });
};

export const uploadPetImage = async (
  petId: number,
  fileUri: string,
  token: string
): Promise<{ avatar_url: string }> => {
  const form = new FormData();
  form.append("file", {
    uri: fileUri,
    name: `pet_${petId}.jpg`,
    type: "image/jpeg",
  } as any);

  const response = await fetch(`${API_BASE_URL}/pets/upload-image?pet_id=${petId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo subir la imagen");
  }
  return (await response.json()) as { avatar_url: string };
};
