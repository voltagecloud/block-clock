import { LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BlockClock } from "./components/BlockClock";

@customElement("block-clock")
export class Index extends LitElement {
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
    mode: "closed",
  };

  @property({ type: Number }) ringWidth = 2;
  @property({ type: Number }) downloadProgress = 10;
  @property({ type: Number }) blockHeight = 0;
  @property({ type: Boolean }) connected = false;
  @property({ type: Boolean }) darkMode = true;
  @property({ type: Boolean }) downloading = false;

  @state()
  blockTimes: number[] = []; // UTC timestamps in seconds

  setBlockTimesFromRpc() {
    // Fetch the block times from the RPC
    // this.blockTimes = rpc.getBlockTimes();
    // Approx 72 blocks can happen in 1 hour
    this.blockTimes = [
      1685401200, 1685401800, 1685402400, 1685406000, 1685409600, 1685413200,
      1685415000, 1685420400, 1685424000, 1685431200, 1685433000, 1685436600,
      1685440200, 1685442000, 1685445600, 1685452800, 1685454600, 1685458200,
      1685465400, 1685472600, 1685476200, 1685481600, 1685485200, 1685492400,
      1685494200, 1685497800, 1685505000, 1685508600, 1685515800, 1685523000,
      1685526600, 1685530200, 1685537400, 1685541000, 1685544600, 1685548200,
      1685551800, 1685555400, 1685559000, 1685566200, 1685573400, 1685577000,
      1685580600, 1685587800, 1685591400, 1685595000, 1685602200, 1685605800,
      1685609400, 1685613000,
    ];
  }

  // TODO: convert seconds timestamp differences proportionally
  // into degrees based on 12-hour time periods
  calculateDashArray(progress: number, segments: number[], gap = 2) {
    const circumference = Math.PI * (50 * 2);
    // If no progres, no dasharray needs to be calculated
    if (progress <= 0) {
      return `0px ${circumference}`;
    }
    // TODO, progress is simply the time that's passed, filled should be based on the time since the last 12-hour cycle

    const SECONDS = 43200; // 12 hours in seconds
    //   const diffs = differences(segments);
    //   const normalized = normalize(diffs);
    //   const coef = getScaleCoefficient(normalized, filled);
    //   const proportions = normalized.map((n) => n * coef);
    //   const dashes = proportions.map((dash) => `${dash}px ${gap}px`).join(" ");
    //   const remaining = circumference - filled;
    //   // Need to ensure that remaining always ends as a gap, not a dash
    //   // If proportions.length is even, last element is gap, else dash
    //   const dasharray =
    //     proportions.length % 2 === 0
    //       ? `${dashes} ${remaining}px`
    //       : `${dashes} 0px ${remaining}px`;
    //   console.log({
    //     dashes,
    //     filled,
    //     remaining,
    //     normalized,
    //     proportions,
    //     dasharray,
    //     diffs,
    //     coef,
    //     circumference,
    //   });

    //   return dasharray;
    return `${progress}px ${circumference - progress}`;
  }

  render() {
    return BlockClock({
      ringWidth: this.ringWidth,
      downloadProgress: this.downloadProgress,
      blockHeight: this.blockHeight,
      blockTimes: this.blockTimes,
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
