import { ArrayField } from "@formily/core";
import { useField, useForm } from "@formily/react";
import { useAttach } from "@formily/react/esm/hooks/useAttach";
import { model } from "@formily/reactive";
import { clone } from "@formily/shared";
import { TableColumnType, TableProps } from "antd";
import { ColumnType } from "antd/es/table";
import { useMemo, useRef } from "react";

export type IProTableColumnProps = TableColumnType<any> & {
	show?: boolean;
};
export type IProSettingsProps = Partial<
	Omit<IProSettings, "settingsColumns" | "columns" | "reset">
>;

export type IProSettings = {
	size?: TableProps<any>["size"];
	indentSize?: TableProps<any>["indentSize"];
	columns: IProTableColumnProps[];
	_columns: IProTableColumnProps[];
	reset: () => void;
	paginationPosition?:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
};

const defaultValue: IProSettingsProps = {
	size: "small",
	paginationPosition: "bottom-right",
};

export const useProSettings = (
	columns: React.MutableRefObject<ColumnType<any>[]>,
) => {
	const array = useField<ArrayField>();
	const form = useForm();
	const props = array.componentProps;
	const touched = useRef(false);

	const vm = useMemo(() => {
		const init = {
			...defaultValue,
			size: props.size,
			indentSize: props.indentSize,
		};
		return model<IProSettings>({
			...init,
			get columns() {
				return touched.current
					? this._columns.filter((x) => x.show)
					: columns.current;
			},
			_columns: [],
			reset() {
				this.columns = clone(columns.current);
			},
		});
	}, [props, form, array]);

	// 初始化, 快吐了
	if (vm._columns.length === 0 && columns.current?.length > 0) {
		touched.current = true;
		vm._columns = clone(columns.current).map((item: TableColumnType<any>) => {
			return {
				...item,
				show: true,
			} as IProTableColumnProps;
		});
	}

	const field = useAttach(
		form.createField({
			basePath: array?.address,
			name: "settings",
			value: vm,
		}),
	);

	return vm;
};
