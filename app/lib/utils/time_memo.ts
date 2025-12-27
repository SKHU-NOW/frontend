/** 홈페이지 전용 시간 유틸(서버 시간 +9h 보정) */

function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

// createdAt을 “파싱 → +9시간 보정”한 뒤 timeAgo 계산
export function formatTimeAgoWithPlus9(
  isoString: string,
  now: Date = new Date()
): string {
  if (!isoString) return "-";

  const raw = new Date(isoString);
  if (Number.isNaN(raw.getTime())) return isoString;

  // 서버 시간이 9시간 빠르게/느리게 들어오는 문제 보정
  const date = addHours(raw, 9);

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 0) return formatYmd(date);
  if (diffSec < 60) return "방금 전";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  return formatYmd(date);
}
