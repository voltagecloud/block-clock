export function calculateRadialAngle(seconds: number) {
  return (seconds * 360) / (12 * 60 * 60);
}

export function calculateRadialTimeDifferences(
  blocks: { time: number }[],
  zeroHourTimestamp: number
) {
  let differences = blocks.map((block, i, arr) => {
    if (i === 0) {
      return calculateRadialAngle(block.time - zeroHourTimestamp / 1000);
    }
    return calculateRadialAngle(block.time - arr[i - 1].time);
  });
  if (differences.length > 0) {
    // Include one last segment with a diff of the last block with the current time
    differences.push(
      calculateRadialAngle(
        Math.floor(Date.now() / 1000) - blocks[blocks.length - 1].time
      )
    );
  }
  return differences;
}

export function roundToDecimalPoints(num: number, decimalPoints: number) {
  return Math.round(num * 10 ** decimalPoints) / 10 ** decimalPoints;
}
