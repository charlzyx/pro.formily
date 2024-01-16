import { RspressPlugin } from "@rspress/shared";

export function pluginFixCss(): RspressPlugin {
  return {
    name: "fix-css",
    afterBuild(config, isProd) {
      require("./patch");
    },
    builderConfig: {},
  };
}
