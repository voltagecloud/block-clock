import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { NodeDownloading } from "./NodeDownloading.ts";
import { NodeReady } from "./NodeReady.ts";
import { NodeLoading } from "./NodeLoading.ts";
import { BlockClockTheme } from "../lib/types.ts";
import { NodeStopped, StoppedReason } from "./NodeStopped.ts";
import { LogoType } from "./Logo.ts";

export enum BlockClockState {
  Connecting = "Connecting",
  Downloading = "Downloading",
  Ready = "Ready",
  Stopped = "Stopped",
  LoadingBlocks = "Loading Blocks",
}

export interface BlockClockProps {
  state: BlockClockState;
  ringWidth: number;
  downloadProgress: number;
  stoppedReason?: StoppedReason;
  blockHeight: number;
  ringSegments: number[];
  darkMode: boolean;
  theme: BlockClockTheme;
}

function getLogoTypeFromStoppedReason(stoppedReason?: StoppedReason) {
  switch (stoppedReason) {
    case StoppedReason.ErrorGeneral:
      return LogoType.Stop;
    case StoppedReason.ErrorSystemClock:
      return LogoType.Stop;
    case StoppedReason.PausedNoWifi:
      return LogoType.NoWifi;
    case StoppedReason.PausedManual:
      return LogoType.Paused;
    default:
      return undefined;
  }
}

function getClock({
  stoppedReason,
  ringWidth,
  theme,
  downloadProgress,
  blockHeight,
  ringSegments,
  state,
}: Omit<BlockClockProps, "darkMode">) {
  switch (state) {
    case BlockClockState.Stopped:
      return NodeStopped({
        stoppedReason,
        ringWidth,
        logo: getLogoTypeFromStoppedReason(stoppedReason),
      });
    case BlockClockState.Connecting:
      return NodeLoading({
        title: "Connecting",
        subtitle: "Please wait",
        theme,
        ringWidth,
      });
    case BlockClockState.LoadingBlocks:
      return NodeLoading({
        title: "Loading Blocks",
        subtitle: "Please wait",
        theme,
        ringWidth,
      });
    case BlockClockState.Downloading:
      return NodeDownloading({ downloadProgress, ringWidth });
    default:
      return NodeReady({ blockHeight, ringWidth, ringSegments, theme });
  }
}

export const BlockClock = (props: BlockClockProps) => {
  const clock = getClock(props);
  return html`<div id="wrapper" class=${classMap({ dark: props.darkMode })}>
    ${clock}
  </div>`;
};
