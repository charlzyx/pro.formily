import path from "path";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
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
