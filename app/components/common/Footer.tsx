// 여기서 아예 나눌 예정.
// 메모장 페이지 Footer -> public
// 커뮤니티 전용 Footer -> protected

"use client";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto px-10 py-3 text-sm flex items-center">
        <span className="mr-1 font-semibold text-primary-500">Tip.</span>

        {/* 같은 자리에서 문구가 교대로 슬라이드 되는 영역 */}
        <div className=" text-gray-700">
          <div>
            <span>오늘의 메모는 하루가 지나면 자동으로 리셋!</span>
            <span>메모는 1인 당 기본 5장 지급됩니다. (하루 기준)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
