// app/(protected)/Community/components/CreateCommunityModal.tsx
"use client";

import ButtonBlue from "@/app/components/ui/ButtonBlue";
import Field from "@/app/components/ui/Field";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateCommunityModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="
        absolute right-0 top-full mt-3
        w-[360px]
        rounded-[14px] border-2 border-gray-400 bg-white
        p-5
        shadow-[0px_4px_10px_rgba(0,0,0,0.08)]
        z-50
      "
      role="dialog"
      aria-modal="false"
    >
      <div className="text-xl font-extrabold">커뮤니티 생성</div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 text-sm font-extrabold">과목명</div>
          <Field placeholder="과목명을 입력하세요." />
        </div>

        <div>
          <div className="mb-2 text-sm font-extrabold">년도 / 학기</div>
          <Field placeholder="년도 및 학기를 입력하세요." />
        </div>

        <div>
          <div className="mb-2 text-sm font-extrabold">이수구분</div>
          <Field placeholder="이수구분을 입력하세요." />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <ButtonBlue variant="secondary" onClick={onClose} className="h-10 w-15">
          취소
        </ButtonBlue>
        <ButtonBlue className="h-10 w-15">등록</ButtonBlue>
      </div>
    </div>
  );
}
