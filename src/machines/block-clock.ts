import { assign, fromPromise, setup } from "xstate";
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
    context: {} as RpcConfig & { blockHeight: number | undefined },
    input: {} as RpcConfig,
  },
  actions: {
    updateInfo: assign(({ event }) => {
      const info = event.output as GetBlockchainInfoResponse;
      return {
        blockHeight: info.blocks,
      };
    }),
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
  context: ({ input }) => ({ ...input, blockHeight: undefined }),
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
      initial: "Poll",
      states: {
        Poll: {
          invoke: {
            input: ({ context }) => context,
            onDone: [
              {
                target: "Poll Success",
                guard: {
                  type: "isIBD",
                },
              },
              {
                target: "#BlockClock.Block Time",
              },
            ],
            src: "fetchBlockchainInfo",
          },
        },
        "Poll Success": {
          after: {
            "2000": {
              target: "Poll",
            },
          },
        },
      },
    },
    [BlockClockState.BlockTime]: {
      entry: "updateInfo",
    },
  },
});
