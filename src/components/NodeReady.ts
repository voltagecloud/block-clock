import { html } from "lit";
import { Logo, LogoType } from "./Logo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";
import { numberWithCommas } from "../utils/format.ts";
import { RingSegmented } from "./RingSegmented.ts";
import { DEFAULT_RING_WIDTH } from "../utils/constants.ts";
import { BlockClockTheme } from "../lib/types.ts";

export interface NodeReadyProps {
  blockHeight: number;
  ringWidth: number;
  ringSegments: number[];
  theme: BlockClockTheme;
}

export const NodeReady = ({
  ringWidth = DEFAULT_RING_WIDTH,
  blockHeight,
  ringSegments,
  theme,
}: NodeReadyProps) => {
  return html`
    ${RingSegmented({ ringWidth, ringSegments, theme })}
    <div class="content">
      ${Logo({ logo: LogoType.Bitcoin })}
      ${Title({ text: numberWithCommas(blockHeight) })}
      ${Subtitle({ text: "Blocktime" })} ${Indicator()}
    </div>
  `;
};
