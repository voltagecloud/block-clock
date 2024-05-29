import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("my-ring")
export class Ring extends LitElement {
  @property({ type: Number })
  fill = 180;

  @property({ type: Number })
  ringWidth = 2;

  private calculateDashArray(f: number) {
    const circumference = Math.PI * (50 * 2);
    const progress = (f / 360) * circumference;
    const remaining = circumference - progress;
    return `${progress}px ${remaining}px`;
  }

  render() {
    return html`
      <svg class="ring" viewBox="0 0 100 100">
        <defs>
          <!-- TODO Move around the gradient -->
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: red; stop-opacity: 1" />
            <stop offset="100%" style="stop-color: blue; stop-opacity: 1" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r=${50 - this.ringWidth / 2}
          stroke="yellow"
          stroke-width=${this.ringWidth}
          fill="none"
          style="stroke-dasharray: ${this.calculateDashArray(
            this.fill
          )}; stroke-width: ${this.ringWidth};"
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
