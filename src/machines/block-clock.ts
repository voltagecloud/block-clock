import { assign, fromPromise, not, sendTo, setup } from "xstate";
import {
  ProxyConfig,
  RpcConfig,
  getBlockStats,
  getBlockchainInfo,
} from "../lib/api/api";
import { getTimestamp } from "../utils/time";
import { clearCachedContext } from "../lib/storage";

const MAX_CONNECT_ERROR_COUNT = 5;
const POLL_WAIT_TIME = 2000;

const initialContext = {
  blocks: 0,
  headers: 0,
  zeroHourBlocks: [],
  pointer: 0,
  zeroHourTimestamp: 0,
  zeroHourBlockHeight: 0,
  verificationProgress: 0,
  IBDEstimationArray: [],
  IBDEstimation: 0,
  oneHourIntervals: false,
  connectErrorCount: 0,
};

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
  ConnectingRetry = "ConnectingRetry",
  ErrorConnecting = "ErrorConnecting",
  WaitingIBD = "WaitingIBD",
  Downloading = "Downloading",
  BlockTime = "BlockTime",
  Stopped = "Stopped",
  LoadingBlocks = "LoadingBlocks",
}

export type Context = RpcConfig &
  ProxyConfig & {
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
    oneHourIntervals: boolean;
    connectErrorCount: number;
  };

function addBlockInCorrectPosition(
  zeroHourBlocks: ZeroHourBlock[],
  block: ZeroHourBlock
) {
  const index = zeroHourBlocks.findIndex(
    (zeroHourBlock) => zeroHourBlock.height > block.height
  );
  if (index === -1) {
    return [...zeroHourBlocks, block];
  } else {
    return [
      ...zeroHourBlocks.slice(0, index),
      block,
      ...zeroHourBlocks.slice(index),
    ];
  }
}

export const machine = setup({
  types: {
    context: {} as Context,
    input: {} as RpcConfig & ProxyConfig,
  },
  actions: {
    resetConnectErrorCount: assign(() => ({
      connectErrorCount: 0,
    })),
    incrementConnectErrorCount: assign(({ context }) => ({
      connectErrorCount: context.connectErrorCount + 1,
    })),
    resetAll: assign(() => {
      clearCachedContext();
      return initialContext;
    }),
    addToIBDEstimation: assign(({ event, context }) => {
      // Keep an array of 10 estimations
      let IBDEstimationArray;
      if (context.IBDEstimationArray.length >= 10) {
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
    resetZeroHourTimestamp: assign(({ context }) => ({
      zeroHourTimestamp: getTimestamp(context.oneHourIntervals),
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
        return { zeroHourTimestamp: getTimestamp(context.oneHourIntervals) };
      } else {
        return {};
      }
    }),
    resetPointer: assign(({ context }) => {
      return { pointer: context.blocks };
    }),
    addBlock: assign(({ context, event }) => ({
      zeroHourBlocks: context.hasDoneFullScan
        ? addBlockInCorrectPosition(context.zeroHourBlocks, event.output)
        : [event.output, ...context.zeroHourBlocks],
    })),
    decrementPointer: assign(({ context }) => {
      return {
        pointer: context.pointer - 1,
      };
    }),
    logError: ({ event }) => {
      console.error("Block Clock Error: ", event.error);
    },
  },
  actors: {
    fetchBlockchainInfo,
    fetchBlockStats,
  },
  guards: {
    hasExceededConnectErrorCount: ({ context }) =>
      context.connectErrorCount >= MAX_CONNECT_ERROR_COUNT - 1,
    isIBD: ({ event }) => {
      return event.output.initialblockdownload;
    },
    isZeroHourBlocksStale: function ({
      context: { zeroHourTimestamp, oneHourIntervals },
    }) {
      return zeroHourTimestamp < getTimestamp(oneHourIntervals);
    },
    hasPointerBlock: function ({ context: { zeroHourBlocks, pointer } }) {
      return !!zeroHourBlocks.find((block) => block.height === pointer);
    },
    isBlockBeforeZeroHour: function ({ context, event }) {
      return event.output.time * 1000 < context.zeroHourTimestamp;
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
    ...initialContext,
    ...input,
  }),
  id: "BlockClock",
  initial: BlockClockState.Connecting,
  on: {
    RESET: {
      target: `.${BlockClockState.Connecting}`,
      actions: ["resetAll", "resetConnectErrorCount"],
    },
  },
  states: {
    [BlockClockState.Connecting]: {
      always: [
        {
          guard: "isZeroHourBlocksStale",
          description:
            "Prevents UI from rendering stale zero hour blocks when machine is loaded with cache data.",
          actions: [
            "resetZeroHourBlocks",
            "resetZeroHourTimestamp",
            "resetPointer",
            "resetHasDoneFullScan",
            "resetZeroHourBlockHeight",
          ],
        },
      ],
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
        onError: [
          {
            guard: "hasExceededConnectErrorCount",
            target: BlockClockState.ErrorConnecting,
            actions: ["logError"],
          },
          {
            target: BlockClockState.ConnectingRetry,
            actions: ["incrementConnectErrorCount"],
          },
        ],
        src: "fetchBlockchainInfo",
        input: ({ context }) => context,
      },
    },
    [BlockClockState.ConnectingRetry]: {
      after: {
        [POLL_WAIT_TIME]: {
          target: BlockClockState.Connecting,
        },
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
            [POLL_WAIT_TIME]: {
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
                BLOCKCHAIN_INFO_UPDATED: [
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
                        type: "BLOCKCHAIN_INFO_UPDATED",
                      }),
                    ],
                  },
                ],
                src: "fetchBlockchainInfo",
              },
            },
            Waiting: {
              after: {
                [POLL_WAIT_TIME]: {
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
