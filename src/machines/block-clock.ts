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
};

export const machine = setup({
  types: {
    context: {} as Context,
    input: {} as RpcConfig,
  },
  actions: {
    updateInfo: assign(({ event }) => ({ blockHeight: event.output.blocks })),
    setZeroHourTimestamp: assign(() => ({
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
  },
  actors: {
    fetchBlockchainInfo,
    fetchBlockStats,
  },
  guards: {
    isIBD: ({ event }) => event.output.initialblockdownload,
    isZeroHourBlocksStale: function ({
      context: { zeroHourBlocks, zeroHourTimestamp },
    }) {
      if (zeroHourBlocks.length === 0) {
        return false;
      } else {
        const len = zeroHourBlocks.length;
        const lastKnownBlock = zeroHourBlocks[len - 1];
        if (zeroHourTimestamp >= lastKnownBlock.time * 1000) {
          return true;
        } else {
          return false;
        }
      }
    },
    hasPointerBlock: function ({ context: { zeroHourBlocks, pointer } }) {
      return !!zeroHourBlocks.find((block) => block.height === pointer);
    },
    isBlockBeforeZeroHour: function ({ context, event }) {
      return event.output.time * 1000 < context.zeroHourTimestamp;
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCEA2B7AxgawMIZwDpd0A7UsTAFwEtSoBiCMsQugN3W1bSzwOzEyFanSgIOWAIa0yAbQAMAXUVLEoAA7pYNWaXUgAHogCMJgOwAmQgFYAnAGZz5hwDYALDYcOAHJYA0IACepuauhO52UQ42Cq4K0TYAvkmBvDj4fELklLT0TCxspJzchOn8WSQ5ovQSxdJ6qnImakggWjp6BsYIJgrmgSG9Jq4mhFFRPiaW3pY25u4paQKZRFUieYxgAE7b6NuEGqgyAGb7ALZlKwLZG2J1nJgyNPLKqgYdui-6bT1mVrZHM43J5vH5BqZLD5xhMHO4PP04SYfEsQOVVoIAKK7fYAAnWuTEDEMsCoMlYUhOVB2AApYgoAJQMdE3bF7bb44SE+jvNqfLq-Uy+MZxSzmRzTGYOOw+CEIKYRWHuSyWBTuBY+cyollZADqUi+9FxAElkAARQgABXQqFQBQoRRKPGueoNmxN5qtNtQDwa3yayg+2i+ZG6iHm4TcJkcMtclmRcrsM0VkwUU0sUXF2pdRH1hqgHot1tt9tYklKOtzbrEha9tt9T0abxaQc63zDwwB9icLg8Xl8AWCpjV1gWUUsnh8Chsrg82b4GMIefdpqL3txAGUAK6YTBwWDE0nkwiU6nbGmqhSM5k5wTLmuruuoTc7vewWC8zTBgWgHphcyEAs6rKvCDjRp4cqajYMJRMqYTuCCySpGit5XHwuIACo0OcrDFqg5SYAAFgapDGqQZxPqWjpcM6C43OUmHYbh3oEcRdBkRReENs8rwqIGfLfu2gq9Kq1gIeYNg+HYGpJiYcquD40ITlEJjKnGfjuIsyGVoIDFYThT6sSRHHoJRzAOuWtEZPRAiMQZeFGex5GmVxkiNv6zatF+bahsJrjSoQFjIv5kmxK4NhyiqkTjMqPjzJJ0wjPO1lZHpTGGQIRHGc5S7VvkJJktSJ5UrSl7XjpaE4HZzG2o5pE5fePL8d5IY-L+iA+PEhDSnF8Xwu4ZiRaJERwZpYqSXCyUVEQaUGRuTykOUsCEBuZLbFQDCfu0gm+e18rwhEfQWHYJgTTYNiDkMyIuLYIIKGKSYDY4U2LrNrDzVIi0CMtq1SOtm0tgJPltUYHXRZpSZeKM05uA4coWAqE3jY4sTTCi2moW9K0LUtK1rRtciWF523Ax2HgOIQHg+PC07zNMcLw840H0leHh2LTcYvTZ6H6e9OPfYQABiYBUERRLmWW9QVpjtm89jn248LouEfcbk8aQAbE-yQl7QNCi2OY6YZuq1MmHDQ69H4Yws2m8ZTledhc6lsvpR9X18MtSti-kEvUdLdHOzzrv8x7Qsi974hq02KiAy1P6gwgesG0bdgmwN5tXSd7jjF4ZiRDY7gKHC6PLAHM0u3NIc4J74cq-kOzsocxxUGc2yXBVWNu4rteq-U7m8Vt2u7QnSfzCnadm5FRfQTEjiuHYbN9C4KTIaQ6AQHABg6a2rUdjMcoALSuE7axcjUUA7-HPTs9nUnU-dhuaQ4E7wwNI3RO4fhQmYikn1iOIcgJOfS+OsE5LzlDOACEwUaf2mBdLUGMy53jygWVcIDh49DFPrWcs4xqSXui-C2htoSRGiM-TUqkzZ-1yvmWseF0Egx6GBaEOCPDKnwVFSCC8Ux2AurFOYCFqGNVQZ6PCL5dz7gYR2KSIpkQjBsCMRwapZQW0UhTNMz9eFxTBJEahb0pHCXMHJC2p04g8M0vdBRIE9EVxqvhTKbF6pnAMXtbwFN1ThVcOKKc7MrARQtvGVSMUxRwm8aMGxQd7IsQcdlTi3oXEJ2FBEMIkCZQJH6HMIaKpglGP8mYOEC8IlVTlg5GJTkKLCISdfHwFMvHRjVFEeYVgVFDBVAkWwlhRhxRGAhVORTsDVXlu7auVTTDRnhgiGC0kLpj0iFpUuKVy6RL5grAWv11qjPlJ0iI1NpRwnnidC68NMwjU6dKNJn9pL9MGV3AWXs64XyBrvYSIwBgmJOpGGcyIC59Hnr-FeQA */
  context: ({ input }) => ({
    ...input,
    zeroHourBlocks: [],
    pointer: 0,
    zeroHourTimestamp: 0,
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
          initial: "Start",
          entry: ["resetPointer"],
          states: {
            Start: {
              entry: ["setZeroHourTimestamp"],
              always: [
                {
                  target: "Wait",
                  guard: {
                    type: "isZeroHourBlocksStale",
                  },
                  actions: ["resetZeroHourBlocks", "resetPointer"],
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
            Wait: {
              after: {
                2000: {
                  target: "Start",
                },
              },
            },
            Fetching: {
              invoke: {
                input: ({ context }) => context,
                onDone: [
                  {
                    target: "Start",
                    actions: ["resetPointer"],
                    guard: {
                      type: "isBlockBeforeZeroHour",
                    },
                  },
                  {
                    target: "Start",
                    actions: ["addBlock", "decrementPointer"],
                  },
                ],
                onError: {
                  // target: "Start",
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
