export const WEEKDAYS = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatLockTime(now: Date): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function formatLockDate(now: Date): string {
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${WEEKDAYS[now.getDay()]}`;
}

export function unlockErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  return "解锁失败，请重试";
}

export function fallbackAvatar(current: string, fallback: string): string {
  return current.length > 0 ? current : fallback;
}
