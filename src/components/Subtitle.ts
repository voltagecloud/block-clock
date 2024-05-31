import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

export interface SubtitleProps {
  text: string;
}

export const Subtitle = ({ text }: SubtitleProps) => {
  return html` <span style="${styleMap(style)}">${text}</span> `;
};

const style = {
  color: "var(--subtitle-text-color, #808080)",
  "font-size": "9cqi",
  "font-weight": "bold",
};
