import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

export interface TitleProps {
  text: string;
}

export const Title = ({ text }: TitleProps) => {
  return html`<span style="${styleMap(style)}">${text}</span>`;
};

const style = {
  "font-size": "15cqi",
  "font-weight": "bold",
  color: "var(--title-text-color, white)",
};
