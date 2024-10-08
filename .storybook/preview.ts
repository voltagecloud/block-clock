import type { Preview } from "@storybook/web-components";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#2d2d39",
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
