const COUNT_FORMATTER = new Intl.NumberFormat('ko-KR');
const TIME_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Seoul',
});

export function formatActivityCount(value: number) {
  return Number.isFinite(value) ? COUNT_FORMATTER.format(value) : '-';
}

export function formatActivityGrowth(value: number) {
  return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${Math.round(value)}%` : '집계 없음';
}

export function formatActivityTime(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return '';
  return TIME_FORMATTER.format(new Date(value));
}

export function asciiMeter(percent: number) {
  const filled = Math.round(
    Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0)) / 10
  );
  return `[${'#'.repeat(filled)}${'.'.repeat(10 - filled)}]`;
}
