import { PetSummary } from "./pet";

export type UserRole = "tutor" | "vet" | "admin" | string;

export interface UserSummary {
  id?: number | null;
  name?: string | null;
  email: string;
  role?: UserRole;
}

export interface UserProfile extends UserSummary {
  pets: PetSummary[];
}
