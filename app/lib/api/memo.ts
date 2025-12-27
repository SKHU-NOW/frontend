import { api } from "@/app/lib/api/fetchClient";

export type MemoColor = "RED" | "YELLOW" | "GREEN" | "BLUE" | "PURPLE" | string;

export type MemoDto = {
  id: number;
  boardId: number;
  contentText: string;
  color: MemoColor;
  posX: number;
  posY: number;
  drawingImageUrl: string;
  createdAt: string;
};

export type CreateMemoPayload = {
  boardId: number;
  contentText: string;
  posX: number;
  posY: number;
  drawingImageUrl: string;
};

export const memoService = {
  /** 메모 조회 */
  getMemos: (all?: boolean) => {
    const qs = all ? "?all=false" : "";
    return api.get<MemoDto[]>(`/memos${qs}`);
  },

  /** 메모 작성 */
  createMemo: (payload: CreateMemoPayload) => {
    return api.post<MemoDto>("/memos", payload);
  },
};
