import { html } from "lit";
import { Ring } from "./Ring.ts";
import { Logo, LogoType } from "./Logo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";

interface NodeDownloadingProps {
  downloadProgress: number;
  ringWidth: number;
}

export const NodeDownloading = ({
  downloadProgress,
  ringWidth,
}: NodeDownloadingProps) => {
  return html`
    ${Ring({
      ringFillAngle: downloadProgress * 3.6,
      ringWidth,
    })}
    <div class="content">
      ${Logo({ logo: LogoType.Bitcoin })} ${Title({ text: "Downloading" })}
      ${Subtitle({ text: "Please wait..." })} ${Indicator()}
    </div>
  `;
};
