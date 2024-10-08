import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

export enum LogoType {
  Bitcoin = "bitcon",
  Stopped = "stopped",
  Error = "error",
}

interface LogoProps {
  logo?: LogoType;
}

function getLogo(logo: LogoType) {
  switch (logo) {
    case LogoType.Bitcoin:
      return html`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 30 30"
          fill="none"
          style="${styleMap(styles.svg)}"
        >
          <path
            style="${styleMap(styles.svgFill)}"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.3731 29.5522C19.4187 31.5549 27.5525 26.651 29.5541 18.6202C31.5508 10.5845 26.6548 2.42609 18.6043 0.447842C10.5784 -1.55495 2.44943 3.34895 0.447856 11.3798C-1.55372 19.4106 3.34229 27.5445 11.3731 29.5522ZM18.6922 9.29308C20.7755 10 22.2951 11.0457 22.0255 13.0486C21.8196 14.5066 21.0255 15.2185 19.9275 15.4688C21.4275 16.2396 22.1775 17.408 21.4912 19.4551C20.6383 22.0226 18.5353 22.2533 15.7216 21.7526L15.0745 24.487L13.4275 24.0893L14.0745 21.3991C13.6579 21.296 13.2216 21.188 12.7608 21.0653L12.1138 23.7752L10.4667 23.3775L11.1138 20.6431C10.8873 20.5775 10.6518 20.5209 10.4128 20.4635C10.2585 20.4264 10.1028 20.389 9.94709 20.3486L7.80003 19.8478L8.57944 17.948C8.57944 17.948 9.80984 18.2621 9.79023 18.2425C10.2461 18.3456 10.4569 18.0511 10.5402 17.8449L11.5402 13.5248C11.5721 13.5346 11.5978 13.5395 11.6236 13.5444C11.6493 13.5493 11.675 13.5542 11.7069 13.5641C11.6657 13.5355 11.6265 13.5254 11.592 13.5165C11.5732 13.5117 11.5558 13.5072 11.5402 13.5002L12.2706 10.4124C12.2951 10.0785 12.1677 9.64163 11.501 9.47472C11.5451 9.45017 10.3147 9.18017 10.3147 9.18017L10.7314 7.42759L13.001 7.97251C13.1775 8.01424 13.3552 8.05106 13.5329 8.08787C13.7106 8.12469 13.8883 8.16151 14.0647 8.20324L14.7118 5.49337L16.3785 5.89102L15.751 8.54197C16.1873 8.63034 16.6285 8.73343 17.0647 8.83652L17.6922 6.18557L19.3392 6.58321L18.6922 9.29308ZM13.565 19.1503C14.8893 19.4905 17.8756 20.2575 18.3196 18.3652C18.7665 16.4478 15.967 15.8441 14.5623 15.5412C14.3954 15.5052 14.2482 15.4735 14.1285 15.4443L13.2755 19.0771C13.3593 19.0975 13.4566 19.1225 13.565 19.1503ZM14.7512 13.8376C15.8558 14.1232 18.37 14.7733 18.7755 13.0486C19.1868 11.3176 16.8404 10.8149 15.6799 10.5663C15.5404 10.5365 15.418 10.5102 15.3196 10.486L14.5255 13.7801C14.5916 13.7964 14.6673 13.8159 14.7512 13.8376Z"
          />
        </svg>
      `;
    case LogoType.Stopped:
      return html` <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          style="${styleMap(styles.svgStroke)}"
          stroke-width="1.5"
        />
      </svg>`;
    case LogoType.Error:
      return html`
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            style="${styleMap(styles.svgStroke)}"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M8 5.39v2.86m-6.052 2.775a1.463 1.463 0 0 0 1.267 2.195h9.57c1.125 0 1.83-1.22 1.267-2.195L9.268 2.732a1.464 1.464 0 0 0-2.536 0l-4.784 8.293ZM8 10.78h.005v.006H8v-.006Z"
          />
        </svg>
      `;
  }
}

export const Logo = ({ logo = LogoType.Bitcoin }: LogoProps) => {
  return html`
    <div style="${styleMap(styles.container)}">${getLogo(logo)}</div>
  `;
};

const styles = {
  container: {
    width: "14cqi",
    height: "14cqi",
  },
  svg: {
    width: "14cqi",
    height: "14cqi",
    position: "absolute",
  },
  svgFill: {
    fill: "var(--title-text-color, white)",
  },
  svgStroke: {
    stroke: "var(--title-text-color, white)",
  },
};
