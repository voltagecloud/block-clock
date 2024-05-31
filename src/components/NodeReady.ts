import { html } from "lit";
import { BitcoinLogo } from "./BitcoinLogo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";
import { numberWithCommas } from "../utils/format.ts";
import { Ring } from "./Ring.ts";

export interface NodeReadyProps {
  blockHeight: number;
}

export const NodeReady = ({ blockHeight }: NodeReadyProps) => {
  return html`
    <!-- TODO SegmentRing -->
    ${Ring({
      ringFillAngle: 0 * 3.6,
      ringWidth: 2,
    })}
    <div class="content">
      ${BitcoinLogo()} ${Title({ text: numberWithCommas(blockHeight) })}
      ${Subtitle({ text: "Blocktime" })} ${Indicator()}
    </div>
  `;
};
