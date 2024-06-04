import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { IndicatorDot } from "./IndicatorDot";

export const IndicatorLoading = () => {
  const animate = true;
  return html`
    <div style=${styleMap(wrapperStyle)}>
      ${IndicatorDot({ animate })}
      ${IndicatorDot({ animate, animationDelay: 0.1 })}
      ${IndicatorDot({ animate, animationDelay: 0.2 })}
      ${IndicatorDot({ animate, animationDelay: 0.3 })}
      ${IndicatorDot({ animate, animationDelay: 0.4 })}
    </div>
  `;
};

const wrapperStyle = {
  display: "flex",
  "align-items": "center",
  gap: "2cqi",
};
