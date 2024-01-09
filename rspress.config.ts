import * as path from "path";
import { pluginPreview } from "@rspress/plugin-preview";
import { defineConfig } from "rspress/config";
import RsBuildConfig from "./rsbuild.config";

export default defineConfig({
	root: path.join(__dirname, "docs"),
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
	plugins: [pluginPreview()],
	themeConfig: {
		socialLinks: [
			{
				icon: "github",
				mode: "link",
				content: "https://github.com/web-infra-dev/rspress",
			},
		],
	},
});
