import { html } from "lit";
import { BlockClockTheme, StoppedReason } from "../lib/types.ts";
import { Logo, LogoType } from "./Logo.ts";
import { BlockClockFrame } from "./BlockClockFrame.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { IndicatorLoading } from "./IndicatorLoading.ts";
import { Ring } from "./Ring.ts";
import { RingSegmented } from "./RingSegmented.ts";
import { numberWithCommas, roundToDecimalPoints } from "../utils/format.ts";
import { BlockClockState } from "../machines/block-clock.ts";
import { IndicatorPeers } from "./IndicatorPeers.ts";
import { RingTrack } from "./RingTrack.ts";
import { IndicatorInactive } from "./IndicatorInactive.ts";

export interface BlockClockProps {
  state: BlockClockState;
  ringWidth: number;
  downloadProgress: number;
  ibdCompletionEstimate?: number;
  stoppedReason?: StoppedReason;
  blocks: number | undefined;
  headers: number | undefined;
  ringSegments: number[];
  darkMode: boolean;
  theme: BlockClockTheme;
  oneHourIntervals: boolean;
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

function isSyncingHeaders({
  blocks,
  headers,
}: {
  blocks: number | undefined;
  headers: number | undefined;
}) {
  return (!blocks && !headers) || (!blocks && headers);
}

function getClock({
  stoppedReason,
  ringWidth,
  theme,
  downloadProgress,
  blocks,
  headers,
  ringSegments,
  state,
  darkMode,
}: BlockClockProps) {
  const _isSyncingHeaders = isSyncingHeaders({ blocks, headers });
  switch (state) {
    case BlockClockState.Stopped:
      return BlockClockFrame({
        ringWidth,
        top: Logo({ logo: getLogoTypeFromStoppedReason(stoppedReason) }),
        middle: Title({ text: "Stopped" }),
        lowerMiddle: Subtitle({ text: stoppedReason }),
        bottom: IndicatorInactive(),
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
    case BlockClockState.ErrorConnecting:
      return BlockClockFrame({
        ringWidth,
        top: Logo({ logo: LogoType.Paused }),
        middle: Title({ text: "Error" }),
        lowerMiddle: Subtitle({ text: "RPC Connect Fail" }),
        darkMode,
      });
    case BlockClockState.WaitingIBD:
      return BlockClockFrame({
        ringWidth,
        ring: _isSyncingHeaders
          ? undefined
          : Ring({ ringFillAngle: downloadProgress * 100 * 3.6, ringWidth }),
        top: Logo({ logo: LogoType.Bitcoin }),
        middle: Title({
          text: _isSyncingHeaders ? "Syncing" : "Downloading",
        }),
        lowerMiddle: Subtitle({
          text: _isSyncingHeaders
            ? "Please Wait"
            : `${roundToDecimalPoints(downloadProgress * 100, 2)}%`,
        }),
        bottom: IndicatorLoading(),
        darkMode,
      });
    default:
      return BlockClockFrame({
        ringWidth,
        ringTrack: RingTrack({ ringWidth, size: 1, withPoints: true }),
        ring: RingSegmented({ ringWidth, ringSegments, theme }),
        top: Logo({ logo: LogoType.Bitcoin }),
        middle: Title({ text: numberWithCommas(blocks), scale: 1.2 }),
        lowerMiddle: Subtitle({ text: `Blocktime` }),
        bottom: IndicatorPeers(),
        darkMode,
      });
  }
}

export const BlockClock = (props: BlockClockProps) => {
  const clock = getClock(props);
  return html`${clock}`;
};
