// src/app/lib/utils/time.ts

/**
 * createdAt(ISO string) -> "방금 전", "n분 전", "n시간 전", "n일 전", "YYYY.MM.DD"
 * - 수정 시간(updatedAt)은 무시하고 createdAt만 사용
 */
export function formatTimeAgo(
  isoString: string,
  now: Date = new Date()
): string {
  if (!isoString) return "-";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString; // 파싱 실패 시 원문 반환

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  // 미래 시간(서버/클라 시간차 등)일 경우: 날짜 포맷으로 표시
  if (diffSec < 0) return formatYmd(date);

  if (diffSec < 60) return "방금 전";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  // 일주일 이상이면 날짜로
  return formatYmd(date);
}

export function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}
