import { fromPromise, setup } from "xstate";
import { getBlockchainInfo } from "../lib/api/api.new";
import { RpcConfig } from "./types";
import { GetBlockchainInfoResponse } from "../lib/api/types";

const fetchBlockchainInfo = fromPromise(
  async ({ input }: { input: RpcConfig }) => getBlockchainInfo(input)
);

export enum BlockClockState {
  Connecting = "Connecting",
  ErrorConnecting = "Error Connecting",
  WaitingIBD = "Waiting IBD",
  Downloading = "Downloading",
  BlockTime = "Block Time",
  // TODO: Remove?
  Ready = "Ready",
  Stopped = "Stopped",
  LoadingBlocks = "Loading Blocks",
}

export const machine = setup({
  types: {
    context: {} as RpcConfig,
    input: {} as RpcConfig,
  },
  actions: {
    updateInfo: function ({ context, event }) {
      console.log("updateInfo", event);
    },
  },
  actors: {
    fetchBlockchainInfo,
  },
  guards: {
    isIBD: function ({ event }) {
      const info = event.output as GetBlockchainInfoResponse;
      return info.initialblockdownload;
    },
  },
}).createMachine({
  context: ({ input }) => input,
  id: "BlockClock",
  initial: BlockClockState.Connecting,
  states: {
    [BlockClockState.Connecting]: {
      invoke: {
        onDone: [
          { target: BlockClockState.WaitingIBD, guard: { type: "isIBD" } },
          { target: BlockClockState.BlockTime },
        ],
        onError: {
          target: BlockClockState.ErrorConnecting,
        },
        src: "fetchBlockchainInfo",
        input: ({ context }) => context,
      },
    },
    [BlockClockState.ErrorConnecting]: {
      after: {
        "500": {
          target: BlockClockState.Connecting,
        },
      },
    },
    [BlockClockState.WaitingIBD]: {
      entry: ["updateInfo"],
    },
    [BlockClockState.BlockTime]: {},
  },
});
