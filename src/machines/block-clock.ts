import { assign, fromCallback, fromPromise, setup } from "xstate";
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
    getBlock: fromCallback(() => {}),
  },
  guards: {
    isIBD: function ({ event }) {
      const info = event.output as GetBlockchainInfoResponse;
      return info.initialblockdownload;
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCEA2B7AxgawMIZwDpd0A7UsTAFwEtSoBiCMsQugN3W1bSzwOzEyFanSgIOWAIa0yAbQAMAXUVLEoAA7pYNWaXUgAHogBMATjOEAbABYLFgMwOA7AoCMCmwBoQAT0RuDlaENiYAHG4ArDY2kQ5mYQ6RkQC+KT68OPh8QuSUtPRMLGyknNyEmfw5JHmi9BKl0nqqcm5qSCBaOnoGxgiRJj7+CGYmNoSRVmFWZgMuZi7OaRkC2UQ1IgWMYABOO+g7hBqoMgBmBwC2FasCuZtiDZyYMjTyyqoGXbqv+h19Dm5LLZ7AsXO5PENEFYPIQwhETCZItNAdEbMsQJU1oIAKJ7A4AAg2+TEDEMsCoMlYUlOVF2AApIgoFABKBiY264-Y7QnCYn0D4dL49P6IAFAuz2JyuDzePyISaRQgKFx2NxuZzxKwmJbpDE3HIAdSk33o+IAksgACKEAAK6FQqCKFBKZR4+qIRpNUHNVtt9tQjyaPxayk+2m+ZF6iDMTMIJgUWq1JkBYRsEUhCEBzkIgJckzTkTMzg8qV17MNxq2PutdodTtYknK5Y9lbE1b9DsDz2a7zaYe6PyjCHMlmTCSsUzioTmGecJgcceV2tGJmhsTM6Obgk9VYtNf9+IAygBXTCYOCwUnkymEam0nZ0+NM1lbwg7tt7juoI+n8+wWACpo4bCqAfQeGYbghAszhWMWhYAhCcqZpEkFJEyybOEWWFomW7qCJUvgACo0BcrC1qgABauzoAAEugx47JUsCEAA4mAVD4gAcvilT1i6XBunwWLXHwREkWR-pUfsdEMUxrHsVxPECF2LxvCooaCsBg4iggAC0NixgZcRzlYkxhAoYSRBm8ZxmECI2G4dnTBBMRpLqpDoBAcAGFu-YRr8oGILpqIhAoxmrmZFlWUhuljCYhDOKEzjOHEjkOIklmbnhdx8lAfkgUYiChBmyRhAliQKAkFmJnCWVCRyeLckSdR5ZpA6Rjp0TZuEbirnZGpMi4GZWMqITTDYAJJKMTJuHVWS3O+pp7vl2mBf0ZjjMkibhE5izDQusGMm4VhJEkzipg4c1VC2XrtuRK0dWttjxVtq47eEe1Icdo4xtC5mVTG6phFdwmLd6n7kT+Z4Xg9AWFZmyYLmqiKIjBkwpbKwxRNm0JJBN+N2bYwO4fVOSVPixGkbDQ4GeMKVajYI1Ge4ZgZnC4xhXOE0weqE7EyspNEARlNgNTOn6WYwRGS4EVTFFGa6VEioJslMwJu4JYg7cwviV+YiVJgAAWxqkGapDnGLa26QhoXhaZcuWRmsyWDB0wao550QVYWtkwIYmkV+Um0fRjECPAbX+UO+lprbMv2+ZjsxbBhDxNqJ3QpErizLNJPzb7oki4H1EyaHfDMWxHHcZUlvw-phlhXHkWJ8MEGQa7sEAmEnvHW5KRAA */
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
      initial: "Polling",
      entry: {
        type: "updateInfo",
      },
      states: {
        Polling: {
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
            onError: {
              target: "Waiting",
            },
            src: "fetchBlockchainInfo",
          },
        },
        Waiting: {
          after: {
            "2000": {
              target: "Polling",
            },
          },
        },
      },
    },
  },
});
