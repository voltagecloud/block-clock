export function calculateRadialAngle(seconds: number, zeroHourInterval = 12) {
  return (seconds * 360) / (zeroHourInterval * 60 * 60);
}

export function calculateRadialTimeDifferences(
  blocks: { time: number }[],
  zeroHourTimestamp: number,
  zeroHourInterval = 12
) {
  let differences = blocks.map((block, i, arr) => {
    if (i === 0) {
      return calculateRadialAngle(
        block.time - zeroHourTimestamp / 1000,
        zeroHourInterval
      );
    }
    return calculateRadialAngle(block.time - arr[i - 1].time, zeroHourInterval);
  });
  // Calculate the next zeroHourTimestamp
  const nextZeroHourTimestamp =
    zeroHourTimestamp + zeroHourInterval * 60 * 60 * 1000;
  if (differences.length > 0) {
    // Include one last segment with a diff of the last block with the current time
    differences.push(
      calculateRadialAngle(
        Math.floor(Math.min(nextZeroHourTimestamp, Date.now()) / 1000) -
          blocks[blocks.length - 1].time,
        zeroHourInterval
      )
    );
  } else if (differences.length === 0) {
    // If there are no blocks, include one segment that draws from the zeroHourTimestamp to now
    differences.push(
      calculateRadialAngle(
        Math.floor(Math.min(nextZeroHourTimestamp, Date.now()) / 1000) -
          zeroHourTimestamp / 1000,
        zeroHourInterval
      )
    );
  }
  return differences;
}

export function roundToDecimalPoints(num: number, decimalPoints: number) {
  return Math.round(num * 10 ** decimalPoints) / 10 ** decimalPoints;
}
