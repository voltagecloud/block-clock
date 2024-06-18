import { BlockClockTheme } from "../lib/types";

export const DEFAULT_RING_WIDTH = 2;
export const DEFAULT_TRIM_SIZE = 1.5; // Multiplier of ring width
export const DEFAULT_THEME: BlockClockTheme = {
  colors: {
    blockConfirmationColors: [
      "#666",
      "#EC5445", // red
      "#ED6F47",
      "#EE8847", // orange
      "#EFA149",
      "#EFBA47",
      "yellow", // yellow
    ],
  },
};
