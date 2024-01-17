import * as path from "path";
import { pluginPreview } from "@rspress/plugin-preview";
import { defineConfig } from "rspress/config";
import RsBuildConfig from "./rsbuild.config";
import { pluginFixCss } from "./scripts/fixcss";

export default defineConfig({
  base: "/proformily/antd/",
  root: path.join(__dirname, "docs"),
  outDir: "./doc_build/antd",
  title: "ProFormily",
  description: "Pro Formily, 启动!",
  icon: "/rspress-icon.png",
  logo: {
    light: "/rspress-light-logo.png",
    dark: "/rspress-dark-logo.png",
  },
  globalStyles: path.join(__dirname, "./docs/style.css"),
  builderConfig: {
    ...RsBuildConfig,
  },
  plugins: [pluginPreview(), pluginFixCss()],
  themeConfig: {
    footer: {
      message: "Powered by RsPress. © 2024 charlzyx All Rights Reserved.",
    },
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/charlzyx/proformily",
      },
    ],
  },
});
