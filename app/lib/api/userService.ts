import { api } from "./fetchClient";

export type AuthProviderType = "MICROSOFT" | "LOCAL" | string;
export type UserRole = "SYSTEM_ADMIN" | "USER" | string;

export type MyProfile = {
  id: number;
  email: string;
  displayName: string;
  nickname: string;
  role: UserRole;
  mileage: number;
  banned: boolean;
  oauthProvider: AuthProviderType;
  lastLoginAt: string; // ISO string
  createdAt: string | null;
  updatedAt: string | null;
};

export const userService = {
  getMe: () => api.get<MyProfile>("/auth/me"),

  updateMyNickname: (userId: number, nickname: string) => {
    const qs = new URLSearchParams({
      userId: String(userId),
      nickname,
    }).toString();

    return api.post<null>(`/users/me/nickname?${qs}`);
  },
};
