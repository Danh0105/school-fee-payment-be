import { apiRequest } from "@/lib/api-client";
import type { AuthUser, Role } from "@/lib/types";
export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  schoolId?: string;
}
export const usersApi = {
  create: (payload: CreateUserPayload) =>
    apiRequest<AuthUser>({ method: "POST", url: "/users", data: payload }),
};
