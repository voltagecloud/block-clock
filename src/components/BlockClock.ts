import { html } from "lit";
import { Ring } from "./Ring";
import { BitcoinLogo } from "./BitcoinLogo";
import { Title } from "./Title";
import { Subtitle } from "./Subtitle";
import { numberWithCommas } from "../utils/format.ts";
import { Indicator } from "./Indicator.ts";

export interface BlockClockProps {
  ringWidth: number;
  syncProgress: number;
  blockHeight: number;
  blockTimes: number[];
  syncing: boolean;
  connected: boolean;
}

export const BlockClock = ({
  ringWidth = 2,
  syncProgress = 0,
  blockHeight = 0,
  syncing = false,
  connected = false,
}: BlockClockProps) => {
  const commaDelimitedBlockHeight = numberWithCommas(blockHeight);
  console.log({ syncing, connected });
  return html`
    <div class="circle">
      ${Ring({
        ringFillAngle: syncProgress * 3.6, // 3.6 = 360 / 100
        ringWidth,
      })}
      <div class="content">
        ${BitcoinLogo()} ${Title({ text: commaDelimitedBlockHeight })}
        ${Subtitle({ text: "Blocktime" })} ${Indicator()}
      </div>
    </div>
    <style>
      html,
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

      div.circle {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: black;
        max-height: 100%;
        border-radius: 50%;
        border: 5px solid black;
        aspect-ratio: 1/1;
        container-type: inline-size;
      }

      div.circle > * {
        z-index: 2;
      }

      @container (min-width: 0px) {
        .indicator {
          font-size: 9cqi;
          font-weight: bold;
          color: #808080;
        }

        div.content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2cqi;
        }
      }
    </style>
  `;
};
