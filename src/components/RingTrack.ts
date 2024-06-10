import { html, svg } from "lit";
import { styleMap } from "lit/directives/style-map.js";

export interface RingTrackProps {
  withPoints?: boolean;
  ringWidth: number;
  size: number;
}

export const RingTrack = ({ ringWidth, size, withPoints }: RingTrackProps) => {
  const pointScale = 0.25;
  const pointArrays = [
    30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360,
  ].map((angle) => convertAngleToCxCyAroundCircle(angle, ringWidth));
  const pointSize = ringWidth * size * pointScale;
  return html`
    <svg viewBox="0 0 100 100" style=${styleMap(styles.svg)}>
      <circle
        style=${styleMap(styles.svgCircle)}
        cx="50"
        cy="50"
        r=${50 - ringWidth / 2}
        stroke-width="${ringWidth * size}"
      />
      ${withPoints
        ? pointArrays.map(
            ({ cx, cy }) => svg`
          <circle
            class="animate-pulse"
            style=${styleMap(styles.svgPoint)}
            cx=${cx}
            cy=${cy}
            r=${pointSize}
          />
        `
          )
        : undefined}
    </svg>
  `;
};

const styles = {
  svg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: "0",
    left: "0",
    zIndex: 1,
    fill: "none",
  },
  svgCircle: {
    stroke: "var(--ring-track-color, #333)",
  },
  svgPoint: {
    fill: "var(--ring-point-color, #333)",
  },
};

function convertAngleToCxCyAroundCircle(angle: number, ringWidth: number) {
  const radians = (angle * Math.PI) / 180;
  const cx = 50 + Math.sin(radians) * (50 - ringWidth * 0.5);
  const cy = 50 - Math.cos(radians) * (50 - ringWidth * 0.5);
  return { cx, cy };
}
