import { ConfigProvider } from "antd";
import { useContext } from "react";

export const usePrefixCls = (
	tag?: string,
	props?: {
		prefixCls?: string;
	},
) => {
	if ("ConfigContext" in ConfigProvider) {
		const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
		return getPrefixCls(tag, props?.prefixCls);
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else {
		const prefix = props?.prefixCls ?? "ant-";
		return `${prefix}${tag ?? ""}`;
	}
};
