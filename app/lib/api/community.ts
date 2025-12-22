import { api } from "@/app/lib/api/fetchClient";

export type CreateCommunityPayload = {
  name: string;
  year: number;
  semester: number;
};

export type CommunityDto = {
  id: number;
  name: string;
  year: number;
  semester: number;
  adminNickname: string;
  createdAt: string;
  updatedAt: string;
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

  deleteCommunity: (communityId: number) => {
    return api.delete<ApiResponse<string>>(`/communities/${communityId}`, {
      auth: true,
    });
  },
};
