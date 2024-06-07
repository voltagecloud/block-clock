import type { Meta, StoryObj } from "@storybook/web-components";
import { BlockClock, type BlockClockProps } from "../components/BlockClock";
import { html } from "lit";
import { DEFAULT_THEME } from "../utils/constants";
import { StoppedReason } from "../lib/types";
import { BlockClockState } from "../machines/block-clock";

const getBlockClockDemo = (args: BlockClockProps) =>
  html`<div style="width: 300px; height: 300px;">${BlockClock(args)}</div>`;

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: "BlockClock",
  tags: [],
  render: getBlockClockDemo,
  argTypes: {
    ringWidth: { control: { type: "range", min: 0, max: 8 } },
    downloadProgress: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
    },
    blocks: { control: { type: "range", min: 0, max: 9_999_999 } },
    theme: { control: "object" },
    state: {
      control: "select",
      options: Object.values(BlockClockState),
    },
    stoppedReason: {
      control: "select",
      options: Object.values(StoppedReason),
    },
  },
  args: {
    state: BlockClockState.Ready,
    blocks: 840_000,
    darkMode: true,
    downloadProgress: 0,
    ringSegments: [5, 13, 21, 18, 10, 8, 5, 3, 2, 1],
    ringWidth: 2,
    theme: DEFAULT_THEME,
    stoppedReason: undefined,
  },
} satisfies Meta<BlockClockProps>;

export default meta;
type Story = StoryObj<BlockClockProps>;

export const Connecting: Story = {
  args: {
    state: BlockClockState.Connecting,
  },
};

export const SyncingHeaders: Story = {
  args: {
    state: BlockClockState.WaitingIBD,
    blocks: 0,
    headers: 0,
  },
};

export const Downloading: Story = {
  args: {
    state: BlockClockState.WaitingIBD,
  },
};

export const BlockTime: Story = {
  args: {
    state: BlockClockState.BlockTime,
  },
};

export const Stopped: Story = {
  args: {
    state: BlockClockState.Stopped,
    stoppedReason: StoppedReason.PausedManual,
  },
};
