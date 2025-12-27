"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ProfilePopover from "./MyInfo";
import { useAuth } from "@/app/providers/AuthProvider";
import { userService } from "@/app/lib/api/userService";

import clipIcon from "../../assets/Link_icon.svg";
import { usePathname } from "next/navigation";

export type SidebarItem =
  | {
      type: "profile";
      label: string;
      iconSrc: StaticImageData;
      activeIconSrc?: StaticImageData;
    }
  | {
      type: "link";
      href: string;
      label: string;
      iconSrc: StaticImageData;
      activeIconSrc?: StaticImageData;
    };

type Props = {
  items: SidebarItem[];
  className?: string;
};

export default function Sidebar({ items, className }: Props) {
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const { user, isLoading, logout } = useAuth();

  const [nicknameView, setNicknameView] = useState<string>("-");

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

  const isLinkActive = (href: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-50 w-20 h-screen border-r border-gray-200 bg-primary-100",
        className ?? "",
      ].join(" ")}
    >
      <Link
        href="/"
        className="flex h-20 w-20 items-center justify-center bg-primary-500"
        aria-label="홈"
      >
        <Image src={clipIcon} alt="클립" width={60} height={60} priority />
      </Link>

      <div className="flex flex-col items-center gap-4 py-6">
        {items.map((item) => {
          if (item.type === "profile") {
            const iconSrc =
              profileOpen && item.activeIconSrc
                ? item.activeIconSrc
                : item.iconSrc;

            return (
              <div key={item.label} ref={profileRef} className="relative z-50">
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                >
                  <Image
                    src={iconSrc}
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
                    await userService.updateMyNickname(user!.id, next);
                    setNicknameView(next);
                  }}
                  onLogout={async () => {
                    setProfileOpen(false);
                    await logout();
                  }}
                />
              </div>
            );
          }

          const active = isLinkActive(item.href);
          const iconSrc =
            active && item.activeIconSrc ? item.activeIconSrc : item.iconSrc;

          return (
            <Link
              key={item.href ?? item.label}
              href={item.href!}
              className="flex h-10 w-10 items-center justify-center rounded-full"
            >
              <Image src={iconSrc} alt={item.label} width={70} height={70} />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
