import type { Meta, StoryObj } from "@storybook/web-components";
import type { ButtonProps } from "./Button";
import { BlockClock, type BlockClockProps } from "../components/BlockClock";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: "BlockClock",
  tags: ["autodocs"],
  render: (args) =>
    BlockClock({
      ringWidth: args.ringWidth,
      syncProgress: args.syncProgress,
      blockHeight: args.blockHeight,
    }),
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

export default meta;
type Story = StoryObj<ButtonProps>;

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
