import { html } from "lit";
import { Logo, LogoType } from "./Logo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";
import { RingLoader } from "./RingLoader.ts";
import { BlockClockTheme } from "../lib/types.ts";

export interface NodeConnectingProps {
  theme: BlockClockTheme;
  ringWidth: number;
}

export const NodeConnecting = ({
  ringWidth = 2,
  theme = { colors: { blockConfirmationColors: ["yellow"] } },
}) => {
  return html`
    ${RingLoader({
      ringFillAngle: 180, // half circle
      ringWidth,
      theme,
    })}
    <div class="content">
      ${Logo({ logo: LogoType.Bitcoin })} ${Title({ text: "Connecting" })}
      ${Subtitle({ text: "Please wait..." })} ${Indicator()}
    </div>
  `;
};
