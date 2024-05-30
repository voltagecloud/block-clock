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
  @property({ type: Number }) syncProgress = 10;
  @property({ type: Number }) blockHeight = 0;

  @state()
  blockTimes: number[] = []; // UTC timestamps in seconds

  @state()
  segmentLengths: number[] = [];

  setBlockTimesFromRpc() {
    // Fetch the block times from the RPC
    // this.blockTimes = rpc.getBlockTimes();
    // Approx 72 blocks can happen in 1 hour
    this.blockTimes = [
      1634304000, 1634307600, 1634311200, 1634314800, 1634318400, 1634322000,
      1634325600, 1634329200, 1634332800, 1634336400, 1634340000, 1634343600,
      1634347200, 1634350800, 1634354400, 1634358000, 1634361600, 1634365200,
      1634368800, 1634372400, 1634376000, 1634379600, 1634383200, 1634386800,
      1634390400, 1634394000, 1634397600, 1634401200, 1634404800, 1634408400,
      1634412000, 1634415600, 1634419200, 1634422800, 1634426400, 1634430000,
      1634433600, 1634437200, 1634440800, 1634444400, 1634448000, 1634451600,
      1634455200, 1634458800, 1634462400, 1634466000, 1634469600, 1634473200,
      1634476800, 1634480400, 1634484000, 1634487600, 1634491200, 1634494800,
      1634498400, 1634502000, 1634505600, 1634509200, 1634512800, 1634516400,
      1634520000, 1634523600, 1634527200, 1634530800, 1634534400, 1634538000,
      1634541600, 1634545200, 1634548800, 1634552400, 1634556000,
    ];
  }

  getSegmentLengthsNormalized() {
    // Normalize the segment lengths based on the blocktimes (min normal =0, max normal = 100)
    this.segmentLengths = [];
    const range = Math.max(...this.blockTimes) - Math.min(...this.blockTimes);
    this.blockTimes.forEach((blockTime) => {
      this.segmentLengths.push(
        ((blockTime - Math.min(...this.blockTimes)) / range) * 100
      );
    });
    console.log("Seg", this.segmentLengths);
  }

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
