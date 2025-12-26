"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

type Props = {
  isOpen: boolean;

  title: string; // 예: "신고 사유를 입력하세요"
  placeholder?: string;

  /** 초기값(선택) */
  initialValue?: string;

  /** 확인 버튼 텍스트 */
  confirmText?: string; // 기본 "다음"
  cancelText?: string; // 기본 "취소"

  /** 텍스트를 부모로 넘김 */
  onConfirm: (value: string) => void;
  onCancel: () => void;

  /** (선택) 안내 문구 */
  helperText?: string;

  /** 최대 글자 수 (선택) */
  maxLength?: number;
};

export default function TextModal({
  isOpen,
  title,
  placeholder = "신고 사유를 입력하세요 (선택)",
  initialValue = "",
  confirmText = "다음",
  cancelText = "취소",
  onConfirm,
  onCancel,
  helperText,
  maxLength = 200,
}: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (!isOpen) return;
    // 열릴 때마다 초기화(원하면 유지로 바꿔도 됨)
    setValue(initialValue);
  }, [isOpen, initialValue]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      // Enter는 textarea에서 줄바꿈이 필요할 수 있어서 여기서는 막지 않음
      // (Cmd/Ctrl+Enter로 제출)
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        onConfirm(value.trim());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel, onConfirm, value]);

  const counter = useMemo(
    () => `${value.length}/${maxLength}`,
    [value, maxLength]
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Overlay */}
      <button
        type="button"
        aria-label="close"
        onClick={onCancel}
        className="absolute inset-0 bg-black/25 backdrop-blur-xs"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="
          relative w-[520px] max-w-[calc(100vw-32px)]
          rounded-[18px] border-2 border-gray-500
          bg-white
          px-5 pt-10 pb-5
          shadow-[0_20px_40px_rgba(0,0,0,0.25)]
        "
      >
        <div className="text-center text-2xl font-extrabold text-gray-900">
          {title}
        </div>

        {helperText ? (
          <div className="mt-3 text-center text-sm font-semibold text-gray-500">
            {helperText}
          </div>
        ) : null}

        {/* 입력 */}
        <div className="mt-6">
          <textarea
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              if (next.length > maxLength) return;
              setValue(next);
            }}
            placeholder={placeholder}
            className="
              h-[140px] w-full resize-none rounded-xl
              border border-gray-300 bg-gray-50
              p-4 text-sm font-semibold text-gray-900
              outline-none focus:border-gray-400
            "
          />
          <div className="mt-2 flex items-center justify-end text-xs font-semibold text-gray-400">
            {counter}
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={() => onConfirm(value.trim())}
            className="h-12"
          >
            {confirmText}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="h-12"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
