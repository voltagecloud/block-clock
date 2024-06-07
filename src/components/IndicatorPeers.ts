import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { IndicatorDot } from "./IndicatorDot";

// TODO
export const IndicatorPeers = () => {
  return html`
    <div style=${styleMap(wrapperStyle)}>
      ${IndicatorDot({ active: true })} ${IndicatorDot({ active: true })}
      ${IndicatorDot({ active: true })} ${IndicatorDot({ active: true })}
      ${IndicatorDot({ active: true })}
    </div>
  `;
};

const wrapperStyle = {
  display: "flex",
  "align-items": "center",
  gap: "1cqi",
};
