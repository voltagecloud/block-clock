import type { Meta, StoryObj } from "@storybook/web-components";
import type { ButtonProps } from "./Button";
import { BlockClock, type BlockClockProps } from "../components/BlockClock";
import { html } from "lit";

const getBlockClockDemo = (args: BlockClockProps) =>
  html`<div style="width: 300px; height: 300px;">
    ${BlockClock({
      ringWidth: args.ringWidth,
      syncProgress: args.syncProgress,
      blockHeight: args.blockHeight,
      blockTimes: args.blockTimes,
      syncing: false,
      connected: false,
    })}
  </div>`;

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: "BlockClock",
  tags: ["autodocs"],
  render: getBlockClockDemo,
  argTypes: {
    ringWidth: { control: { type: "range", min: 0, max: 8 } },
    syncProgress: { control: { type: "range", min: 0, max: 100 } },
    blockHeight: { control: { type: "range", min: 0, max: 1_000_000 } },
    syncing: { control: { type: "boolean" } },
    connected: { control: { type: "boolean" } },
    // size: {
    //   control: { type: "select" },
    //   options: ["small", "medium", "large"],
    // },
  },
  args: {
    // onClick: fn()
  },
} satisfies Meta<BlockClockProps>;

export default meta;
type Story = StoryObj<ButtonProps>;

export const BlockClockSynced = {
  title: "Synced Block Clock",
  tags: ["autodocs"],
  render: (args) =>
    getBlockClockDemo({ ...args, syncing: true, connected: true }),
  argTypes: {
    ringWidth: { control: { type: "range", min: 0, max: 8 } },
    syncProgress: { control: { type: "range", min: 0, max: 100 } },
    blockHeight: { control: { type: "range", min: 0, max: 1_000_000 } },
    // size: {
    //   control: { type: "select" },
    //   options: ["small", "medium", "large"],
    // },
  },
  args: {
    // onClick: fn()
  },
} satisfies Meta<BlockClockProps>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    primary: true,
    label: "Button",
  },
};

export const Secondary: Story = {
  args: {
    label: "Button",
  },
};

export const Large: Story = {
  args: {
    size: "large",
    label: "Button",
  },
};

export const Small: Story = {
  args: {
    size: "small",
    label: "Button",
  },
};
