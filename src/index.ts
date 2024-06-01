import { LitElement, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BlockClock } from "./components/BlockClock";
import { DEFAULT_RING_WIDTH, DEFAULT_THEME } from "./utils/constants";
import style from "./index.css?inline";
import { StoppedReason } from "./components/NodeStopped";

@customElement("block-clock")
export class Index extends LitElement {
  static styles = unsafeCSS(style);
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
    mode: "closed",
  };

  @property({ type: Number }) ringWidth = DEFAULT_RING_WIDTH;
  @property({ type: Number }) downloadProgress = 10;
  @property({ type: Number }) blockHeight = 0;
  @property({ type: Boolean }) connected = false;
  @property({ type: Boolean }) darkMode = true;
  @property({ type: Boolean }) downloading = false;
  @property({ type: Object }) theme = DEFAULT_THEME;
  @property({ type: String }) stoppedReason?: StoppedReason | undefined =
    undefined;

  @state()
  blockTimes: number[] = []; // UTC timestamps in seconds

  render() {
    return BlockClock({
      ringWidth: this.ringWidth,
      downloadProgress: this.downloadProgress,
      blockHeight: this.blockHeight,
      ringSegments: [],
      theme: this.theme,
      connected: this.connected,
      darkMode: this.darkMode,
      downloading: this.downloading,
      stoppedReason: this.stoppedReason,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "block-clock": Index;
  }
}
