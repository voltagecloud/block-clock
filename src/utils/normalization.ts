// TODO: convert seconds timestamp differences proportionally
// into degrees based on 12-hour time periods
export function calculateDashArrayTEMP(
  progress: number,
  segments: number[],
  gap = 2
) {
  const circumference = Math.PI * (50 * 2);
  // If no progres, no dasharray needs to be calculated
  if (progress <= 0) {
    return `0px ${circumference}`;
  }
  // TODO, progress is simply the time that's passed, filled should be based on the time since the last 12-hour cycle

  const SECONDS = 43200; // 12 hours in seconds
  //   const diffs = differences(segments);
  //   const normalized = normalize(diffs);
  //   const coef = getScaleCoefficient(normalized, filled);
  //   const proportions = normalized.map((n) => n * coef);
  //   const dashes = proportions.map((dash) => `${dash}px ${gap}px`).join(" ");
  //   const remaining = circumference - filled;
  //   // Need to ensure that remaining always ends as a gap, not a dash
  //   // If proportions.length is even, last element is gap, else dash
  //   const dasharray =
  //     proportions.length % 2 === 0
  //       ? `${dashes} ${remaining}px`
  //       : `${dashes} 0px ${remaining}px`;
  //   console.log({
  //     dashes,
  //     filled,
  //     remaining,
  //     normalized,
  //     proportions,
  //     dasharray,
  //     diffs,
  //     coef,
  //     circumference,
  //   });

  //   return dasharray;
  return `${progress}px ${circumference - progress}`;
}
