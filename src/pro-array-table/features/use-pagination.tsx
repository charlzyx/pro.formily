import { ArrayField } from "@formily/core";
import { useField, useForm } from "@formily/react";
import { useAttach } from "@formily/react/esm/hooks/useAttach";
import { model } from "@formily/reactive";
import { Table } from "antd";
import { useMemo } from "react";
import { setValueOf } from "../hack";

export type IPaginationProps = Exclude<
	Required<React.ComponentProps<typeof Table>>["pagination"],
	boolean
>;

const getPageSize = (pageProps: IPaginationProps) => {
	return typeof pageProps === "object" ? pageProps?.pageSize || 10 : 10;
};

const defaultValue = {
	current: 1,
	pageSize: 10,
};

export const usePagination = () => {
	const array = useField<ArrayField>();
	const form = useForm();
	const props = array.componentProps?.pagination;

	const vm = useMemo(() => {
		if (props === false) return { ...defaultValue };
		// 默认启用
		const init = props ?? {};
		const _onChange = props?.onChange;
		return model<IPaginationProps>({
			...init,
			get total() {
				const arrTotal = array.value?.length ?? 0;
				const totalPage = Math.ceil(arrTotal / this.pageSize!);
				if (totalPage > 0 && totalPage < this.current!) {
					this.current = totalPage;
				}
				return arrTotal;
			},
			onChange(page, pageSize) {
				this.current = page;
				this.pageSize = pageSize;
				setValueOf(form, field, {
					...this,
					current: page,
					pageSize: pageSize,
					total: this.total,
				});
				if (_onChange) {
					_onChange(page, pageSize);
				}
			},
			current: 1,
			pageSize: getPageSize(init),
		});
	}, [props, form, array]);

	if (props === false) {
		return {
			...defaultValue,
		};
	}

	const field = useAttach(
		form.createObjectField({
			basePath: array?.address,
			name: "pagination",
			value: vm,
		}),
	);

	return vm;
};
