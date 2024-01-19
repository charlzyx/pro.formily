import fs from "fs";
import path from "path";
import { pluginPreview } from "@rspress/plugin-preview";
import { defineConfig } from "rspress/config";
import RsBuildConfig from "./rsbuild.config";
import { pluginFixCss } from "./scripts/fixcss";

export default defineConfig({
  base: "/pro.formily/antd/",
  root: path.join(__dirname, "docs"),
  outDir: "./doc_build/antd/",
  title: "Pro Formily",
  description: "Pro Formily, 启动!",
  icon: "/rspress-icon.png",
  logo: {
    light: "/rspress-light-logo.png",
    dark: "/rspress-dark-logo.png",
  },
  mediumZoom: {
    selector: ".rspress-doc .img",
  },
  globalStyles: path.join(__dirname, "./docs/style.css"),
  builderConfig: {
    ...(RsBuildConfig as any),
  },
  plugins: [pluginPreview(), pluginFixCss()],
  themeConfig: {
    enableContentAnimation: true,
    lastUpdated: true,
    outlineTitle: "目录",
    lastUpdatedText: "最近更新",
    prevPageText: "上一节",
    nextPageText: "下一节",
    footer: {
      message: "Powered by RsPress. © 2024 charlzyx All Rights Reserved.",
    },
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/charlzyx/pro.formily",
      },
    ],
  },
});
