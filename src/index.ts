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
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
    mode: "closed",
  };
  /**
   * Copy for the read the docs hint.
   */
  // @property()
  // docsHint = "Click on the Vite and Lit logos to learn more";

  /**
   * True if dark mode is active.
   */
  // @property({ type: Boolean })
  // darkMode = true;

  @property({ type: Number })
  ringWidth = 2;

  @property({ type: Number })
  syncProgress = 10;

  render() {
    return html`
      <div class="square">
        <div class="circle">
          <my-ring
            ringFillAngle="${this.syncProgress * 3.6}"
            ringWidth="${this.ringWidth}"
          ></my-ring>
          <div class="content">
            <div class="bitcoin-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 30 30"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M11.3731 29.5522C19.4187 31.5549 27.5525 26.651 29.5541 18.6202C31.5508 10.5845 26.6548 2.42609 18.6043 0.447842C10.5784 -1.55495 2.44943 3.34895 0.447856 11.3798C-1.55372 19.4106 3.34229 27.5445 11.3731 29.5522ZM18.6922 9.29308C20.7755 10 22.2951 11.0457 22.0255 13.0486C21.8196 14.5066 21.0255 15.2185 19.9275 15.4688C21.4275 16.2396 22.1775 17.408 21.4912 19.4551C20.6383 22.0226 18.5353 22.2533 15.7216 21.7526L15.0745 24.487L13.4275 24.0893L14.0745 21.3991C13.6579 21.296 13.2216 21.188 12.7608 21.0653L12.1138 23.7752L10.4667 23.3775L11.1138 20.6431C10.8873 20.5775 10.6518 20.5209 10.4128 20.4635C10.2585 20.4264 10.1028 20.389 9.94709 20.3486L7.80003 19.8478L8.57944 17.948C8.57944 17.948 9.80984 18.2621 9.79023 18.2425C10.2461 18.3456 10.4569 18.0511 10.5402 17.8449L11.5402 13.5248C11.5721 13.5346 11.5978 13.5395 11.6236 13.5444C11.6493 13.5493 11.675 13.5542 11.7069 13.5641C11.6657 13.5355 11.6265 13.5254 11.592 13.5165C11.5732 13.5117 11.5558 13.5072 11.5402 13.5002L12.2706 10.4124C12.2951 10.0785 12.1677 9.64163 11.501 9.47472C11.5451 9.45017 10.3147 9.18017 10.3147 9.18017L10.7314 7.42759L13.001 7.97251C13.1775 8.01424 13.3552 8.05106 13.5329 8.08787C13.7106 8.12469 13.8883 8.16151 14.0647 8.20324L14.7118 5.49337L16.3785 5.89102L15.751 8.54197C16.1873 8.63034 16.6285 8.73343 17.0647 8.83652L17.6922 6.18557L19.3392 6.58321L18.6922 9.29308ZM13.565 19.1503C14.8893 19.4905 17.8756 20.2575 18.3196 18.3652C18.7665 16.4478 15.967 15.8441 14.5623 15.5412C14.3954 15.5052 14.2482 15.4735 14.1285 15.4443L13.2755 19.0771C13.3593 19.0975 13.4566 19.1225 13.565 19.1503ZM14.7512 13.8376C15.8558 14.1232 18.37 14.7733 18.7755 13.0486C19.1868 11.3176 16.8404 10.8149 15.6799 10.5663C15.5404 10.5365 15.418 10.5102 15.3196 10.486L14.5255 13.7801C14.5916 13.7964 14.6673 13.8159 14.7512 13.8376Z"
                  fill="white"
                />
              </svg>
            </div>
            <span class="title">763,187</span>
            <span class="subtitle">Blocktime</span>
            <span class="indicator">.....</span>
          </div>
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
      text-align: left;
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
      background-color: black;
      max-height: 100%;
      border-radius: 50%;
      border: 1px solid black;
      aspect-ratio: 1/1;
      container-type: inline-size;
    }

    div.circle > * {
      z-index: 2;
    }

    span {
      z-index: 2;
    }

    @container (min-width: 0px) {
      .title {
        font-size: 15cqi;
        font-weight: bold;
      }
      .subtitle {
        font-size: 9cqi;
        font-weight: bold;
        color: #808080;
      }
      .indicator {
        font-size: 9cqi;
        font-weight: bold;
        color: #808080;
      }

      .bitcoin-logo,
      .bitcoin-logo > svg {
        width: 14cqi;
        height: 14cqi;
      }

      .bitcoin-logo > svg {
        position: absolute;
      }

      div.content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2cqi;
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
