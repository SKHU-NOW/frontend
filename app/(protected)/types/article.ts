// app/(protected)/types/article.ts (또는 지금 파일 경로 그대로)

export type PostCategory = "ALL" | "NOTICE" | "QUESTION" | "GENERAL";

export type Post = {
  id: string;
  title: string;
  author: string;
  commentCount: number;
  createdAt: string;
  category: Exclude<PostCategory, "ALL">;
};

export const categoryLabelText: Record<PostCategory, string> = {
  ALL: "전체",
  NOTICE: "공지",
  QUESTION: "질문",
  GENERAL: "일반",
};

export const categoryStyle = {
  NOTICE: {
    barBg: "bg-[#E45A29]",
    tabBorder: "border-[#E45A29]",
    tabText: "text-[#E45A29]",
    tabBg: "bg-[#E45A29]",
  },
  QUESTION: {
    barBg: "bg-[#F2C94C]",
    tabBorder: "border-[#F2C94C]",
    tabText: "text-[#F2C94C]",
    tabBg: "bg-[#F2C94C]",
  },
  GENERAL: {
    barBg: "bg-[#6B9E73]",
    tabBorder: "border-[#6B9E73]",
    tabText: "text-[#6B9E73]",
    tabBg: "bg-[#6B9E73]",
  },
} as const;

export const categoryColorClass: Record<
  Exclude<PostCategory, "ALL">,
  string
> = {
  NOTICE: categoryStyle.NOTICE.barBg,
  QUESTION: categoryStyle.QUESTION.barBg,
  GENERAL: categoryStyle.GENERAL.barBg,
};
