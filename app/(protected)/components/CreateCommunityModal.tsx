"use client";

import ButtonBlue from "@/app/components/ui/ButtonBlue";
import Field from "@/app/components/ui/Field";
import { communityService } from "@/app/lib/api/community";
import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;

  onCreated: (id: number) => void;
};

export default function CreateCommunityModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [year, setYear] = useState(""); // 입력은 string으로 받고 submit 때 number로 변환
  const [semester, setSemester] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const y = Number(year);
    const s = Number(semester);
    if (!name.trim()) return false;
    if (!Number.isFinite(y) || y < 1900) return false;
    if (!(s === 1 || s === 2)) return false;
    return true;
  }, [name, year, semester]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await communityService.createCommunity({
        name: name.trim(),
        year: Number(year),
        semester: Number(semester),
      });

      // 성공: 모달 닫고, 게시글 페이지로 이동시키기 위해 id 전달
      onClose();
      onCreated(created.id);

      // (선택) 입력 초기화
      setName("");
      setYear("");
      setSemester("");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "커뮤니티 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Field
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="과목명을 입력하세요."
          />
        </div>

        <div>
          <div className="mb-2 text-sm font-extrabold">년도</div>
          <Field
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="년도를 입력하세요."
            inputMode="numeric"
          />
        </div>

        <div>
          <div className="mb-2 text-sm font-extrabold">학기</div>
          <Field
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="학기를 입력하세요. (1 또는 2)"
            inputMode="numeric"
          />
        </div>

        {errorMsg && (
          <div className="text-sm font-semibold text-red-500">{errorMsg}</div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <ButtonBlue
          variant="secondary"
          onClick={onClose}
          className="h-10 w-15"
          disabled={isSubmitting}
        >
          취소
        </ButtonBlue>
        <ButtonBlue
          className="h-10 w-15"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? "등록중" : "등록"}
        </ButtonBlue>
      </div>
    </div>
  );
}
