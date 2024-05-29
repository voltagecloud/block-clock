import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./my-ring-track.ts";

@customElement("my-ring")
export class Ring extends LitElement {
  @property({ type: Number })
  ringFillAngle = 0;

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
      <my-ring-track ringWidth="${this.ringWidth}"></my-ring-track>
      <svg class="ring" viewBox="0 0 100 100">
        <defs>
          <!-- TODO Move around the gradient -->
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: red; stop-opacity: 1" />
            <stop offset="100%" style="stop-color: blue; stop-opacity: 1" />
          </linearGradient>
        </defs>
        <path
          class="animated"
          d="
            M 50,
            50 m -${50 - this.ringWidth / 2},
            0 a ${50 - this.ringWidth / 2},
            ${50 - this.ringWidth / 2} 0 1,
            1 ${2 * (50 - this.ringWidth / 2)},
            0 a ${50 - this.ringWidth / 2},
            ${50 - this.ringWidth / 2} 0 1,1 -${2 * (50 - this.ringWidth / 2)},
            0"
          stroke="yellow"
          stroke-width="${this.ringWidth}"
          fill="none"
          stroke-linecap="round"
          style="stroke-dasharray: ${this.calculateDashArray(
            this.ringFillAngle
          )}; stroke-width: ${this.ringWidth};"
        />
      </svg>
    `;
  }

  static styles = css`
    .animated {
      transition: stroke-dasharray 1s ease-in-out;
    }
    .ring {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
      transform: rotate(90deg); /* Start fill from the top */
    }
  `;
}
