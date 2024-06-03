import { html } from "lit";
import { Logo, LogoType } from "./Logo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";
import { RingLoader } from "./RingLoader.ts";
import { BlockClockTheme } from "../lib/types.ts";

export interface NodeLoadingProps {
  theme: BlockClockTheme;
  ringWidth: number;
  title: string;
  subtitle: string;
}

export const NodeLoading = ({
  title,
  subtitle,
  ringWidth = 2,
  theme = { colors: { blockConfirmationColors: ["yellow"] } },
}: NodeLoadingProps) => {
  return html`
    ${RingLoader({
      ringFillAngle: 180, // half circle
      ringWidth,
      theme,
    })}
    <div class="content">
      ${Logo({ logo: LogoType.Bitcoin })} ${Title({ text: title })}
      ${Subtitle({ text: subtitle })} ${Indicator()}
    </div>
  `;
};
