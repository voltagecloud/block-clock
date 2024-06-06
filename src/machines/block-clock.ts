import { assign, fromPromise, setup } from "xstate";
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
  ErrorConnecting = "Error Connecting",
  WaitingIBD = "Waiting IBD",
  Downloading = "Downloading",
  BlockTime = "Block Time",
  // TODO: Remove?
  Ready = "Ready",
  Stopped = "Stopped",
  LoadingBlocks = "Loading Blocks",
}

export type Context = RpcConfig & {
  blockHeight?: number;
  zeroHourBlocks: ZeroHourBlock[];
  zeroHourTimestamp: number;
  pointer: number;
  hasDoneFullScan: boolean;
};

export const machine = setup({
  types: {
    context: {} as Context,
    input: {} as RpcConfig,
  },
  actions: {
    updateInfo: assign(({ event }) => ({ blockHeight: event.output.blocks })),
    resetZeroHourTimestamp: assign(() => ({
      zeroHourTimestamp: getMidnightOrMiddayTimestamp(),
    })),
    resetZeroHourBlocks: assign({ zeroHourBlocks: [] }),
    resetPointer: assign(({ context }) => ({ pointer: context.blockHeight })),
    addBlock: assign(({ context, event }) => ({
      zeroHourBlocks: [event.output, ...context.zeroHourBlocks],
    })),
    decrementPointer: assign(({ context }) => ({
      pointer: context.pointer - 1,
    })),
    setHasDoneFullScan: assign(() => ({ hasDoneFullScan: true })),
    resetHasDoneFullScan: assign(() => ({ hasDoneFullScan: false })),
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
    hasDoneFullScan: function ({ context }) {
      return context.hasDoneFullScan;
    },
  },
}).createMachine({
  context: ({ input }) => ({
    zeroHourBlocks: [],
    pointer: 0,
    zeroHourTimestamp: 0,
    hasDoneFullScan: false,
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
      type: "parallel",
      entry: {
        type: "updateInfo",
      },
      states: {
        PollBlockchainInfo: {
          initial: "Poll",
          states: {
            Poll: {
              invoke: {
                input: ({ context }) => context,
                onDone: [
                  {
                    target: "#BlockClock.Waiting IBD",
                    guard: {
                      type: "isIBD",
                    },
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
        ScanBlocks: {
          initial: "Scan",
          entry: ["resetPointer"],
          states: {
            Scan: {
              always: [
                {
                  target: "Idle",
                  guard: {
                    type: "hasDoneFullScan",
                  },
                },
                {
                  target: "Wait",
                  guard: { type: "isZeroHourBlocksStale" },
                  actions: [
                    "resetZeroHourTimestamp",
                    "resetZeroHourBlocks",
                    "resetPointer",
                    "resetHasDoneFullScan",
                  ],
                },
                {
                  target: "Wait",
                  guard: {
                    type: "hasPointerBlock",
                  },
                  actions: ["decrementPointer"],
                },
                {
                  target: "Fetching",
                },
              ],
            },
            Idle: {},
            Wait: {
              after: {
                100: {
                  target: "Scan",
                },
              },
            },
            Fetching: {
              invoke: {
                input: ({ context }) => context,
                onDone: [
                  {
                    target: "Scan",
                    actions: ["resetPointer", "setHasDoneFullScan"],
                    guard: {
                      type: "isBlockBeforeZeroHour",
                    },
                  },
                  {
                    target: "Scan",
                    actions: ["addBlock", "decrementPointer"],
                  },
                ],
                onError: {
                  target: "Wait",
                },
                src: "fetchBlockStats",
              },
            },
          },
        },
      },
    },
  },
});
