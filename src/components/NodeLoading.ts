import { html } from "lit";
import { Logo, LogoType } from "./Logo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { BlockClockTheme } from "../lib/types.ts";
import { IndicatorLoading } from "./IndicatorLoading.ts";
import { RingTrack } from "./RingTrack.ts";

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
}: NodeLoadingProps) => {
  return html`
    ${RingTrack({ ringWidth, size: 1 })}
    <div class="content">
      ${Logo({ logo: LogoType.Bitcoin })} ${Title({ text: title })}
      ${Subtitle({ text: subtitle })} ${IndicatorLoading()}
    </div>
  `;
};
