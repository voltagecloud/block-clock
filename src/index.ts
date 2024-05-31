import { LitElement, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BlockClock } from "./components/BlockClock";
import { DEFAULT_RING_WIDTH, DEFAULT_THEME } from "./utils/constants";
import style from "./index.css?inline";

@customElement("block-clock")
export class Index extends LitElement {
  static styles = unsafeCSS(style);
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
    mode: "closed",
  };

  @property({ type: String }) rpcEndpoint = "";
  @property({ type: String }) rpcUser = "";
  @property({ type: String }) rpcPassword = "";
  @property({ type: Boolean }) darkMode = true;
  @property({ type: Object }) theme = DEFAULT_THEME;

  @state()
  blockTimes: number[] = []; // UTC timestamps in seconds

  listeners: unknown[];

  constructor() {
    super();
    this.listeners = [];
  }

  private pollRpc() {
    console.log("Polling...", this.listeners);
    this.listeners = [1];
    setTimeout(() => {
      console.log(this.listeners);
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.pollRpc();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  render() {
    return BlockClock({
      ringWidth: 2,
      downloadProgress: 0,
      blockHeight: 840_000,
      ringSegments: [],
      theme: this.theme,
      connected: false,
      darkMode: this.darkMode,
      downloading: false,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "block-clock": Index;
  }
}
