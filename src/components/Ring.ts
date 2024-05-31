import { html } from "lit";
import { RingTrack } from "./RingTrack";
import { styleMap } from "lit/directives/style-map.js";
import { calculateDashArray } from "../utils/svg";

export interface RingProps {
  ringWidth: number;
  ringFillAngle: number;
}

export const Ring = ({ ringFillAngle = 0, ringWidth }: RingProps) => {
  const animatedStyle = {
    transition: "stroke-dasharray 1s ease-in-out",
    "stroke-dasharray": calculateDashArray(ringFillAngle),
    "stroke-width": ringWidth,
  };

  return html`
    ${RingTrack({ ringWidth, size: 1 })}
    <svg style="${styleMap(ringStyle)}" viewBox="0 0 100 100">
      <path
        style="${styleMap(animatedStyle)}"
        d="
            M 50,
            50 m -${50 - ringWidth / 2},
            0 a ${50 - ringWidth / 2},
            ${50 - ringWidth / 2} 0 1,
            1 ${2 * (50 - ringWidth / 2)},
            0 a ${50 - ringWidth / 2},
            ${50 - ringWidth / 2} 0 1,1 -${2 * (50 - ringWidth / 2)},
            0"
        stroke="yellow"
        stroke-width="${ringWidth}"
        fill="none"
        stroke-linecap="round"
      />
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
  background: "transparent",
};
