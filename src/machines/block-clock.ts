import { assign, emit, fromPromise, not, sendTo, setup } from "xstate";
import { getBlockStats, getBlockchainInfo } from "../lib/api/api.new";
import { RpcConfig } from "./types";
import { getMidnightOrMiddayTimestamp } from "../utils/time";

const fetchBlockchainInfo = fromPromise(async ({ input }: { input: Context }) =>
  getBlockchainInfo(input)
);

const fetchBlockStats = fromPromise(async ({ input }: { input: Context }) => {
  return getBlockStats({
    stats: ["time", "height", "blockhash"],
    hashOrHeight: input.pointer,
    ...input,
  });
});

export type ZeroHourBlock = {
  height: number;
  hash: string;
  time: number;
};

export enum BlockClockState {
  Connecting = "Connecting",
  ErrorConnecting = "ErrorConnecting",
  WaitingIBD = "WaitingIBD",
  Downloading = "Downloading",
  BlockTime = "BlockTime",
  // TODO: Remove?
  Ready = "Ready",
  Stopped = "Stopped",
  LoadingBlocks = "LoadingBlocks",
}

export type Context = RpcConfig & {
  blockHeight?: number;
  zeroHourBlocks: ZeroHourBlock[];
  zeroHourTimestamp: number;
  hasDoneFullScan?: boolean;
  zeroHourBlockHeight: number;
  pointer: number;
};

export const machine = setup({
  types: {
    context: {} as Context,
    input: {} as RpcConfig,
  },
  actions: {
    updateInfo: assign(({ event }) => ({ blockHeight: event.output.blocks })),
    setZeroHourBlockHeight: assign(({ context, event }) => {
      console.log({ context, event });
      return {
        zeroHourBlockHeight: context.pointer,
      };
    }),
    resetZeroHourBlockHeight: assign({ zeroHourBlockHeight: 0 }),
    setHasDoneFullScan: assign({ hasDoneFullScan: true }),
    resetHasDoneFullScan: assign({ hasDoneFullScan: false }),
    resetZeroHourTimestamp: assign(() => ({
      zeroHourTimestamp: getMidnightOrMiddayTimestamp(),
    })),
    resetZeroHourBlocks: assign({ zeroHourBlocks: [] }),
    initPointer: assign(({ context }) => {
      if (!context.pointer) {
        return { pointer: context.blockHeight };
      } else {
        return {};
      }
    }),
    initZeroHourTimestamp: assign(({ context }) => {
      if (!context.zeroHourTimestamp) {
        return { zeroHourTimestamp: getMidnightOrMiddayTimestamp() };
      } else {
        return {};
      }
    }),
    resetPointer: assign(({ context }) => {
      return { pointer: context.blockHeight };
    }),
    addBlock: assign(({ context, event }) => ({
      zeroHourBlocks: [event.output, ...context.zeroHourBlocks],
    })),
    appendBlock: assign(({ context, event }) => ({
      zeroHourBlocks: context.hasDoneFullScan
        ? [event.output, ...context.zeroHourBlocks]
        : [...context.zeroHourBlocks, event.output],
    })),
    decrementPointer: assign(({ context }) => ({
      pointer: context.pointer - 1,
    })),
  },
  actors: {
    fetchBlockchainInfo,
    fetchBlockStats,
  },
  guards: {
    isIBD: ({ event }) => event.output.initialblockdownload,
    isZeroHourBlocksStale: function ({ context: { zeroHourTimestamp } }) {
      return zeroHourTimestamp < getMidnightOrMiddayTimestamp();
    },
    hasPointerBlock: function ({ context: { zeroHourBlocks, pointer } }) {
      return !!zeroHourBlocks.find((block) => block.height === pointer);
    },
    isZeroBlocksEmpty: function ({ context: { zeroHourBlocks } }) {
      return zeroHourBlocks.length === 0;
    },
    isBlockBeforeZeroHour: function ({ context, event }) {
      return event.output.time * 1000 < context.zeroHourTimestamp;
    },
    isNewBlockHeight: function ({ context, event }) {
      return context.blockHeight !== event.output.blocks;
    },
    isPointerOnOrBeforeZeroHourBlockHeight: function ({
      context: { pointer, zeroHourBlockHeight },
    }) {
      if (!zeroHourBlockHeight) {
        return false;
      } else {
        return pointer <= zeroHourBlockHeight;
      }
    },
  },
}).createMachine({
  context: ({ input }) => ({
    zeroHourBlocks: [],
    pointer: 0,
    zeroHourTimestamp: 0,
    zeroHourBlockHeight: 0,
    ...input,
  }),
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
            src: "fetchBlockchainInfo",
            onDone: [
              {
                target: "Poll Success",
                guard: {
                  type: "isIBD",
                },
              },
              {
                target: "#BlockClock.BlockTime",
              },
            ],
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
      type: "parallel",
      entry: ["updateInfo", "initPointer", "initZeroHourTimestamp"],
      states: {
        BlockAggregator: {
          initial: "FullScan",
          states: {
            FullScan: {
              always: [
                {
                  target: "WatchUpdates",
                  guard: "isPointerOnOrBeforeZeroHourBlockHeight",
                },
                {
                  target: "Fetching",
                  guard: not("hasPointerBlock"),
                },
                { target: "FullScan", actions: ["decrementPointer"] },
              ],
            },
            Fetching: {
              invoke: {
                input: ({ context }) => context,
                onDone: [
                  {
                    target: "WatchUpdates",
                    guard: "isBlockBeforeZeroHour",
                    actions: ["setHasDoneFullScan", "setZeroHourBlockHeight"],
                  },
                  {
                    target: "FullScan",
                    actions: ["addBlock", "decrementPointer"],
                  },
                ],
                onError: "Error",
                src: "fetchBlockStats",
              },
            },
            Error: {},
            WatchUpdates: {
              on: {
                NEW_BLOCK_HEIGHT: [
                  {
                    target: "FullScan",
                    guard: "isZeroHourBlocksStale",
                    actions: [
                      "resetZeroHourBlocks",
                      "resetZeroHourTimestamp",
                      "resetPointer",
                      "resetHasDoneFullScan",
                      "resetZeroHourBlockHeight",
                    ],
                  },
                  {
                    target: "FullScan",
                    actions: ["resetPointer"],
                  },
                ],
              },
            },
          },
        },
        PollBlockchainInfo: {
          initial: "Poll",
          states: {
            Poll: {
              invoke: {
                input: ({ context }) => context,
                onDone: [
                  {
                    target: "#BlockClock.WaitingIBD",
                    guard: {
                      type: "isIBD",
                    },
                  },
                  {
                    target: "Waiting",
                    actions: [
                      "updateInfo",
                      sendTo(({ event }: any) => event.sender, {
                        type: "NEW_BLOCK_HEIGHT",
                      }),
                    ],
                  },
                  {
                    target: "Waiting",
                  },
                ],
                src: "fetchBlockchainInfo",
              },
            },
            Waiting: {
              after: {
                "2000": {
                  target: "Poll",
                },
              },
            },
          },
        },
      },
    },
  },
});
