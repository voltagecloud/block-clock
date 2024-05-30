import { html } from "lit";
import { RingTrack } from "./RingTrack";
import { styleMap } from "lit/directives/style-map.js";
import { Segment } from "./Segment";

export interface RingSegmentsProps {
  ringWidth: number;
  ringFillAngle: number;
  segments: number[];
}

export const RingSegments = ({ ringWidth, segments }: RingSegmentsProps) => {
  return html`
    ${RingTrack({ ringWidth, size: 1 })}
    <svg style="${styleMap(ringStyle)}" class="ring" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: red; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: blue; stop-opacity: 1" />
        </linearGradient>
      </defs>
      ${Segment({
        ringWidth,
        color: "yellow",
        isStart: true,
        isEnd: false,
      })}
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
  transform: "rotate(90deg)",
};
