// vite.config.js
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Specify asset file naming pattern
        assetFileNames: "[name][extname]", // Removes the hash from asset filenames
        chunkFileNames: "[name].js", // Removes the hash from chunk filenames
        entryFileNames: "[name].js", // Removes the hash from entry point filenames
      },
    },
  },
  plugins: [dts()],
});
