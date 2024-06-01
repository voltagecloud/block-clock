import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { NodeDownloading } from "./NodeDownloading.ts";
import { NodeReady } from "./NodeReady.ts";
import { NodeConnecting } from "./NodeConnecting.ts";
import { DEFAULT_RING_WIDTH, DEFAULT_THEME } from "../utils/constants.ts";
import { BlockClockTheme } from "../lib/types.ts";
import { NodeStopped, StoppedReason } from "./NodeStopped.ts";
import { LogoType } from "./Logo.ts";

export interface BlockClockProps {
  ringWidth: number;
  downloadProgress: number;
  stoppedReason: StoppedReason | undefined;
  blockHeight: number;
  ringSegments: number[];
  connected: boolean;
  darkMode: boolean;
  downloading: boolean;
  theme: BlockClockTheme;
}

function getLogoTypeFromStoppedReason(stoppedReason: StoppedReason) {
  switch (stoppedReason) {
    case StoppedReason.ErrorGeneral:
      return LogoType.Stop;
    case StoppedReason.ErrorSystemClock:
      return LogoType.Stop;
    case StoppedReason.PausedNoWifi:
      return LogoType.NoWifi;
    default:
      return LogoType.Paused;
  }
}

function getClock(
  connected: boolean,
  downloading: boolean,
  stoppedReason: StoppedReason | undefined,
  theme: BlockClockTheme,
  downloadProgress: number,
  blockHeight: number,
  ringWidth: number,
  ringSegments: number[]
) {
  switch (true) {
    case stoppedReason !== undefined:
      return NodeStopped({
        stoppedReason,
        ringWidth,
        logo: getLogoTypeFromStoppedReason(stoppedReason),
      });
    case !connected:
      return NodeConnecting({ theme, ringWidth });
    case downloading:
      return NodeDownloading({ downloadProgress, ringWidth });
    default:
      return NodeReady({ blockHeight, ringWidth, ringSegments, theme });
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
  ringSegments = [],
  theme = DEFAULT_THEME,
}: BlockClockProps) => {
  const clock = getClock(
    connected,
    downloading,
    stoppedReason,
    theme,
    downloadProgress,
    blockHeight,
    ringWidth,
    ringSegments
  );

  return html`<div id="wrapper" class=${classMap({ dark: darkMode })}>
    ${clock}
  </div>`;
};
