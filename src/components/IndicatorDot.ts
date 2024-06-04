import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

interface IndicatorDotProps {
  active?: boolean;
  animate?: boolean;
  animationDelay?: number;
}

export const IndicatorDot = ({
  active = false,
  animate = false,
  animationDelay = 0,
}: IndicatorDotProps = {}) => {
  const classes = classMap({ "animate-pulse": animate });

  const style = styleMap({
    "font-size": "6cqi",
    "font-weight": "bold",
    color:
      active || animate
        ? "var(--title-text-color)"
        : "var(--subtitle-text-color)",
    "animation-delay": `${animationDelay}s`,
  });

  return html` <span class=${classes} style=${style}>•</span> `;
};
