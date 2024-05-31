import type { Meta, StoryObj } from "@storybook/web-components";
import { BlockClock, type BlockClockProps } from "../components/BlockClock";
import { html } from "lit";

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
    connected: { control: "boolean" },
  },
  args: {
    blockHeight: 840_000,
    connected: false,
    darkMode: true,
    downloading: false,
    downloadProgress: 0,
    ringSegments: [5, 13, 21, 18, 10, 8, 5, 3, 2, 1],
    ringWidth: 2,
  },
} satisfies Meta<BlockClockProps>;

export default meta;
type Story = StoryObj<BlockClockProps>;

export const Connecting: Story = {
  args: {
    downloading: false,
    connected: false,
  },
};

export const Downloading: Story = {
  args: {
    downloading: true,
    connected: true,
  },
};

export const Ready: Story = {
  args: {
    downloading: false,
    connected: true,
  },
};
