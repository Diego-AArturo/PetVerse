export interface PetSummary {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  sex?: string | null;
  birthdate?: string | null;
  weight?: number | null;
  avatar_url?: string | null;
}
