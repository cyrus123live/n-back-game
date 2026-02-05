// Format a Date as YYYY-MM-DD in the given IANA timezone
export function formatDateInTz(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(date);
  }
}

// Given a YYYY-MM-DD string, return the previous day as YYYY-MM-DD
export function getYesterdayStr(todayStr: string): string {
  const [y, m, d] = todayStr.split('-').map(Number);
  const yesterday = new Date(y, m - 1, d - 1); // JS handles month rollover
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}
