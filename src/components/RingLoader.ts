import { css, html } from "lit";
import { RingTrack } from "./RingTrack";
import { styleMap } from "lit/directives/style-map.js";
import { calculateDashArray } from "../utils/svg";

export interface RingLoaderProps {
  ringWidth: number;
  ringFillAngle: number;
}

export const RingLoader = ({
  ringFillAngle = 0,
  ringWidth,
}: RingLoaderProps) => {
  const animatedStyle = {
    transition: "stroke-dasharray 1s ease-in-out",
    "stroke-dasharray": calculateDashArray(ringFillAngle),
    "stroke-width": ringWidth,
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
    animation: "rotate 2s linear infinite",
    "transform-origin": "center",
  };

  const styles = css`
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .rotating-svg {
      animation: rotate 2s linear infinite;
      transform-origin: center;
    }
  `;

  return html`
    <style>
      ${styles}
    </style>
    ${RingTrack({ ringWidth, size: 1 })}
    <svg
      class="rotating-svg"
      style="${styleMap(ringStyle)}"
      viewBox="0 0 100 100"
    >
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
