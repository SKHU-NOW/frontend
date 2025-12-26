import { api } from "@/app/lib/api/fetchClient";

export type CreateCommunityPayload = {
  name: string;
  year: number;
  semester: number;
};

export type CommunityRole = "ADMIN" | "USER" | string;

export type CommunityMembershipDto = {
  id: number;
  role: CommunityRole;
  joinAt: string;
  userId: number;
  userNickname: string;
  communityId: number;
  banned: boolean;
  pinned: boolean;
};

export type CommunityDto = {
  id: number;
  name: string;
  year: number;
  semester: number;
  adminNickname: string;
  createdAt: string;
  updatedAt: string;

  communityMembershipResponse?: CommunityMembershipDto | null;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export const communityService = {
  createCommunity: (payload: CreateCommunityPayload) => {
    return api.post<CommunityDto>("/communities", payload, { auth: true });
  },

  getMyCommunities: async (): Promise<CommunityDto[]> => {
    return api.get<CommunityDto[]>("/communities");
  },

  getCommunityById: (communityId: number) =>
    api.get<CommunityDto>(`/communities/${communityId}`),

  toggleCommunityPinned: (communityId: number) => {
    return api.patch<CommunityDto>(
      `/communities/${communityId}/pinned`,
      undefined,
      {
        auth: true,
      }
    );
  },

  deleteCommunity: (communityId: number) => {
    return api.delete<ApiResponse<string>>(`/communities/${communityId}`, {
      auth: true,
    });
  },
};
