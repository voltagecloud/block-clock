// This function returns the timestamp of the latest midday or midnight before the current time
export function getMidnightOrMiddayTimestamp() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const midday = new Date(now);
  midday.setHours(12, 0, 0, 0);
  return now.getTime() - now.getTimezoneOffset() * 60 * 1000 < midday.getTime()
    ? midnight.getTime()
    : midday.getTime();
}
