import { html, svg } from "lit";
import { RingTrack } from "./RingTrack";
import { styleMap } from "lit/directives/style-map.js";
import { RingSegment } from "./RingSegment";
import { DEFAULT_RING_WIDTH } from "../utils/constants";

export interface RingSegmentedProps {
  ringWidth: number;
  segments: number[];
}

export const RingSegmented = ({
  ringWidth = DEFAULT_RING_WIDTH,
  segments,
}: RingSegmentedProps) => {
  return html`
    ${RingTrack({ ringWidth, size: 1 })}
    <svg style="${styleMap(ringStyle)}" class="ring" viewBox="0 0 100 100">
      ${segments.map((segment) => {
        return svg`${RingSegment({ ringWidth, startAngle: 0, endAngle: 90 })}`;
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
