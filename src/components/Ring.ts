import { html } from "lit";
import { RingTrack } from "./RingTrack";
import { styleMap } from "lit/directives/style-map.js";

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
    <svg style="${styleMap(ringStyle)}" class="ring" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color: red; stop-opacity: 1" />
          <stop offset="100%" style="stop-color: blue; stop-opacity: 1" />
        </linearGradient>
      </defs>
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

function calculateDashArray(f: number) {
  const circumference = Math.PI * (50 * 2);
  const progress = (f / 360) * circumference;
  const remaining = circumference - progress;
  return `${progress}px ${remaining}px`;
}

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
