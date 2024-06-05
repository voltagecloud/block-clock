import { TemplateResult, html } from "lit";
import { RingTrack } from "./RingTrack.ts";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";

export interface BlockClockFrameProps {
  ringWidth: number;
  ringTrack?: TemplateResult;
  ring?: TemplateResult;
  top: TemplateResult;
  middle: TemplateResult;
  lowerMiddle: TemplateResult;
  bottom: TemplateResult;
  darkMode: boolean;
}

export const BlockClockFrame = ({
  ringWidth,
  ringTrack = RingTrack({ ringWidth, size: 1 }),
  ring = undefined,
  top,
  middle,
  lowerMiddle,
  bottom,
  darkMode,
}: BlockClockFrameProps) => {
  return html`
    <div class=${classMap({ dark: darkMode })} style=${styleMap(wrapperStyle)}>
      ${ringTrack} ${ring}
      <div style=${styleMap(contentStyle)}>
        <div style=${styleMap(topStyle)}>${top}</div>
        <div style=${styleMap(middleStyle)}>${middle}</div>
        <div style=${styleMap(lowerMiddleStyle)}>${lowerMiddle}</div>
        <div style=${styleMap(bottomStyle)}>${bottom}</div>
      </div>
    </div>
  `;
};

const wrapperStyle = {
  display: "flex",
  "justify-content": "center",
  "align-items": "center",
  "background-color": "var(--bg-color, black)",
  "max-height": "100%",
  "border-radius": "50%",
  "aspect-ratio": "1/1",
  "container-type": "inline-size",
};

const contentStyle = {
  width: "100%",
  height: "100%",
  position: "relative",
};

const itemStyle = {
  position: "absolute",
  display: "flex",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
};

const topStyle = {
  ...itemStyle,
  top: "-26cqi",
};

const middleStyle = {
  ...itemStyle,
  top: "-4cqi",
};

const lowerMiddleStyle = {
  ...itemStyle,
  top: "11cqi",
};

const bottomStyle = {
  ...itemStyle,
  top: "30cqi",
};