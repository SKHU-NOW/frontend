import Footer from "./components/Footer";
import Sidebar, { SidebarItem } from "./components/SideBar";
import userIcon from "../assets/profile.svg";
import menuIcon from "../assets/commulist.svg";
import ProtectedGate from "./components/ProtectedGate";
import HeaderShell from "./components/HeaderShell";
import userIconActive from "../assets/profile_active.svg";
import menuIconActive from "../assets/commulist_active.svg";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = [
    {
      type: "profile",
      label: "프로필",
      iconSrc: userIcon,
      activeIconSrc: userIconActive,
    },
    {
      type: "link",
      href: "/Community",
      label: "커뮤니티",
      iconSrc: menuIcon,
      activeIconSrc: menuIconActive,
    },
  ] satisfies SidebarItem[];

  return (
    <ProtectedGate>
      <div className="h-screen overflow-hidden">
        <HeaderShell />
        <Sidebar items={items} />

        <div className="pl-20 pt-20 h-full">
          <main className="h-[calc(100vh-80px)] overflow-y-auto">
            <div>{children}</div>
            <Footer />
          </main>
        </div>
      </div>
    </ProtectedGate>
  );
}
