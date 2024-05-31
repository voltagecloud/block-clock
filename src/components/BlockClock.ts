import { html } from "lit";
import { numberWithCommas } from "../utils/format.ts";
import { classMap } from "lit/directives/class-map.js";
import { NodeDownloading } from "./NodeDownloading.ts";
import { NodeReady } from "./NodeReady.ts";
import { NodeConnecting } from "./NodeConnecting.ts";

export interface BlockClockProps {
  ringWidth: number;
  downloadProgress: number;
  blockHeight: number;
  blockTimes: number[];
  connected: boolean;
  darkMode: boolean;
  downloading: boolean;
}

export const BlockClock = ({
  ringWidth = 2,
  downloadProgress = 0,
  blockHeight = 0,
  connected = false,
  darkMode = true,
  downloading = false,
}: BlockClockProps) => {
  const commaDelimitedBlockHeight = numberWithCommas(blockHeight);
  const baseClass = { circle: true, dark: darkMode };

  const clock = connected
    ? downloading
      ? NodeDownloading({ downloadProgress })
      : NodeReady({ blockHeight })
    : NodeConnecting();

  return html`
    <div class=${classMap(baseClass)}>${clock}</div>
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
        background-color: var(--bg-color, black);
        max-height: 100%;
        border-radius: 50%;
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

      /** Theme */
      :root {
        --title-text-color: #333;
        --subtitle-text-color: #666;
        --bg-color: white;
        --ring-track-color: #ccc;
      }

      :root .dark {
        --title-text-color: white;
        --subtitle-text-color: #808080;
        --bg-color: black;
        --ring-track-color: #333;
      }
    </style>
  `;
};
