import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

const DEFAULT_FONT_SIZE = 8;

export interface SubtitleProps {
  text?: string;
  scale?: number;
}

export const Subtitle = ({ text, scale }: SubtitleProps) => {
  const size = scale ? DEFAULT_FONT_SIZE * scale : DEFAULT_FONT_SIZE;
  const style = {
    color: "var(--subtitle-text-color, #808080)",
    "font-size": `${size}cqi`,
    "font-weight": "700",
  };

  return html` <span style="${styleMap(style)}">${text}</span> `;
};
