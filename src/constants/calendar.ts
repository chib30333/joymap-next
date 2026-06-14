export const TODAY = 10;
export const MONTH_DAYS = 30;
export const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function dow(day: number) {
  return (day - 1) % 7;
}

export function dateLabel(day: number) {
  const d = Math.max(Math.min(day, MONTH_DAYS), 1);
  return `${WD[dow(d)]} ${day} Jun`;
}
