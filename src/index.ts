import { LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BlockClock } from "./components/BlockClock";
import { DEFAULT_RING_WIDTH, DEFAULT_THEME } from "./utils/constants";

@customElement("block-clock")
export class Index extends LitElement {
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

  @state()
  blockTimes: number[] = []; // UTC timestamps in seconds

  render() {
    return BlockClock({
      ringWidth: this.ringWidth,
      downloadProgress: this.downloadProgress,
      blockHeight: this.blockHeight,
      segments: this.blockTimes,
      theme: this.theme,
      connected: this.connected,
      darkMode: this.darkMode,
      downloading: this.downloading,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "block-clock": Index;
  }
}
