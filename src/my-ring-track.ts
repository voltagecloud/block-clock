import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("my-ring-track")
export class RingTrack extends LitElement {
  @property({ type: Number })
  ringWidth = 2;

  @property({ type: Number })
  size = 1;

  render() {
    return html`
      <svg class="ring" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r=${50 - this.ringWidth / 2}
          stroke="#333"
          stroke-width="${this.ringWidth * this.size}"
        />
      </svg>
    `;
  }

  static styles = css`
    .ring {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
      transform: rotate(-90deg); /* Start fill from the top */
    }
  `;
}
