import { LitElement, PropertyValueMap, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Actor, Subscription, createActor } from "xstate";
import { BlockClock } from "./components/BlockClock";
import style from "./index.css?inline";
import {
  BlockClockState,
  Context as BlockClockContext,
  machine as blockClockMachine,
} from "./machines/block-clock";
import { DEFAULT_THEME } from "./utils/constants";
import { calculateRadialTimeDifferences } from "./utils/math";
import { getCachedContext, updateCachedContext } from "./lib/storage";

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
  @property({ type: Boolean }) darkMode = false;
  @property({ type: Boolean }) devMode = false;
  @property({ type: Boolean }) oneHourIntervals = false;
  @property({ type: Boolean }) isPaused = false;
  @property({ type: Object }) theme = DEFAULT_THEME;

  // Use these if you want to use a proxy server to connect to the RPC endpoint
  @property({ type: String }) proxyUrl = "";
  @property({ type: String }) token = "";

  @state() blockClockState: BlockClockState | undefined;
  @state() blockClockContext: BlockClockContext | undefined;
  @state() ringSegments: number[] = [];
  @state() snapshot: any;

  blockClockActor: Actor<typeof blockClockMachine> | undefined;
  blockClockSub: Subscription | undefined;
  segmentBuilderIntervalId: NodeJS.Timeout | undefined;

  getBlockClockState = (snapshot: any) => {
    for (const k in BlockClockState) {
      if (snapshot.matches(BlockClockState[k])) {
        return k as BlockClockState;
      }
    }
    throw new Error("Unknown state");
  };

  connectedCallback(): void {
    super.connectedCallback();
    const cache = getCachedContext();
    // Conditions to ignore cache are usually when a different node is being loaded
    // but the local storage cache doesn't correspond to it.
    const ignoreCache =
      cache.oneHourIntervals !== this.oneHourIntervals ||
      cache.rpcEndpoint !== this.rpcEndpoint ||
      cache.proxyUrl !== this.proxyUrl;
    let machineInput = {
      ...(ignoreCache ? {} : getCachedContext()),
      rpcUser: this.rpcUser,
      rpcPassword: this.rpcPassword,
      rpcEndpoint: this.rpcEndpoint,
      proxyUrl: this.proxyUrl,
      token: this.token,
      oneHourIntervals: this.oneHourIntervals,
      isPaused: this.isPaused,
    };
    this.blockClockActor = createActor(blockClockMachine, {
      input: machineInput,
    });
    this.blockClockSub = this.blockClockActor.subscribe((snapshot) => {
      if (this.devMode) {
        window.blockClockActor = this.blockClockActor;
        window.blockClockSnapshot = snapshot;
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

  buildRingSegments() {
    if (this.blockClockContext) {
      this.ringSegments = calculateRadialTimeDifferences(
        this.blockClockContext.zeroHourBlocks,
        this.blockClockContext.zeroHourTimestamp,
        this.blockClockContext.oneHourIntervals ? 1 : 12
      );
    }
  }

  initRingSegmentBuilder() {
    this.buildRingSegments();
    this.segmentBuilderIntervalId = setInterval(
      () => this.buildRingSegments(),
      1000
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.blockClockSub?.unsubscribe();
    this.blockClockActor?.stop();
    clearInterval(this.segmentBuilderIntervalId);
  }

  protected update(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.update(_changedProperties);
    if (_changedProperties.has("token")) {
      this.blockClockActor?.send({ type: "SET_TOKEN", token: this.token });
    }
  }

  render() {
    const devTools = html`
      <div
        style="font-size: 10px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px; color: var(--title-text-color);"
      >
        <div>
          <b>Connect error count:</b>
          ${this.snapshot.context.connectErrorCount}
        </div>
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
        <div>
          <b>One Hour Intervals</b>
          ${JSON.stringify(this.oneHourIntervals)}
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
          oneHourIntervals: this.oneHourIntervals,
          isLoadingBlockIndex: this.blockClockContext.isLoadingBlockIndex,
          isPaused: this.isPaused,
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
