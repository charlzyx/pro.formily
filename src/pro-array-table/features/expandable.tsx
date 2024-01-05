import { ArrayField, isArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { autorun, model, toJS } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import { Table } from "antd";
import { useEffect, useState } from "react";

type IExpandableProps = Required<
	React.ComponentProps<typeof Table>
>["expandable"];

export const FEATURE_KEY = "_expandable_";

export const useExpandle = (props?: IExpandableProps | false) => {
	const field = useField<ArrayField>();
	const expandableProps = props ? props : false;

	const ob = useCreation(() => {
		if (expandableProps === false) return;
		if (!field.data) {
			field.data = {};
		}

		const _onChange = expandableProps.onExpandedRowsChange;

		const _model = model<IExpandableProps>({
			...expandableProps,
			expandedRowKeys: [],
			onExpandedRowsChange(expandedKeys) {
				this.expandedRowKeys = expandedKeys;
				if (_onChange) {
					_onChange(expandedKeys);
				}
			},
		});

		field.data[FEATURE_KEY] = _model;

		return _model;
	}, []);

	return ob;
};
