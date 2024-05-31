import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

// TODO

export const Indicator = () => {
  return html` <span style="${styleMap(style)}">....</span> `;
};

const style = {
  "font-size": "9cqi",
  "font-weight": "bold",
  color: "#808080",
};
