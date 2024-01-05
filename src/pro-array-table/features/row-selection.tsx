import { ArrayField, LifeCycleTypes, isArrayField } from "@formily/core";
import { observer, useField } from "@formily/react";
import { autorun, model, observable, observe, toJS } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import { Table } from "antd";
import { useEffect, useState } from "react";

type IRowSelectionProps = Required<
	React.ComponentProps<typeof Table>
>["rowSelection"];

export const FEATURE_KEY = "_row_selection_";

export const useRowSelection = (props?: IRowSelectionProps | true | false) => {
	const rowSelectionProps = props ? (props === true ? {} : props) : false;
	const field = useField<ArrayField>();

	const ob = useCreation(() => {
		if (rowSelectionProps === false) return;
		if (!field.data) {
			field.data = observable.deep({});
		}
		if (!field.data[FEATURE_KEY]) {
			field.data[FEATURE_KEY] = {};
		}

		const obdata = field.data[FEATURE_KEY];

		const _onChange = rowSelectionProps.onChange;

		const _model: IRowSelectionProps & {
			selectedRows: Parameters<Required<IRowSelectionProps>["onChange"]>[1];
			info?: Parameters<Required<IRowSelectionProps>["onChange"]>[2];
		} = {
			...rowSelectionProps,
			selectedRowKeys: rowSelectionProps.selectedRowKeys ?? [],
			selectedRows: [],
			onChange(selectedRowKeys, selectedRows, info) {
				obdata.selectedRows = selectedRows;
				obdata.selectedRowKeys = selectedRowKeys;
				obdata.info = info;
				_onChange?.(selectedRowKeys, selectedRows, info);
			},
		};

		Object.assign(obdata, _model);

		return obdata;
	}, []);

	useEffect(() => {
		if (!ob) return;
		const disposer = observe(ob, (change) => {
			if (change.key === "selectedRowKeys") {
				console.log("selectedRowKeys change");
			}
		});

		return disposer;
	}, [ob]);

	return ob;
};
