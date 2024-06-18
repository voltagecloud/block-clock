import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { IndicatorDot } from "./IndicatorDot";

export const IndicatorInactive = () => {
  return html`
    <div style=${styleMap(wrapperStyle)}>
      ${IndicatorDot({ active: false })} ${IndicatorDot({ active: false })}
      ${IndicatorDot({ active: false })} ${IndicatorDot({ active: false })}
      ${IndicatorDot({ active: false })}
    </div>
  `;
};

const wrapperStyle = {
  display: "flex",
  "align-items": "center",
  gap: "1cqi",
};
