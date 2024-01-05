import { ArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { autorun, model, observable, toJS } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import { Pagination, Table } from "antd";
import { useEffect, useState } from "react";
import { usePrefixCls } from "../../__builtins__";

type IPaginationProps = React.ComponentProps<typeof Table>["pagination"];

const getPageSize = (pageProps: IPaginationProps) => {
	return typeof pageProps === "object" ? pageProps?.pageSize || 10 : 10;
};

export const FEATURE_KEY = "_pagination_";

export const usePagination = (props: IPaginationProps | true = true) => {
	const pageProps = props ? {} : false;
	const field = useField<ArrayField>();

	const ob = useCreation(() => {
		if (pageProps === false) return;
		if (!field.data) {
			field.data = observable.deep({});
		}

		const _model = model({
			...(pageProps as IPaginationProps),
			get total() {
				const arrTotal = field.value?.length ?? 0;
				const totalPage = Math.ceil(arrTotal / this.pageSize);
				if (totalPage > 0 && totalPage < this.current) {
					this.current = totalPage;
				}
				return arrTotal;
			},
			current: 1,
			pageSize: getPageSize(pageProps),
		});

		field.data[FEATURE_KEY] = _model;

		return _model;
	}, []);

	if (!ob) return Object.assign([], {});

	const startIndex = (ob.current - 1) * ob.pageSize;
	const endIndex = ob.current * ob.pageSize;
	const dataSlice = (field.value || []).slice(startIndex, endIndex);
	console.log("dataSlice", dataSlice);

	return Object.assign([ob, dataSlice] as const, {
		ob,
		dataSlice,
	});
};
