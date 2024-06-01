import type { Meta, StoryObj } from "@storybook/web-components";
import type { ButtonProps } from "./Button";
import { BlockClock, type BlockClockProps } from "../components/BlockClock";
import { html } from "lit";
import { DEFAULT_THEME } from "../utils/constants";
import { StoppedReason } from "../components/NodeStopped";

const getBlockClockDemo = (args: BlockClockProps) =>
  html`<div style="width: 300px; height: 300px;">${BlockClock(args)}</div>`;

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: "BlockClock",
  tags: ["autodocs"],
  render: getBlockClockDemo,
  argTypes: {
    ringWidth: { control: { type: "range", min: 0, max: 8 } },
    downloadProgress: { control: { type: "range", min: 0, max: 100 } },
    blockHeight: { control: { type: "range", min: 0, max: 9_999_999 } },
    connected: { control: "boolean" },
    theme: { control: "object" },
    stoppedReason: {
      control: "select",
      options: Object.values(StoppedReason),
    },
  },
  args: {
    darkMode: true,
    connected: false,
    downloading: false,
    ringWidth: 2,
    downloadProgress: 0,
    blockHeight: 840_000,
    segments: [5, 13, 21, 18, 10, 8, 5, 3, 2, 1],
    theme: DEFAULT_THEME,
    stoppedReason: undefined,
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

export const Stopped: Story = {
  args: {
    downloading: false,
    connected: false,
    stoppedReason: StoppedReason.PausedManual,
  },
};
