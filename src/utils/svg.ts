export function calculateDashArray(f: number) {
  const circumference = Math.PI * (50 * 2);
  const progress = (f / 360) * circumference;
  const remaining = circumference - progress;
  return `${progress}px ${remaining}px`;
}
