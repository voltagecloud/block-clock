import { setup, fromPromise } from "xstate";

const fetch = fromPromise(async ({ input }: { input: RpcConfig }) => {
  return new Promise((resolve, reject) => {
    console.log("Fetching...", input);
    setTimeout(() => {
      resolve("success");
    }, 1000);
  });
});

type RpcConfig = {
  rpcUser: string;
  rpcPassword: string;
  rpcEndpoint: string;
};

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
        "500": {
          target: "poll",
        },
      },
    },
    poll_error: {
      after: {
        "500": {
          target: "poll",
        },
      },
    },
  },
});
