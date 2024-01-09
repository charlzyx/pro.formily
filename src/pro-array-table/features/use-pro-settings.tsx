import { ArrayField } from "@formily/core";
import { useField, useForm } from "@formily/react";
import { useAttach } from "@formily/react/esm/hooks/useAttach";
import { model, toJS } from "@formily/reactive";
import { clone } from "@formily/shared";
import { TableColumnType, TableProps } from "antd";
import { ColumnType } from "antd/es/table";
import { useEffect, useMemo, useRef, useState } from "react";

export type IProTableColumnProps = TableColumnType<any> & {
	show?: boolean;
};
export type IProSettingsProps = Partial<
	Omit<IProSettings, "settingsColumns" | "columns">
>;

export type IProSettings = {
	size?: TableProps<any>["size"];
	indentSize?: TableProps<any>["indentSize"];
	columns: IProTableColumnProps[];
	_columns: IProTableColumnProps[];
	paginationPosition:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
	reset: () => void;
};

export const getPostion = (
	pos: IProSettings["paginationPosition"],
): React.CSSProperties["justifyContent"] => {
	return /center/.test(pos)
		? "center"
		: /left/.test(pos)
		  ? "flex-start"
		  : "flex-end";
};

const defaultValue: IProSettingsProps = {
	size: "small",
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
			...props,
		};
		return model<IProSettings>({
			paginationPosition: "bottom-right",
			...init,
			get columns() {
				return this._columns.filter((x) => x.show);
			},
			_columns: [],
			reset() {
				this._columns = clone(columns.current).map(
					(item: TableColumnType<any>) => {
						return {
							...item,
							show: true,
						} as IProTableColumnProps;
					},
				);
			},
		});
	}, [props, form, array]);

	useEffect(() => {
		if (!array.data?.settings) {
			array.data = array.data || {};
			array.data.settings = vm;
		}
	}, [array, vm]);

	// 初始化, 快吐了
	if (vm._columns.length === 0 && columns.current?.length > 0) {
		vm._columns = clone(columns.current).map((item: TableColumnType<any>) => {
			return {
				...item,
				show: true,
			} as IProTableColumnProps;
		});
		touched.current = true;
	}

	return vm;
};
