import { html } from "lit";
import { Ring } from "./Ring.ts";
import { BitcoinLogo } from "./BitcoinLogo.ts";
import { Title } from "./Title.ts";
import { Subtitle } from "./Subtitle.ts";
import { Indicator } from "./Indicator.ts";

interface NodeDownloadingProps {
  downloadProgress: number;
}

export const NodeDownloading = ({ downloadProgress }: NodeDownloadingProps) => {
  return html`
    ${Ring({
      ringFillAngle: downloadProgress * 3.6,
      ringWidth: 2,
    })}
    <div class="content">
      ${BitcoinLogo()} ${Title({ text: "Downloading" })}
      ${Subtitle({ text: "Please wait..." })} ${Indicator()}
    </div>
  `;
};
