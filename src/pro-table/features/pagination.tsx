import { ArrayField, isArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { autorun, model, observe } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import { Pagination, Table } from "antd";
import { useEffect } from "react";
import { nullp, usePrefixCls } from "../../__builtins__";

type IPaginationProps = React.ComponentProps<typeof Table>["pagination"];

const getPageSize = (pageProps: IPaginationProps) => {
	return typeof pageProps === "object" ? pageProps?.pageSize || 10 : 10;
};

const KEY = "_pagination_data";

export const usePagination = () => {
	let array = useField();
	while (array && !isArrayField(array)) {
		array = array.parent;
	}
	return array.data?.[KEY] ?? {};
};

export const usePagination$ = (
	field: ArrayField,
	dataSource: any[],
	pageProps: IPaginationProps,
) => {
	if (pageProps === false) return { renderPage: nullp };
	const total = dataSource?.length || 0;

	const state = useCreation(() => {
		if (!field.data) {
			field.data = {};
		}

		const _ob_options = model({
			total: 0,
			current: 1,
			pageSize: getPageSize(pageProps),
		});

		field.data[KEY] = _ob_options;

		return _ob_options;
	}, []);

	useEffect(() => {
		state.total = total;
		const totalPage = Math.ceil(total / state.pageSize);
		if (totalPage > 0 && totalPage < state.current) {
			state.current = totalPage;
		}
	}, [total]);

	const startIndex = (state.current - 1) * state.pageSize;
	const endIndex = state.current * state.pageSize;

	console.log({ dataSource, startIndex, endIndex });

	return {
		startIndex,
		endIndex,
		dataSlice: dataSource.slice(startIndex, endIndex),
		page: state,
	};
};

export const renderPage = (state: any, pageProps: any) => {
	const cls = usePrefixCls("formily-array-table-formily-pagination");
	console.log("render state", state);
	const shouldShow =
		(pageProps as any) !== false ? state.total > state.pageSize : false;
	return !shouldShow ? null : (
		<div className={cls}>
			<Pagination
				size="small"
				{...pageProps}
				total={state.total}
				current={state.current}
				onChange={(next, pageSize) => {
					state.current = next;
					state.pageSize = pageSize;
				}}
			/>
		</div>
	);
};
