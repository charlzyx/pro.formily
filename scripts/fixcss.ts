import fs from "fs";
import path from "path";
import { RspressPlugin } from "@rspress/shared";
import { loop, rewite } from "./helper";

const runFix = () => {
  /* 这个会导致 antd@5 primary 被覆盖  */
  const css = () => {
    const list = [];
    loop(path.join(__dirname, "../doc_build"), (item) => {
      if (/\.css$/.test(item)) {
        rewite(item, (style) => {
          return style.replace("background-color:transparent;", "");
        });
      }
    });
    return list;
  };

  css();
  const cssPath = path.resolve(
    __dirname,
    "../node_modules/@rspress/theme-default/dist/bundle.css",
  );
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, "utf-8").toString();
    const neo = css.replace(
      `
[type=submit] {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}`.trim(),
      `
[type=submit] {
  -webkit-appearance: button;
  background-image: none;
}
`,
    );

    fs.writeFileSync(cssPath, neo, "utf-8");
  }
};
export function pluginFixCss(): RspressPlugin {
  return {
    name: "fix-css",
    afterBuild(config, isProd) {
      runFix();
    },
    builderConfig: {},
  };
}
