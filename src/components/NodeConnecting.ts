import { html } from "lit";
import { BitcoinLogo } from "./BitcoinLogo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";
import { RingLoader } from "./RingLoader.ts";

export const NodeConnecting = () => {
  return html`
    ${RingLoader({
      ringFillAngle: 0,
      ringWidth: 2,
    })}
    <div class="content">
      ${BitcoinLogo()} ${Title({ text: "Connecting" })}
      ${Subtitle({ text: "Please wait..." })} ${Indicator()}
    </div>
  `;
};
