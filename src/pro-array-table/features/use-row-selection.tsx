import { ArrayField } from "@formily/core";
import { useField, useForm } from "@formily/react";
import { useAttach } from "@formily/react/esm/hooks/useAttach";
import { model, toJS } from "@formily/reactive";
import { Table, TableProps } from "antd";
import { useMemo } from "react";
import { setValueOf } from "../hack";

export type IRowSelection = Exclude<
	Required<React.ComponentProps<typeof Table>>["rowSelection"],
	boolean
>;

export const useRowSelection = () => {
	const array = useField<ArrayField>();
	const form = useForm();
	const props = array.componentProps?.rowSelection;
	console.log("rowSelect", props);

	const vm = useMemo(() => {
		const init = props === true ? {} : props;
		const _onChange = props?.onChange;

		return model<IRowSelection>({
			...init,
			selectedRowKeys: [],
			onChange(keys, rows) {
				this.selectedRowKeys = keys;
				setValueOf(form, field, keys);
				if (_onChange) {
					_onChange(keys, rows);
				}
			},
		});
	}, [props, form]);
	if (!props) return;

	const field = useAttach(
		form.createArrayField({
			basePath: array?.address,
			name: "rowSelection",
			value: toJS(vm.selectedRowKeys),
		}),
	);

	return vm;
};
