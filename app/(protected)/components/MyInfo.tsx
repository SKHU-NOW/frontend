"use client";

import { useEffect, useState } from "react";
import InfoBox from "./InfoBox";
import ButtonGray from "@/app/components/ui/ButtonGray";
import ButtonBlue from "@/app/components/ui/ButtonBlue";

type Props = {
  open: boolean;
  onClose: () => void;

  nickname: string;
  mileage: number | string;
  placement?: "bottom" | "right";
  onSaveNickname?: (next: string) => void;
  onLogout?: () => void;
};

export default function ProfilePopover({
  open,
  onClose,
  nickname,
  mileage,
  placement = "bottom",
  onSaveNickname,
  onLogout,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);

  // 열릴 때마다 초기화(취소 느낌)
  useEffect(() => {
    if (!open) return;
    setIsEditing(false);
    setDraft(nickname);
  }, [open, nickname]);

  if (!open) return null;

  const handleSave = () => {
    const next = draft.trim();
    if (!next) return;

    onSaveNickname?.(next);
    console.log("save nickname:", next);

    setIsEditing(false);
  };

  const pos =
    placement === "right"
      ? "absolute left-full top-1/3 -translate-y-1/2 ml-3"
      : "absolute right-0 top-full mt-3";

  return (
    <div
      className={`${pos}
        absolute right-0 top-full mt-33
        w-[300px]
        rounded-[18px] border-2 border-gray-400 bg-white
        p-6
        shadow-[0px_4px_10px_rgba(0,0,0,0.08)]
        z-200`}
    >
      {/* Title */}
      <div className="text-[20px] font-semiboldbold">My information</div>

      {/* 닉네임 */}
      <div className="mt-6">
        <div className="mb-2 text-sm font-extrabold">닉네임</div>

        <div className="flex gap-3">
          <div className="flex-1">
            {isEditing ? (
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="
                  h-11 w-full rounded-md border border-gray-400 px-4
                  text-sm font-semibold text-gray-800 outline-none
                  transition-colors hover:border-primary-500 focus:border-primary-500
                "
                autoFocus
              />
            ) : (
              <InfoBox>{nickname}</InfoBox>
            )}
          </div>

          <ButtonGray
            onClick={() => {
              if (!isEditing) {
                setIsEditing(true);
                return;
              }
              handleSave();
            }}
            disabled={isEditing && !draft.trim()}
            className="w-17"
          >
            {isEditing ? "저장" : "수정"}
          </ButtonGray>
        </div>
      </div>

      {/* 마일리지 */}
      <div className="mt-6">
        <div className="mb-2 text-sm font-extrabold">마일리지</div>
        <InfoBox>{mileage}</InfoBox>
      </div>

      {/* 로그아웃 */}
      <div className="mt-8 flex justify-center">
        <ButtonBlue
          className="h-12 w-[180px] rounded-lg text-base"
          onClick={async () => {
            await onLogout?.();
            onClose();
          }}
        >
          로그아웃
        </ButtonBlue>
      </div>
    </div>
  );
}
