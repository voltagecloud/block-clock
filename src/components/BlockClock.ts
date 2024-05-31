import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { NodeDownloading } from "./NodeDownloading.ts";
import { NodeReady } from "./NodeReady.ts";
import { NodeConnecting } from "./NodeConnecting.ts";
import { DEFAULT_RING_WIDTH, DEFAULT_THEME } from "../utils/constants.ts";
import { BlockClockTheme } from "../lib/types.ts";

export interface BlockClockProps {
  ringWidth: number;
  downloadProgress: number;
  blockHeight: number;
  ringSegments: number[];
  connected: boolean;
  darkMode: boolean;
  downloading: boolean;
  theme: BlockClockTheme;
}

export const BlockClock = ({
  ringWidth = DEFAULT_RING_WIDTH,
  downloadProgress = 0,
  blockHeight = 0,
  connected = false,
  darkMode = true,
  downloading = false,
  ringSegments = [],
  theme = DEFAULT_THEME,
}: BlockClockProps) => {
  const clock = connected
    ? downloading
      ? NodeDownloading({ downloadProgress })
      : NodeReady({ blockHeight, ringWidth, ringSegments, theme })
    : NodeConnecting();

  return html`<div id="wrapper" class=${classMap({ dark: darkMode })}>
    ${clock}
  </div>`;
};
