import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

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

  render() {
    return html` <div class="square">
      <div class="circle"><span class="text">hello</span></div>
    </div>`;
  }

  // private _onClick() {
  //   this.count++;
  // }

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
      background-color: green;
      max-height: 100%;
      border-radius: 50%;
      aspect-ratio: 1/1;
      container-type: inline-size;
    }

    @container (min-width: 0px) {
      .text {
        font-size: 10cqi;
      }
    }

    /* .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
      transition: filter 300ms;
    } */

    /* ::slotted(h1) {
      font-size: 3.2em;
      line-height: 1.1;
    } */

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
