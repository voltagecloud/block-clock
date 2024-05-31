import { html } from "lit";
import { BitcoinLogo } from "./BitcoinLogo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";
import { numberWithCommas } from "../utils/format.ts";
import { RingSegmented } from "./RingSegmented.ts";
import { DEFAULT_RING_WIDTH } from "../utils/constants.ts";

export interface NodeReadyProps {
  blockHeight: number;
  ringWidth: number;
  segments: number[];
}

export const NodeReady = ({
  ringWidth = DEFAULT_RING_WIDTH,
  blockHeight,
  segments,
}: NodeReadyProps) => {
  return html`
    ${RingSegmented({ ringWidth, segments })}
    <div class="content">
      ${BitcoinLogo()} ${Title({ text: numberWithCommas(blockHeight) })}
      ${Subtitle({ text: "Blocktime" })} ${Indicator()}
    </div>
  `;
};
