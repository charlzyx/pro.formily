import { ArrayField, isArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { autorun, model, observable, toJS } from "@formily/reactive";
import { clone } from "@formily/shared";
import useCreation from "ahooks/es/useCreation";
import { Table, TableColumnProps, TableColumnType, TableProps } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { getArrayTableColumns, useArrayTableSources } from "../hooks";

type ITableColumnProps = TableColumnType<any> & {
	pinLeft?: boolean;
	pinRight?: boolean;
	hidden?: boolean;
};
export type IProSettingsProps = Partial<
	Omit<IProSettings, "settingsColumns" | "columns" | "reset">
>;

export type IProSettings = {
	size?: TableProps<any>["size"];
	settingsColumns: ITableColumnProps[];
	columns: ITableColumnProps[];
	reset: () => void;
	paginationPosition:
		| "top-left"
		| "top-center"
		| "top-right"
		| "bottom-left"
		| "bottom-center"
		| "bottom-right";
};

export const FEATURE_KEY = "_pro_settings_";

export const useProSettings = (settings?: IProSettingsProps) => {
	const field = useField<ArrayField>();
	const sources = useArrayTableSources();

	const initColumns = useCreation(() => {
		const dataSource = Array.isArray(field.value) ? field.value.slice() : [];
		return getArrayTableColumns(dataSource, field, sources);
	}, [sources]);

	const copy = useCreation(() => {
		return clone(initColumns);
	}, [initColumns]);

	const ob = useCreation(() => {
		if (!field.data) {
			field.data = observable.deep({});
		}
		if (!field.data[FEATURE_KEY]) {
			field.data[FEATURE_KEY] = {};
		}

		const obdata = field.data[FEATURE_KEY];
		const _model: IProSettings & {
			reset: () => void;
		} = {
			...settings,
			size: "small",
			settingsColumns: initColumns,
			get columns() {
				return this.settingsColumns.filter((x) => !x.hidden);
			},
			paginationPosition: "bottom-right",
			reset() {
				this.settingsColumns = clone(copy);
				this.size = "small";
			},
		};
		Object.assign(obdata, _model);

		return obdata as typeof _model;
	}, [initColumns]);
	if (!ob) return Object.assign([], {});

	return Object.assign([ob, sources] as const, {
		ob,
		sources,
	});
};
