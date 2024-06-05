import { setup, fromPromise } from "xstate";
import { RpcConfig } from "./types";
import { getBlockchainInfo } from "../lib/api/api.new";

const fetch = fromPromise(async ({ input }: { input: RpcConfig }) =>
  getBlockchainInfo(input)
);

export const machine = setup({
  types: {
    context: {} as RpcConfig,
    input: {} as RpcConfig,
  },
  actors: {
    fetch,
  },
}).createMachine({
  context: ({ input }) => input,
  id: "Poller",
  initial: "poll",
  states: {
    poll: {
      invoke: {
        onDone: {
          target: "poll_success",
        },
        onError: {
          target: "poll_error",
        },
        src: "fetch",
        input: ({ context }) => context,
      },
    },
    poll_success: {
      after: {
        5000: {
          target: "poll",
        },
      },
    },
    poll_error: {
      after: {
        5000: {
          target: "poll",
        },
      },
    },
  },
});
