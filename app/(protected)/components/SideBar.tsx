"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ProfilePopover from "./MyInfo";
import { useAuth } from "@/app/providers/AuthProvider";
import { userService } from "@/app/lib/api/userService";

export type SidebarItem =
  | {
      type: "profile";
      label: string;
      iconSrc: StaticImageData;
    }
  | {
      type: "link";
      href: string;
      label: string;
      iconSrc: StaticImageData;
    };

type Props = {
  items: SidebarItem[];
  className?: string;
};

export default function Sidebar({ items, className }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const { user, isLoading, logout } = useAuth();

  const [nicknameView, setNicknameView] = useState<string>("-");

  // user가 로드되면 로컬 표시값 초기화
  useEffect(() => {
    if (isLoading) return;
    setNicknameView(user?.nickname ?? "-");
  }, [isLoading, user?.nickname]);

  useEffect(() => {
    if (!profileOpen) return;

    const onDown = (e: MouseEvent) => {
      const el = profileRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setProfileOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [profileOpen]);

  const canEdit = useMemo(() => !!user?.id, [user?.id]);

  return (
    <aside
      className={`w-[80.5px] border-r border-gray-200 bg-primary-100 -mr-10 sticky top-0 h-screen z-50 ${
        className ?? ""
      }`}
    >
      <div className="flex flex-col items-center gap-4 py-6">
        {items.map((item) => {
          // 프로필 아이콘(팝오버)
          if (item.type === "profile") {
            return (
              <div key={item.label} ref={profileRef} className="relative z-50">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  aria-label={item.label}
                >
                  <Image
                    src={item.iconSrc}
                    alt={item.label}
                    width={70}
                    height={70}
                  />
                </button>

                <ProfilePopover
                  open={profileOpen}
                  onClose={() => setProfileOpen(false)}
                  placement="right"
                  nickname={isLoading ? "불러오는 중..." : nicknameView}
                  mileage={isLoading ? "-" : user?.mileage ?? "-"}
                  onSaveNickname={async (next) => {
                    if (!canEdit) return;

                    // 1) API 호출
                    await userService.updateMyNickname(user!.id, next);

                    // 2) 즉시 UI 반영 (AuthProvider는 건드리지 않음)
                    setNicknameView(next);

                    // (선택) 저장 후 닫기
                    // setProfileOpen(false);
                  }}
                  onLogout={() => {
                    logout?.();
                    setProfileOpen(false);
                  }}
                />
              </div>
            );
          }

          // 일반 링크 아이콘
          return (
            <Link
              key={item.href ?? item.label}
              href={item.href!}
              className="flex h-10 w-10 items-center justify-center rounded-full"
            >
              <Image
                src={item.iconSrc}
                alt={item.label}
                width={70}
                height={70}
              />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
