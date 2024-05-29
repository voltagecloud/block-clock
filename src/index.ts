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

  render() {
    return html`
      <div class="square">
        <div class="circle">
          <my-ring></my-ring>
          <span class="text">hello</span>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: white;
    }

    div.square {
      height: 200px;
      width: 200px;
      resize: both;
      display: block;
      overflow: hidden;
    }

    div.circle {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      background-color: black;
      max-height: 100%;
      border-radius: 50%;
      border: 1px solid black;
      aspect-ratio: 1/1;
      container-type: inline-size;
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
