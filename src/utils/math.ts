function normalize(data: number[]) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const normal = data.map((value) => (value - min) / (max - min));
  normal.shift();
  return normal;
}

function differences(data: number[]) {
  let diffs = data.map((value, i) => (i > 0 ? value - data[i - 1] : value));
  // Remove the first element because it is only used for comparison
  diffs[0] = 0;
  return diffs;
}

function getScaleCoefficient(data: number[], filled: number) {
  return filled / data.reduce((acc, val) => acc + val, 0);
}
