import { ArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import { Table } from "antd";
import { useEffect, useRef } from "react";

export type IPaginationProps = Exclude<
	Required<React.ComponentProps<typeof Table>>["pagination"],
	boolean
> & {};

export const usePaginationAttach = (dataSource: any[]) => {
	const array = useField<ArrayField>();

	useEffect(() => {
		if (dataSource.length === array.componentProps?.pagination?.total) return;
		array.setState((s) => {
			if (s.componentProps?.pagination) {
				s.componentProps!.pagination.total = dataSource.length;
			}
		});
	}, [dataSource.length]);
	useEffect(() => {
		array.setState((s) => {
			if (!s.componentProps) {
				s.componentProps = {};
			}
			// 默认开启
			if (s.componentProps?.pagination !== false) {
				s.componentProps.pagination = {};
			}
			const $page: IPaginationProps = s.componentProps?.pagination;
			if (!$page) return;

			const _onChange = $page?.onChange;
			const _onShowSizeChange = $page?.onShowSizeChange;

			const override: IPaginationProps = {
				current: 1,
				pageSize: 10,
				size: "small",
				position: ["bottomRight"],
				hideOnSinglePage: true,
				get total() {
					return array.value.length;
				},
				onChange(page, pageSize) {
					$page.current = page;
					$page.pageSize = pageSize;
					if (_onChange) {
						_onChange(page, pageSize);
					}
				},
				onShowSizeChange(current, size) {
					$page.current = 1;
					$page.pageSize = size;
					if (_onShowSizeChange) {
						_onShowSizeChange(current, size);
					}
				},
			};

			Object.keys(override).forEach((k) => {
				($page as any)[k] = ($page as any)[k] || toJS((override as any)[k]);
			});

			console.debug(
				`feature of ${array.address.toString()}:pagination turn on.`,
			);
		});
	}, [array]);
};
