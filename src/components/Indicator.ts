import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { IndicatorDot } from "./IndicatorDot";

export const Indicator = () => {
  return html`
    <div style=${styleMap(wrapperStyle)}>
      ${IndicatorDot()} ${IndicatorDot()} ${IndicatorDot()} ${IndicatorDot()}
      ${IndicatorDot()}
    </div>
  `;
};

const wrapperStyle = {
  display: "flex",
  "align-items": "center",
  gap: "2cqi",
};
