import { svg } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { RingSegment } from "./RingSegment";
import { DEFAULT_RING_WIDTH } from "../utils/constants";
import { BlockClockTheme } from "../lib/types";

export interface RingSegmentedProps {
  ringWidth: number;
  ringSegments: number[];
  theme: BlockClockTheme;
}

export const RingSegmented = ({
  ringWidth = DEFAULT_RING_WIDTH,
  ringSegments,
  theme,
}: RingSegmentedProps) => {
  const arcs = segmentsToArcs(ringSegments);

  // Function to transform ringSegments into start and end angles

  return svg`
    <svg style="${styleMap(ringStyle)}" class="ring" viewBox="0 0 100 100">
      ${arcs.map(({ start, end }, i) => {
        const indexFromLast = arcs.length - i - 1;
        return svg`${RingSegment({
          ringWidth,
          startAngle: start,
          endAngle: end,
          color: getBlockConfirmationColor(theme, indexFromLast),
        })}`;
      })};
    </svg>
  `;
};

const ringStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: "0",
  left: "0",
  zIndex: 1,
};

function segmentsToArcs(ringSegments: number[]) {
  return ringSegments.reduce(
    (acc: { start: number; end: number }[], segment: any, index: number) => {
      const start = acc[index - 1]?.end || 0;
      const end = start + segment;
      return [...acc, { start, end }];
    },
    []
  );
}

function getBlockConfirmationColor(theme: BlockClockTheme, index: number) {
  return (
    theme.colors.blockConfirmationColors[index] ||
    theme.colors.blockConfirmationColors.at(-1) || // Fallback to last color
    "#eed349" // or our default theme
  );
}
