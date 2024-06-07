import { assign, fromPromise, not, sendTo, setup } from "xstate";
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
  blocks: number;
  headers: number;
  zeroHourBlocks: ZeroHourBlock[];
  zeroHourTimestamp: number;
  hasDoneFullScan?: boolean;
  zeroHourBlockHeight: number;
  pointer: number;
  verificationProgress: number;
  IBDEstimation?: number;
  IBDEstimationArray: { progressTakenAt: number; progress: number }[];
};

export const machine = setup({
  types: {
    context: {} as Context,
    input: {} as RpcConfig,
  },
  actions: {
    addToIBDEstimation: assign(({ event, context }) => {
      // Keep an array of 10 estimations
      let IBDEstimationArray;
      if (context.IBDEstimationArray.length >= 100) {
        IBDEstimationArray = [
          ...context.IBDEstimationArray.slice(1),
          {
            progressTakenAt: Date.now(),
            progress: event.output.verificationprogress,
          },
        ];
      } else {
        IBDEstimationArray = [
          ...context.IBDEstimationArray,
          {
            progressTakenAt: Date.now(),
            progress: event.output.verificationprogress,
          },
        ];
      }

      let IBDEstimation = 0;
      if (IBDEstimationArray.length > 1) {
        const first = IBDEstimationArray[0];
        const last = IBDEstimationArray[IBDEstimationArray.length - 1];
        const duration = last.progressTakenAt - first.progressTakenAt;
        const progress = last.progress - first.progress;
        const rateOfProgress = progress / duration;

        // Calculate how long it will take to finish IBD
        const remainingProgress = 1 - event.output.verificationprogress;
        const remainingTime = (remainingProgress * 100) / rateOfProgress;
        IBDEstimation = remainingTime > 0 ? remainingTime : 0;
      }

      return {
        IBDEstimationArray,
        IBDEstimation,
      };
    }),
    resetIBDEstimation: assign({ IBDEstimationArray: [], IBDEstimation: 0 }),
    updateInfo: assign(({ event }) => ({
      blocks: event.output.blocks,
      verificationProgress: event.output.verificationprogress,
    })),
    setZeroHourBlockHeight: assign(({ context }) => {
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
        return { pointer: context.blocks };
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
      return { pointer: context.blocks };
    }),
    addBlock: assign(({ context, event }) => ({
      zeroHourBlocks: context.hasDoneFullScan
        ? [...context.zeroHourBlocks, event.output]
        : [event.output, ...context.zeroHourBlocks],
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
      return context.blocks !== event.output.blocks;
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
    blocks: 0,
    headers: 0,
    zeroHourBlocks: [],
    pointer: 0,
    zeroHourTimestamp: 0,
    zeroHourBlockHeight: 0,
    verificationProgress: 0,
    IBDEstimationArray: [],
    IBDEstimation: 0,
    ...input,
  }),
  id: "BlockClock",
  initial: BlockClockState.Connecting,
  states: {
    [BlockClockState.Connecting]: {
      invoke: {
        onDone: [
          {
            target: BlockClockState.WaitingIBD,
            guard: { type: "isIBD" },
            actions: ["updateInfo", "addToIBDEstimation"],
          },
          {
            target: BlockClockState.BlockTime,
            actions: ["updateInfo", "addToIBDEstimation"],
          },
        ],
        onError: {
          target: BlockClockState.ErrorConnecting,
        },
        src: "fetchBlockchainInfo",
        input: ({ context }) => context,
      },
    },
    [BlockClockState.ErrorConnecting]: {},
    [BlockClockState.WaitingIBD]: {
      initial: "Poll",
      entry: ["resetIBDEstimation"],
      states: {
        Poll: {
          invoke: {
            input: ({ context }) => context,
            src: "fetchBlockchainInfo",
            onError: {
              target: `#BlockClock.${BlockClockState.ErrorConnecting}`,
            },
            onDone: [
              {
                target: "Poll Success",
                actions: ["updateInfo", "addToIBDEstimation"],
                guard: {
                  type: "isIBD",
                },
              },
              {
                actions: ["updateInfo"],
                target: "#BlockClock.BlockTime",
              },
            ],
          },
        },
        "Poll Success": {
          after: {
            2000: {
              target: "Poll",
            },
          },
        },
      },
    },
    [BlockClockState.BlockTime]: {
      type: "parallel",
      entry: ["initPointer", "initZeroHourTimestamp"],
      states: {
        BlockAggregator: {
          initial: "FullScan",
          states: {
            FullScan: {
              always: [
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
