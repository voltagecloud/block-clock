// Function to format number with commas i.e. 1000000 -> 1,000,000
export function numberWithCommas(x?: number) {
  if (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return "";
  }
}

export function roundToDecimalPoints(num: number, decimalPoints: number) {
  return Math.round(num * 10 ** decimalPoints) / 10 ** decimalPoints;
}

export function formatEstimation(ms?: number) {
  if (!ms) {
    return "Estimating";
  } else if (ms < 3600) {
    return new Date(ms * 1000).toISOString();
  } else {
    return new Date(ms * 1000).toISOString().substring(11, 16);
  }
}
