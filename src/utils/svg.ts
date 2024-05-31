export function calculateDashArray(
  f: number,
  gap: number | undefined = undefined
) {
  const circumference = Math.PI * (50 * 2);
  const progress = (f / 360) * circumference;
  const remaining = circumference - progress;
  return `${progress}px ${gap ? gap : remaining}px`;
}
