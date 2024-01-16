import * as path from "path";
import { pluginPreview } from "@rspress/plugin-preview";
import { defineConfig } from "rspress/config";
import RsBuildConfig from "./rsbuild.config";
import { pluginFixCss } from "./scripts/fixcss";

export default defineConfig({
  base: "/pro.formily/antd-v5",
  root: path.join(__dirname, "docs"),
  outDir: "./doc_build/antd-v5",
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
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/charlzyx/pro.formily",
      },
    ],
  },
});
