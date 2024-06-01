import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { NodeDownloading } from "./NodeDownloading.ts";
import { NodeReady } from "./NodeReady.ts";
import { NodeConnecting } from "./NodeConnecting.ts";
import { DEFAULT_RING_WIDTH, DEFAULT_THEME } from "../utils/constants.ts";
import { BlockClockTheme } from "../lib/types.ts";
import { NodeStopped, StoppedReason } from "./NodeStopped.ts";

export interface BlockClockProps {
  ringWidth: number;
  downloadProgress: number;
  stoppedReason: StoppedReason | undefined;
  blockHeight: number;
  segments: number[];
  connected: boolean;
  darkMode: boolean;
  downloading: boolean;
  theme: BlockClockTheme;
}

function getClock(
  connected: boolean,
  downloading: boolean,
  stoppedReason: StoppedReason | undefined,
  theme: BlockClockTheme,
  downloadProgress: number,
  blockHeight: number,
  ringWidth: number,
  segments: number[]
) {
  switch (true) {
    case stoppedReason !== undefined:
      return NodeStopped({ stoppedReason, ringWidth });
    case !connected:
      return NodeConnecting({ theme, ringWidth });
    case downloading:
      return NodeDownloading({ downloadProgress, ringWidth });
    default:
      return NodeReady({ blockHeight, ringWidth, segments, theme });
  }
}

export const BlockClock = ({
  ringWidth = DEFAULT_RING_WIDTH,
  downloadProgress = 0,
  stoppedReason = undefined,
  blockHeight = 0,
  connected = false,
  darkMode = true,
  downloading = false,
  segments = [],
  theme = DEFAULT_THEME,
}: BlockClockProps) => {
  const baseClass = { circle: true, dark: darkMode };

  const clock = getClock(
    connected,
    downloading,
    stoppedReason,
    theme,
    downloadProgress,
    blockHeight,
    ringWidth,
    segments
  );

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
