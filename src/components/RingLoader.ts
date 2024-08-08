import { css, html } from "lit";
import { RingTrack } from "./RingTrack";
import { styleMap } from "lit/directives/style-map.js";
import { calculateDashArray } from "../utils/svg";
import { BlockClockTheme } from "../lib/types";

export interface RingLoaderProps {
  ringWidth: number;
  ringFillAngle: number;
  theme: BlockClockTheme;
}

export const RingLoader = ({
  ringFillAngle = 180,
  ringWidth,
  theme,
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
    background: "transparent",
    animation: "rotate 2s linear infinite",
    "transform-origin": "center",
  };
  const styles = css`
    @keyframes rotate {
      from {
        transform: rotate(-90deg);
      }
      to {
        transform: rotate(280deg);
      }
    }

    .rotating-svg {
      animation: rotate 2s linear infinite;
      transform-origin: center;
    }
  `;

  const themeColor = theme.colors.blockConfirmationColors?.at(-1) || "#eed349";

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
      <defs>
        <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="$stop-color:${themeColor};stop-opacity:0" />
          <stop offset="100%" style="stop-color:${themeColor};stop-opacity:1" />
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
        stroke="url(#fadeGradient)"
        stroke-width="${ringWidth}"
        stroke-linecap="round"
        fill="none"
      />
    </svg>
  `;
};
