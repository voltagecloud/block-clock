import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

export interface SegmentProps {
  color: string;
  isStart: boolean;
  isEnd: boolean;
  ringWidth: number;
}

export const Segment = ({ color, isStart, isEnd, ringWidth }: SegmentProps) => {
  const animatedStyle = {
    transition: "stroke-dasharray 1s ease-in-out",
    "stroke-width": ringWidth,
  };
  return html`
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
      stroke="${color}"
      stroke-width="${ringWidth}"
      fill="none"
      stroke-linecap="round"
    ></path>
  `;
};
