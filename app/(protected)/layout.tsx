import Footer from "./components/Footer";
import Header from "./components/Header";
import Sidebar, { SidebarItem } from "./components/SideBar";
import userIcon from "../assets/profile.svg";
import menuIcon from "../assets/commulist.svg";
import ProtectedGate from "./components/ProtectedGate";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = [
    { type: "profile", label: "프로필", iconSrc: userIcon },
    { type: "link", href: "/Community", label: "커뮤니티", iconSrc: menuIcon },
  ] satisfies SidebarItem[];

  return (
    <ProtectedGate>
      <div className="min-h-screen">
        <Header />
        <div className="flex w-full">
          <Sidebar items={items} className="sticky h-[calc(100vh=10px)]" />

          <main className="flex-1 min-h-screen">
            <div className="">{children}</div>
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedGate>
  );
}
