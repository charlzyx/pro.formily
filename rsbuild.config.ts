import path from "path";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    alias: {
      proformily: path.resolve(__dirname, "./src"),
    },
  },
  tools: {
    less: {
      lessOptions: {
        javascriptEnabled: true,
      },
    },
    rspack(config) {
      config.experiments = {
        ...config.experiments,
        rspackFuture: {
          ...config.experiments?.rspackFuture,
          disableTransformByDefault: false,
        },
      };
    },
  },
});
