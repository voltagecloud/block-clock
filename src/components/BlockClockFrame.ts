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
  bottom?: TemplateResult;
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
  const topStyle = {
    ...itemStyle,
    top: !!bottom ? "-26cqi" : "-22cqi",
  };

  const middleStyle = {
    ...itemStyle,
    top: !!bottom ? "-4cqi" : "0cqi",
  };

  const lowerMiddleStyle = {
    ...itemStyle,
    top: !!bottom ? "11cqi" : "15cqi",
  };

  const bottomStyle = {
    ...itemStyle,
    top: "30cqi",
  };

  return html`
    <div class=${classMap({ dark: darkMode })} style=${styleMap(wrapperStyle)}>
      ${ringTrack} ${ring}
      <div style=${styleMap(contentStyle)}>
        ${top && html`<div style=${styleMap(topStyle)}>${top}</div>`}
        ${middle && html`<div style=${styleMap(middleStyle)}>${middle}</div>`}
        ${lowerMiddle &&
        html`<div style=${styleMap(lowerMiddleStyle)}>${lowerMiddle}</div>`}
        ${bottom && html`<div style=${styleMap(bottomStyle)}>${bottom}</div>`}
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
