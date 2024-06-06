import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Actor, createActor } from "xstate";
import { BlockClock } from "./components/BlockClock";
import style from "./index.css?inline";
import { BitcoinRpc } from "./lib/api/api";
import { StoppedReason } from "./lib/types";
import {
  BlockClockState,
  Context as BlockClockContext,
  machine as blockClockMachine,
} from "./machines/block-clock";
import { DEFAULT_THEME } from "./utils/constants";
import { calculateRadialTimeDifferences } from "./utils/math";
import { objectsEqual } from "./json";

declare global {
  interface Window {
    emitLitDebugLogEvents: boolean;
  }
}

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
  @property({ type: Boolean }) downloading = false;
  @property({ type: String }) stoppedReason?: StoppedReason = undefined;

  @state() hasConnected: boolean = false;
  @state() blockHeight: number | undefined;
  @state() zeroHourBlocks: ZeroHourBlock[] = [];
  @state() zeroHourBlockTimeSegments: number[] = [];
  @state() zeroHourBlocksLoading: boolean = false;
  @state() blockClockState: BlockClockState | undefined;
  @state() blockClockContext: BlockClockContext | undefined;
  @state() ringSegments: number[] = [];

  listeners: unknown[];
  blockClockActor: Actor<typeof blockClockMachine> | undefined;
  bitcoind: BitcoinRpc | undefined;

  constructor() {
    super();
    this.listeners = [];
  }

  // TODO: Better way to do this?
  getBlockClockState = (snapshot: any) => {
    if (snapshot.matches(BlockClockState.Stopped)) {
      return BlockClockState.Stopped;
    } else if (snapshot.matches(BlockClockState.Connecting)) {
      return BlockClockState.Connecting;
    } else if (snapshot.matches(BlockClockState.LoadingBlocks)) {
      return BlockClockState.LoadingBlocks;
    } else if (snapshot.matches(BlockClockState.Downloading)) {
      return BlockClockState.Downloading;
    } else if (snapshot.matches(BlockClockState.BlockTime)) {
      return BlockClockState.BlockTime;
    } else if (snapshot.matches(BlockClockState.Ready)) {
      return BlockClockState.Ready;
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.blockClockActor = createActor(blockClockMachine, {
      input: {
        rpcUser: this.rpcUser,
        rpcPassword: this.rpcPassword,
        rpcEndpoint: this.rpcEndpoint,
        // Load context cache from local storage
        ...getCachedContext(),
      },
    });
    this.blockClockActor.subscribe((snapshot) => {
      // DEBUG
      window.b = this.blockClockActor;
      this.blockClockState = this.getBlockClockState(snapshot);
      this.blockHeight = snapshot.context.blockHeight;
      this.zeroHourBlocks = snapshot.context.zeroHourBlocks;
      this.blockClockContext = snapshot.context;
      // Update the cache only if the context has changed
      if (!objectsEqual(getCachedContext(), this.blockClockContext)) {
        localStorage.setItem(
          "blockClockContext",
          JSON.stringify(snapshot.context)
        );
      }
    });
    this.blockClockActor.start();
    this.initRingSegmentBuilder();
  }

  initRingSegmentBuilder() {
    if (this.blockClockContext) {
      this.ringSegments = calculateRadialTimeDifferences(
        this.blockClockContext.zeroHourBlocks,
        this.blockClockContext.zeroHourTimestamp
      );
    }
    setInterval(() => {
      if (this.blockClockContext) {
        this.ringSegments = calculateRadialTimeDifferences(
          this.blockClockContext.zeroHourBlocks,
          this.blockClockContext.zeroHourTimestamp
        );
      }
    }, 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  render() {
    if (this.blockClockState && this.blockClockContext) {
      return html` ${BlockClock({
        state: this.blockClockState,
        ringWidth: 2,
        downloadProgress: 0,
        blockHeight: this.blockClockContext.blockHeight,
        ringSegments: this.ringSegments,
        theme: this.theme,
        darkMode: this.darkMode,
        stoppedReason: this.stoppedReason,
      })}`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "block-clock": Index;
  }
}

type ZeroHourBlock = {
  height: number;
  hash: string;
  time: number;
};

// This is temporarily here for debugging purposes because if your local time just past
// the midnight or midday mark, none or almost no blocks will be fetched to display the
// block time ring segments.
// function get11HoursAgoTimestamp() {
//   const now = new Date();
//   const twelveHoursAgo = new Date(now);
//   twelveHoursAgo.setHours(now.getHours() - 11);
//   return twelveHoursAgo.getTime();
// }

function getCachedContext() {
  return JSON.parse(localStorage.getItem("blockClockContext") || "{}");
}
