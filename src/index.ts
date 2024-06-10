import { LitElement, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Actor, createActor } from "xstate";
import { BlockClock } from "./components/BlockClock";
import style from "./index.css?inline";
import { StoppedReason } from "./lib/types";
import {
  BlockClockState,
  Context as BlockClockContext,
  machine as blockClockMachine,
} from "./machines/block-clock";
import { DEFAULT_THEME } from "./utils/constants";
import { objectsEqual } from "./utils/assert";
import { calculateRadialTimeDifferences } from "./utils/math";

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

  @property({ type: String }) fetch = "";
  @property({ type: String }) rpcEndpoint = "";
  @property({ type: String }) rpcUser = "";
  @property({ type: String }) rpcPassword = "";
  @property({ type: Boolean }) darkMode = false;
  @property({ type: Boolean }) devMode = false;
  @property({ type: Object }) theme = DEFAULT_THEME;
  @property({ type: Boolean }) downloading = false;
  @property({ type: String }) stoppedReason?: StoppedReason = undefined;

  @state() blockClockState: BlockClockState | undefined;
  @state() blockClockContext: BlockClockContext | undefined;
  @state() ringSegments: number[] = [];
  @state() snapshot: any;

  blockClockActor: Actor<typeof blockClockMachine> | undefined;

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
    } else if (snapshot.matches(BlockClockState.WaitingIBD)) {
      return BlockClockState.WaitingIBD;
    } else if (snapshot.matches(BlockClockState.ErrorConnecting)) {
      return BlockClockState.ErrorConnecting;
    }
  };

  connectedCallback(): void {
    console.log(this.fetch);
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
      if (this.devMode) {
        console.log({ snapshot });
        console.log(snapshot.value["BlockTime"]);
        window.blockClockActor = this.blockClockActor;
        window.clearStorageAndReload = () => {
          localStorage.clear();
          location.reload();
        };
      }
      this.snapshot = snapshot;
      window.loadDataIntoStorage = (obj: any) => {
        localStorage.clear();
        updateCachedContext(obj);
        location.reload();
      };
      this.blockClockState = this.getBlockClockState(snapshot);
      this.blockClockContext = snapshot.context;
      // Update the cache only if the context has changed
      updateCachedContext(snapshot.context);
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

  attributeChangedCallback(
    name: string,
    _old: string | null,
    value: string | null
  ): void {
    super.attributeChangedCallback(name, _old, value);
    if (["rpcUser", "rpcPassword", "rpcEndpoint", "fetch"].includes(name)) {
      this.blockClockActor?.send({
        type: "SET_CONFIG",
        config: {
          fetch: eval(this.fetch),
          rpcUser: this.rpcUser,
          rpcPassword: this.rpcPassword,
          rpcEndpoint: this.rpcEndpoint,
        },
      });
    }
  }

  render() {
    const devTools = html`
      <div
        style="font-size: 10px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px;"
      >
        <div>
          <b>Polling blockchain info:</b>
          ${this.snapshot.matches("BlockTime.PollBlockchainInfo.Poll")}
        </div>
        <div>
          <b>Waiting to Scan Blocks:</b>
          ${this.snapshot.matches("BlockTime.ScanBlocks.Wait")}
        </div>
        <div>
          <b>Scan Blocks Idle:</b>
          ${this.snapshot.matches("BlockTime.ScanBlocks.Idle")}
        </div>
        <div>
          <b>Pointer:</b>
          ${this.snapshot.context.pointer}
        </div>
        <div>
          <b>Has done full scan:</b>
          ${this.snapshot.context.hasDoneFullScan}
        </div>
        <div>
          <b>Zero Hour BlockHeight</b>
          ${JSON.stringify(this.snapshot.context.zeroHourBlockHeight)}
        </div>
        <div>
          <b>Dark Mode</b>
          ${JSON.stringify(this.darkMode)}
        </div>
      </div>
    `;
    if (this.blockClockState && this.blockClockContext) {
      return html`
        ${this.devMode ? devTools : ""}
        ${BlockClock({
          state: this.blockClockState,
          ringWidth: 2,
          downloadProgress: this.blockClockContext.verificationProgress,
          ibdCompletionEstimate: this.blockClockContext.IBDEstimation,
          blocks: this.blockClockContext.blocks,
          headers: this.blockClockContext.headers,
          ringSegments: this.ringSegments,
          theme: this.theme,
          darkMode: this.darkMode,
          stoppedReason: this.stoppedReason,
        })}
      `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "block-clock": Index;
  }
}

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

function updateCachedContext(newContext: any) {
  const excludeKeys = ["rpcUser", "rpcPassword", "rpcEndpoint"];
  const filteredContext = Object.keys(newContext)
    .filter((key) => !excludeKeys.includes(key))
    .reduce((obj: any, key: any) => {
      obj[key] = newContext[key];
      return obj;
    }, {});

  if (!objectsEqual(getCachedContext(), filteredContext)) {
    localStorage.setItem("blockClockContext", JSON.stringify(filteredContext));
  }
}
