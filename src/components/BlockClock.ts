import { html } from "lit";
import { BlockClockTheme } from "../lib/types.ts";
import { Logo, LogoType } from "./Logo.ts";
import { BlockClockFrame } from "./BlockClockFrame.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Ring } from "./Ring.ts";
import { RingSegmented } from "./RingSegmented.ts";
import { numberWithCommas, roundToDecimalPoints } from "../utils/format.ts";
import { BlockClockState } from "../machines/block-clock.ts";
import { RingTrack } from "./RingTrack.ts";

export interface BlockClockProps {
  state: BlockClockState;
  ringWidth: number;
  downloadProgress: number;
  ibdCompletionEstimate?: number;
  blocks: number | undefined;
  headers: number | undefined;
  ringSegments: number[];
  darkMode: boolean;
  theme: BlockClockTheme;
  oneHourIntervals: boolean;
  isLoadingBlockIndex: boolean;
  isStopped: boolean;
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

// This happens when verification progress = 1, blocks < headers and initial block download = 1
function isSnapshottingBlocks({
  blocks,
  headers,
  downloadProgress,
}: {
  blocks: number | undefined;
  headers: number | undefined;
  downloadProgress: number | undefined;
}) {
  return downloadProgress == 1 && (blocks || 0) < (headers || 0);
}

function getClock({
  ringWidth,
  theme,
  downloadProgress,
  blocks,
  headers,
  ringSegments,
  state,
  darkMode,
  isLoadingBlockIndex,
}: BlockClockProps) {
  const _isSyncingHeaders = isSyncingHeaders({
    blocks,
    headers,
  });
  const _isSnapshottingBlocks = isSnapshottingBlocks({
    blocks,
    headers,
    downloadProgress,
  });
  let _downloadProgress = 0;
  if (_isSnapshottingBlocks) {
    // Use blocks / headers ratio as download progress if snapshotting
    if (headers) {
      _downloadProgress = (blocks || 0) / headers;
    }
  } else {
    _downloadProgress = downloadProgress;
  }
  if (isLoadingBlockIndex) {
    return BlockClockFrame({
      ringWidth,
      top: Logo({ logo: LogoType.Bitcoin }),
      middle: Title({ text: "Block Index" }),
      lowerMiddle: Subtitle({ text: "Loading" }),
      darkMode,
    });
  } else {
    switch (state) {
      case BlockClockState.Stopped:
        return BlockClockFrame({
          ringWidth,
          top: Logo({ logo: LogoType.Stopped }),
          middle: Title({ text: "Stopped" }),
          lowerMiddle: Subtitle({ text: "Node is Offline" }),
          darkMode,
        });
      case BlockClockState.Connecting:
      case BlockClockState.ConnectingRetry:
        return BlockClockFrame({
          ringWidth,
          top: Logo({ logo: LogoType.Bitcoin }),
          middle: Title({ text: "Connecting" }),
          lowerMiddle: Subtitle({ text: "Please Wait" }),
          darkMode,
        });
      case BlockClockState.ErrorConnecting:
        return BlockClockFrame({
          ringWidth,
          top: Logo({ logo: LogoType.Error }),
          middle: Title({ text: "Error" }),
          lowerMiddle: Subtitle({ text: "RPC Connect Fail" }),
          darkMode,
        });
      case BlockClockState.WaitingIBD:
        return BlockClockFrame({
          ringWidth,
          ring: _isSyncingHeaders
            ? undefined
            : Ring({ ringFillAngle: _downloadProgress * 100 * 3.6, ringWidth }),
          top: Logo({ logo: LogoType.Bitcoin }),
          middle: Title({
            text: _isSyncingHeaders ? "Syncing" : "Downloading",
          }),
          lowerMiddle: Subtitle({
            text: _isSyncingHeaders
              ? "Please Wait"
              : `${roundToDecimalPoints(_downloadProgress * 100, 2)}%`,
          }),
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
          darkMode,
        });
    }
  }
}

export const BlockClock = (props: BlockClockProps) => {
  const clock = getClock(props);
  return html`${clock}`;
};
