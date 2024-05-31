import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

export interface RingTrackProps {
  ringWidth: number;
  size: number;
}

export const RingTrack = ({ ringWidth, size }: RingTrackProps) => {
  return html`
    <svg viewBox="0 0 100 100" style=${styleMap(styles.svg)}>
      <circle
        style=${styleMap(styles.svgCircle)}
        cx="50"
        cy="50"
        r=${50 - ringWidth / 2}
        stroke-width="${ringWidth * size}"
      />
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
    transform: "rotate(-90deg)",
    fill: "none",
  },
  svgCircle: {
    stroke: "var(--ring-track-color, #333)",
  },
};
