import { html } from "lit";
import { RingTrack } from "./RingTrack";
import { styleMap } from "lit/directives/style-map.js";

export interface RingProps {
  ringWidth: number;
  ringFillAngle: number;
  segments: number[];
}

export const Ring = ({ ringFillAngle = 0, ringWidth, segments }: RingProps) => {
  const animatedStyle = {
    transition: "stroke-dasharray 1s ease-in-out",
    "stroke-dasharray": calculateDashArray(ringFillAngle, segments),
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

function normalize(data: number[]) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const normal = data.map((value) => (value - min) / (max - min));
  normal.shift();
  return normal;
}

function differences(data: number[]) {
  let diffs = data.map((value, i) => (i > 0 ? value - data[i - 1] : value));
  // Remove the first element because it is only used for comparison
  diffs[0] = 0;
  return diffs;
}

function getScaleCoefficient(data: number[], filled: number) {
  return filled / data.reduce((acc, val) => acc + val, 0);
}

function calculateDashArray(progress: number, segments: number[], gap = 2) {
  const circumference = Math.PI * (50 * 2);
  // If no progres, no dasharray needs to be calculated
  if (progress <= 0) {
    return `0px ${circumference}`;
  }
  // TODO, progress is simply the time that's passed, filled should be based on the time since the last 12-hour cycle

  const SECONDS = 43200; // 12 hours in seconds
  const diffs = differences(segments);
  const normalized = normalize(diffs);
  const coef = getScaleCoefficient(normalized, filled);
  const proportions = normalized.map((n) => n * coef);
  const dashes = proportions.map((dash) => `${dash}px ${gap}px`).join(" ");
  const remaining = circumference - filled;
  // Need to ensure that remaining always ends as a gap, not a dash
  // If proportions.length is even, last element is gap, else dash
  const dasharray =
    proportions.length % 2 === 0
      ? `${dashes} ${remaining}px`
      : `${dashes} 0px ${remaining}px`;
  console.log({
    dashes,
    filled,
    remaining,
    normalized,
    proportions,
    dasharray,
    diffs,
    coef,
    circumference,
  });

  return dasharray;
}

const ringStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: "0",
  left: "0",
  zIndex: 1,
  transform: "rotate(90deg)",
};
