import { ArrayField, isArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { model } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import { Table } from "antd";

type IRowSelectionProps = React.ComponentProps<typeof Table>["rowSelection"];

const KEY = "_template_data";

export const useTemplate = () => {
	let array = useField();
	while (array && !isArrayField(array)) {
		array = array.parent;
	}
	return array.data?.[KEY] ?? {};
};

export const useTemplate$ = (
	field: ArrayField,
	rowSelection: IRowSelectionProps,
) => {
	if (!rowSelection) return null;

	const state = useCreation(() => {
		if (!field.data) {
			field.data = {};
		}

		const _ob_options = model({});

		field.data[KEY] = _ob_options;

		console.log(field);
		return _ob_options;
	}, []);

	return {
		rowSelection: state,
	};
};
