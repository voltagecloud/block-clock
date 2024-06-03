import type { Meta, StoryObj } from "@storybook/web-components";
import {
  BlockClock,
  BlockClockState,
  type BlockClockProps,
} from "../components/BlockClock";
import { html } from "lit";
import { DEFAULT_THEME } from "../utils/constants";
import { StoppedReason } from "../components/NodeStopped";

const getBlockClockDemo = (args: BlockClockProps) =>
  html`<div style="width: 300px; height: 300px;">${BlockClock(args)}</div>`;

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: "BlockClock",
  tags: [],
  render: getBlockClockDemo,
  argTypes: {
    ringWidth: { control: { type: "range", min: 0, max: 8 } },
    downloadProgress: { control: { type: "range", min: 0, max: 100 } },
    blockHeight: { control: { type: "range", min: 0, max: 9_999_999 } },
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
    blockHeight: 840_000,
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

export const Downloading: Story = {
  args: {
    state: BlockClockState.Downloading,
  },
};

export const Ready: Story = {
  args: {
    state: BlockClockState.Ready,
  },
};

export const Stopped: Story = {
  args: {
    state: BlockClockState.Stopped,
    stoppedReason: StoppedReason.PausedManual,
  },
};
