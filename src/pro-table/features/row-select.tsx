import { ArrayField, isArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { model } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import { Table } from "antd";

type IRowSelectionProps = Required<
	React.ComponentProps<typeof Table>
>["rowSelection"];

const KEY = "_rowselect_data";

export const useRowSelection = () => {
	let array = useField();
	while (array && !isArrayField(array)) {
		array = array.parent;
	}
	return array.data?.[KEY] ?? {};
};

export const useRowSelection$ = (
	field: ArrayField,
	rowSelection: IRowSelectionProps,
) => {
	if (!rowSelection) return null;

	const state = useCreation(() => {
		if (!field.data) {
			field.data = {};
		}

		const _ob_options = model<
			IRowSelectionProps & {
				selectedRows: any[];
			}
		>({
			...rowSelection,
			selectedRows: [],
			selections: rowSelection.selections,
			onChange(selectedRowKeys, selectedRows) {
				_ob_options.selectedRowKeys = selectedRowKeys;
				_ob_options.selectedRows = selectedRows;
			},
		});

		field.data[KEY] = _ob_options;

		return _ob_options;
	}, []);

	return {
		rowSelection: state,
	};
};
