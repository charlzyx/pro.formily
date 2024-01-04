import { ReactFC } from "@formily/react";
import { ColumnProps } from "antd/es/table";
import { Fragment } from "react";
import { ArrayBase, ArrayBaseMixins } from "../array-base";
import { usePagination } from "./features/pagination";

export const Column: ReactFC<ColumnProps<any>> = () => {
	return <Fragment />;
};

export const Addition: ArrayBaseMixins["Addition"] = (props) => {
	const array = ArrayBase.useArray();
	const page = usePagination();
	return (
		<ArrayBase.Addition
			{...props}
			onClick={(e) => {
				// 如果添加数据后将超过当前页，则自动切换到下一页
				const total = array?.field?.value.length || 0;
				if (total >= page.current * page.pageSize + 1) {
					page.current += 1;
				}
				props.onClick?.(e);
			}}
		/>
	);
};
