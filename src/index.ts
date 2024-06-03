import { LitElement, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BlockClock, BlockClockState } from "./components/BlockClock";
import { DEFAULT_THEME } from "./utils/constants";
import style from "./index.css?inline";
import { getBlockStats, getBlockchainInfo } from "./lib/api/api";
import { StoppedReason } from "./components/NodeStopped";

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
  @state() blockHeight: number = 0;
  @state() zeroHourBlocks: ZeroHourBlock[] = [];
  @state() zeroHourBlockTimeSegments: number[] = [];
  @state() zeroHourBlocksLoading: boolean = false;

  listeners: unknown[];

  constructor() {
    super();
    this.listeners = [];
  }

  private getBlockState(): BlockClockState {
    if (this.zeroHourBlocksLoading) {
      return BlockClockState.LoadingBlocks;
    }
    if (this.downloading) {
      return BlockClockState.Downloading;
    }
    if (this.stoppedReason) {
      return BlockClockState.Stopped;
    }
    if (!this.hasConnected) {
      return BlockClockState.Connecting;
    }
    return BlockClockState.Ready;
  }

  private async loadZeroHourBlocks({
    latestBlockHeight,
    latestMedianTime,
    pushFn,
  }: {
    latestBlockHeight: number;
    latestMedianTime: number;
    pushFn: (block: ZeroHourBlock) => void;
  }): Promise<ZeroHourBlock[]> {
    this.zeroHourBlocksLoading = true;
    const zeroHourTimestamp = getMidnightOrMiddayTimestamp();
    return new Promise(async (resolve, reject) => {
      const blocks: {
        height: number;
        hash: string;
        time: number;
      }[] = [];
      let currentBlockHeight = latestBlockHeight;
      let currentMedianTime = latestMedianTime * 1000;
      let count = 0;
      while (currentMedianTime > zeroHourTimestamp && currentBlockHeight > 0) {
        try {
          const blockStats = await getBlockStats({
            hashOrHeight: currentBlockHeight,
            stats: ["blockhash", "height", "time"],
          });
          pushFn({
            height: blockStats.height as number,
            hash: blockStats.blockhash as string,
            time: blockStats.time as number,
          });
          currentBlockHeight = (blockStats.height as number) - 1;
          currentMedianTime = (blockStats.time as number) * 1000;
          count++;
        } catch (e) {
          return reject(e);
        }
      }
      this.zeroHourBlocksLoading = false;
      resolve(blocks);
    });
  }

  private async pollRpc() {
    console.log("Polling...", this.listeners);
    this.listeners = [1];
    setTimeout(() => {
      console.log(this.listeners);
    });
    try {
      const info = await getBlockchainInfo();
      this.hasConnected = true;
      this.blockHeight = info.blocks;
      this.loadZeroHourBlocks({
        latestBlockHeight: info.blocks as number,
        latestMedianTime: info.time as number,
        pushFn: (block) => {
          // Build the segments
          if (this.zeroHourBlockTimeSegments.length > 0) {
            const earliestBlockTime = this.zeroHourBlocks[0].time;
            const diff = earliestBlockTime - block.time;
            const radialAngle = calculateRadialAngle(diff);
            this.zeroHourBlockTimeSegments = [
              radialAngle,
              ...this.zeroHourBlockTimeSegments,
            ];
          } else {
            // Calculate the time difference between the latest zero hour block and now
            const now = Math.floor(new Date().getTime() / 1000);
            const diff = now - block.time;
            const radialAngle = calculateRadialAngle(diff);
            this.zeroHourBlockTimeSegments = [radialAngle];
          }
          // Add the block to the list of zero hour blocks in reverse order
          this.zeroHourBlocks = [block, ...this.zeroHourBlocks];
        },
      });
    } catch (e) {
      console.error(e);
    }
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
      state: this.getBlockState(),
      ringWidth: 2,
      downloadProgress: 0,
      blockHeight: this.blockHeight,
      ringSegments: this.zeroHourBlockTimeSegments,
      theme: this.theme,
      darkMode: this.darkMode,
      stoppedReason: this.stoppedReason,
    });
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
function get11HoursAgoTimestamp() {
  const now = new Date();
  const twelveHoursAgo = new Date(now);
  twelveHoursAgo.setHours(now.getHours() - 11);
  return twelveHoursAgo.getTime();
}

// This function returns the timestamp of the latest midday or midnight before the current time
function getMidnightOrMiddayTimestamp() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const midday = new Date(now);
  midday.setHours(12, 0, 0, 0);
  return now.getTime() - now.getTimezoneOffset() * 60 * 1000 < midday.getTime()
    ? midnight.getTime()
    : midday.getTime();
}

function calculateRadialAngle(seconds: number) {
  return (seconds * 360) / (12 * 60 * 60);
}
