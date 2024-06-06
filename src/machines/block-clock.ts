import { and, assign, emit, fromPromise, not, setup } from "xstate";
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
    emitNewBlockHeight: emit({
      type: "NEW_BLOCK_HEIGHT",
    }),
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
            src: "fetchBlockchainInfo",
            onDone: [
              { actions: ["updateInfo"] },
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
      entry: ["resetPointer"],
      states: {
        PollBlockchainInfo: {
          initial: "Poll",
          states: {
            Poll: {
              invoke: {
                input: ({ context }) => context,
                onDone: [
                  { actions: ["updateInfo"] },
                  {
                    target: "#BlockClock.WaitingIBD",
                    guard: {
                      type: "isIBD",
                    },
                  },
                  {
                    guard: "isNewBlockHeight",
                    target: "Waiting",
                    actions: ["emitNewBlockHeight"],
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
          entry: ["resetHasDoneFullScan", "resetPointer"],
          states: {
            Scan: {
              always: [
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
                  target: "Idle",
                  guard: and(["hasDoneFullScan", "hasPointerBlock"]),
                },
                {
                  target: "Scan",
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
            Idle: {
              on: {
                NEW_BLOCK_HEIGHT: {
                  target: "Scan",
                  actions: ["resetPointer"],
                },
              },
            },
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
                    target: "Idle",
                    actions: ["setHasDoneFullScan"],
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
