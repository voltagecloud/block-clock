import { html } from "lit";
import {
  BlockClockState,
  BlockClockTheme,
  StoppedReason,
} from "../lib/types.ts";
import { Logo, LogoType } from "./Logo.ts";
import { BlockClockFrame } from "./BlockClockFrame.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { IndicatorLoading } from "./IndicatorLoading.ts";
import { Ring } from "./Ring.ts";
import { RingSegmented } from "./RingSegmented.ts";
import { numberWithCommas } from "../utils/format.ts";

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
  darkMode,
}: BlockClockProps) {
  switch (state) {
    case BlockClockState.Stopped:
      return BlockClockFrame({
        ringWidth,
        top: Logo({ logo: getLogoTypeFromStoppedReason(stoppedReason) }),
        middle: Title({ text: "Stopped" }),
        lowerMiddle: Subtitle({ text: stoppedReason }),
        bottom: IndicatorLoading(),
        darkMode,
      });
    case BlockClockState.Connecting:
      return BlockClockFrame({
        ringWidth,
        top: Logo({ logo: LogoType.Bitcoin }),
        middle: Title({ text: "Connecting" }),
        lowerMiddle: Subtitle({ text: "Please Wait" }),
        bottom: IndicatorLoading(),
        darkMode,
      });
    case BlockClockState.LoadingBlocks:
      return BlockClockFrame({
        ringWidth,
        top: Logo({ logo: LogoType.Bitcoin }),
        middle: Title({ text: "Loading Blocks" }),
        lowerMiddle: Subtitle({ text: "Please Wait" }),
        bottom: IndicatorLoading(),
        darkMode,
      });
    case BlockClockState.Downloading:
      return BlockClockFrame({
        ringWidth,
        ring: Ring({ ringFillAngle: downloadProgress * 3.6, ringWidth }),
        top: Logo({ logo: LogoType.Bitcoin }),
        middle: Title({ text: "Downloading" }),
        lowerMiddle: Subtitle({ text: "Please Wait" }),
        bottom: IndicatorLoading(),
        darkMode,
      });
    default:
      return BlockClockFrame({
        ringWidth,
        ring: RingSegmented({ ringWidth, ringSegments, theme }),
        top: Logo({ logo: LogoType.Bitcoin }),
        middle: Title({ text: numberWithCommas(blockHeight), scale: 1.2 }),
        lowerMiddle: Subtitle({ text: `Blocktime` }),
        bottom: IndicatorLoading(),
        darkMode,
      });
  }
}

export const BlockClock = (props: BlockClockProps) => {
  const clock = getClock(props);
  return html`${clock}`;
};
