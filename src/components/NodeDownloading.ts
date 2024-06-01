import { html } from "lit";
import { Ring } from "./Ring.ts";
import { BitcoinLogo } from "./BitcoinLogo.ts";
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
      ${BitcoinLogo()} ${Title({ text: "Downloading" })}
      ${Subtitle({ text: "Please wait..." })} ${Indicator()}
    </div>
  `;
};
