"use client";

import clsx from "clsx";
import type { PostCategory } from "../types/article";
import { categoryLabelText, categoryStyle } from "../types/article";

type Props = {
  value: PostCategory;
  onChange: (v: PostCategory) => void;
};

const tabs: PostCategory[] = ["ALL", "NOTICE", "QUESTION", "GENERAL"];

const categoryStyleMap = {
  NOTICE: {
    border: "border-primary-500",
    text: "text-primary-500",
    bg: "bg-primary-500",
  },
  QUESTION: {
    border: "border-yellow-400",
    text: "text-yellow-500",
    bg: "bg-yellow-400",
  },
  GENERAL: {
    border: "border-green-500",
    text: "text-green-500",
    bg: "bg-green-500",
  },
} as const;

export default function ArticleCategoryTabs({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      {tabs.map((tab) => {
        const isActive = value === tab;

        const base =
          "h-8 rounded-full px-3 text-sm font-semibold transition-colors border-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)]";

        if (tab === "ALL") {
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={clsx(
                base,
                isActive
                  ? "bg-gray-700 text-white border-gray-700"
                  : "text-gray-700 border-gray-500 hover:bg-gray-50"
              )}
            >
              {categoryLabelText[tab]}
            </button>
          );
        }

        const st = categoryStyle[tab];

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={clsx(
              base,
              isActive
                ? `${st.tabBg} text-white ${st.tabBorder}`
                : `bg-white ${st.tabText} ${st.tabBorder} hover:bg-gray-50`
            )}
          >
            {categoryLabelText[tab]}
          </button>
        );
      })}
    </div>
  );
}
