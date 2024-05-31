// Function to format number with commas i.e. 1000000 -> 1,000,000
export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
