import { createActor, setup, assign, not } from "xstate";

type Context = {
  syncProgress: number;
  connected: boolean;
};

const blockclockMachine = setup({
  types: {
    context: {} as Context,
    events: {} as { type: "UPDATE"; connected: boolean },
  },
  actions: {
    update: assign({
      connected: ({ event }) => event.connected,
    }),
  },
  guards: {
    ifConnected: ({ event }) => event.connected,
  },
}).createMachine({
  context: {
    connected: false,
    syncProgress: 0,
  },
  initial: "connecting",
  states: {
    connected: {},
    connecting: {},
  },
  on: {
    UPDATE: [
      {
        target: ".connected",
        guard: "ifConnected",
      },
      {
        target: ".connecting",
        guard: not("ifConnected"),
      },
    ],
  },
});

export const blockclockActor = createActor(blockclockMachine).start();
