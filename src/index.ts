import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./my-ring.ts";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("block-clock")
export class Blockclock extends LitElement {
  /**
   * Copy for the read the docs hint.
   */
  @property()
  docsHint = "Click on the Vite and Lit logos to learn more";

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  /**
   * True if dark mode is active.
   */
  @property({ type: Boolean })
  darkMode = true;

  @property({ type: Number })
  ringWidth = 4;

  @property({ type: Number })
  fill = 360;

  private calculateDashArray(f: number) {
    const circumference = Math.PI * (50 * 2);
    const progress = (f / 360) * circumference;
    const remaining = circumference - progress;
    return `${progress}px ${remaining}px`;
  }

  render() {
    return html`
      <div class="square">
        <div class="circle">
          <svg class="ring" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r=${50 - this.ringWidth / 2}
              stroke="blue"
              stroke-width=${this.ringWidth}
              fill="none"
              style="stroke-dasharray: ${this.calculateDashArray(
                this.fill
              )}; stroke-width: ${this.ringWidth};"
            />
          </svg>
          <span class="text">hello</span>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    div.square {
      height: 200px;
      width: 200px;
      background-color: red;
      resize: both;
      display: block;
      overflow: hidden;
    }

    div.circle {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      background-color: green;
      max-height: 100%;
      border-radius: 50%;
      aspect-ratio: 1/1;
      container-type: inline-size;
    }

    .ring {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
      transform: rotate(-90deg); /* Start fill from the top */
    }

    .text {
      position: relative;
      z-index: 2;
    }

    @container (min-width: 0px) {
      .text {
        font-size: 10cqi;
      }
    }

    @media (prefers-color-scheme: light) {
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "block-clock": Blockclock;
  }
}
