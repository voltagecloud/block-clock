import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("my-ring")
export class Ring extends LitElement {
  @property({ type: Number })
  fill = 360;

  @property({ type: Number })
  ringWidth = 4;

  private calculateDashArray(f: number) {
    const circumference = Math.PI * (50 * 2);
    const progress = (f / 360) * circumference;
    const remaining = circumference - progress;
    return `${progress}px ${remaining}px`;
  }

  render() {
    return html`
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        color="#3f51b5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="spinner-secondHalf">
            <stop offset="0%" stop-opacity="0" stop-color="currentColor" />
            <stop offset="100%" stop-opacity="0.5" stop-color="currentColor" />
          </linearGradient>
          <linearGradient id="spinner-firstHalf">
            <stop offset="0%" stop-opacity="1" stop-color="currentColor" />
            <stop offset="100%" stop-opacity="0.5" stop-color="currentColor" />
          </linearGradient>
        </defs>

        <g stroke-width="8">
          <path
            stroke="url(#spinner-secondHalf)"
            d="M 4 100 A 96 96 0 0 1 196 100"
          />
          <path
            stroke="url(#spinner-firstHalf)"
            d="M 196 100 A 96 96 0 0 1 4 100"
          />

          <!-- 1deg extra path to have the round end cap -->
          <path
            stroke="currentColor"
            stroke-linecap="round"
            d="M 4 100 A 96 96 0 0 1 4 98"
          />
        </g>

        <animateTransform
          from="0 0 0"
          to="360 0 0"
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1300ms"
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
