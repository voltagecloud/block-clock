import { html } from "lit";
import { Logo, LogoType } from "./Logo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";
import { RingTrack } from "./RingTrack.ts";

export enum StoppedReason {
  PausedNoWifi = "No wifi",
  PausedNotPluggedIn = "Not plugged in",
  PausedManual = "Tap to resume",
  ErrorSystemClock = "System clock",
  ErrorGeneral = "Tap for details",
}

interface NodeStoppedProps {
  stoppedReason: StoppedReason;
  ringWidth: number;
  logo: LogoType;
}

export const NodeStopped = ({
  stoppedReason,
  ringWidth,
  logo,
}: NodeStoppedProps) => {
  const titleText =
    stoppedReason === StoppedReason.ErrorGeneral ||
    stoppedReason === StoppedReason.ErrorSystemClock
      ? "Error"
      : "Paused";
  return html`
    ${RingTrack({ ringWidth, size: 1 })}
    <div class="content">
      ${Logo({ logo })} ${Title({ text: titleText })}
      ${Subtitle({ text: stoppedReason })} ${Indicator()}
    </div>
  `;
};
