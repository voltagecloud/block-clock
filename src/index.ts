import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BlockClock } from "./components/BlockClock";

@customElement("block-clock")
export class Index extends LitElement {
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
    mode: "closed",
  };

  @property({ type: Number }) ringWidth = 2;
  @property({ type: Number }) syncProgress = 10;
  @property({ type: Number }) blockHeight = 0;

  render() {
    return BlockClock({
      ringWidth: this.ringWidth,
      syncProgress: this.syncProgress,
      blockHeight: this.blockHeight,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "block-clock": Index;
  }
}
