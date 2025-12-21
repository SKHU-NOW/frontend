"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProfilePopover from "./MyInfo";

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

  return (
    <aside
      className={`w-[80.5px] border-r border-gray-200 bg-primary-100 -mr-10 sticky top-0 h-screen z-50 ${
        className ?? ""
      }`}
    >
      <div className="flex flex-col items-center gap-4 py-6">
        {items.map((item) => {
          // ✅ 프로필 아이콘(팝오버)
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
                  nickname="키웅키웅"
                  mileage="Nnn"
                  onSaveNickname={(next) => console.log("save", next)}
                  onLogout={() => console.log("logout")}
                />
              </div>
            );
          }

          // ✅ 일반 링크 아이콘
          return (
            <Link
              key={item.href ?? item.label}
              href={item.href!}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              aria-label={item.label}
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
