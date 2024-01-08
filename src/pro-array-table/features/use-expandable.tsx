import { ArrayField } from "@formily/core";
import { useField, useForm } from "@formily/react";
import { useAttach } from "@formily/react/esm/hooks/useAttach";
import { model } from "@formily/reactive";
import { Table } from "antd";
import { useMemo } from "react";
import { setValueOf } from "../hack";

export type IPaginationProps = Exclude<
	Required<React.ComponentProps<typeof Table>>["expandable"],
	boolean
>;

export const useExpandable = () => {
	const array = useField<ArrayField>();
	const form = useForm();
	const props = array.componentProps?.expandable;

	const vm = useMemo(() => {
		// 默认启用
		const init = props ?? {};
		const _onChange = props?.onExpandedRowsChange;
		return model<IPaginationProps>({
			...init,
			onExpandedRowsChange(expandedKeys) {
				this.expandedRowKeys = expandedKeys;
				setValueOf(form, field, expandedKeys);
				if (_onChange) {
					_onChange(expandedKeys);
				}
			},
		});
	}, [props, form, array]);

	if (!props) return;

	const field = useAttach(
		form.createArrayField({
			basePath: array?.address,
			name: "expandable",
			value: vm,
		}),
	);

	return vm;
};
