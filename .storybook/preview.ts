import type { Preview } from "@storybook/web-components";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "black",
        },
        {
          name: "light",
          value: "white",
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
