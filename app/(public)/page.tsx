import Image from "next/image";
import memo from "../assets/memo.svg";
import plusIcon from "../assets/icon_plus.svg";

export default function LandingPage() {
  return (
    <main className="mx-auto px-50 py-10 text-gray-500">
      {/* 헤더 높이(100px)를 제외한 영역을 꽉 채우기 */}
      <section className="flex items-center justify-between gap-12">
        {/* 왼쪽 텍스트 영역 */}
        <div className="space-y-6 text-center">
          <p className="text-2xl md:text-4xl font-extrabold whitespace-nowrap">
            성공회대 학생들을 위한 커뮤니티
          </p>
          <p className="text-3xl md:text-4xl font-extrabold">SKHU Link</p>
        </div>

        {/* 오른쪽 메모 이미지 영역 */}
        <div className="flex shrink-0">
          <Image src={memo} alt="메모지" className="drop-shadow-md" priority />
        </div>
      </section>

      <div className="flex items-center gap-2">
        <Image src={plusIcon} alt="플러스버튼" />
        <span className="text-sm font-medium mt-1">
          보드를 클릭하면 새 메모가 생성됩니다.
        </span>
      </div>
    </main>
  );
}
