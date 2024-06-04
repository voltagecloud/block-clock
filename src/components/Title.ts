import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

const DEFAULT_FONT_SIZE = 11;

export interface TitleProps {
  text: string;
  scale?: number;
}

export const Title = ({ text, scale }: TitleProps) => {
  const size = scale ? DEFAULT_FONT_SIZE * scale : DEFAULT_FONT_SIZE;
  const style = {
    "font-size": `${size}cqi`,
    "font-weight": "800",
    color: "var(--title-text-color, white)",
  };
  return html`<span style="${styleMap(style)}">${text}</span>`;
};
