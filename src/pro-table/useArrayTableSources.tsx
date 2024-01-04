import { Schema } from "@formily/json-schema";
import { useField, useFieldSchema } from "@formily/react";
import { isArr } from "@formily/shared";
import {
	ObservableColumnSource,
	isAdditionComponent,
	isColumnComponent,
	isOperationsComponent,
} from "./helper";

export const useArrayTableSources = () => {
	const arrayField = useField();
	const schema = useFieldSchema();
	const parseSources = (schema: Schema): ObservableColumnSource[] => {
		if (
			isColumnComponent(schema) ||
			isOperationsComponent(schema) ||
			isAdditionComponent(schema)
		) {
			if (!schema["x-component-props"]?.dataIndex && !schema.name) return [];
			const name = schema["x-component-props"]?.dataIndex || schema.name;
			const field = arrayField.query(arrayField.address.concat(name)).take();
			const columnProps =
				(field?.component as any)?.[1] || schema["x-component-props"] || {};
			const display = field?.display || schema["x-display"];
			return [
				{
					name,
					display,
					field,
					schema,
					columnProps,
				},
			];
		} else if (schema.properties) {
			return schema.reduceProperties<
				ObservableColumnSource[],
				ObservableColumnSource[]
			>((buf, schema) => {
				return buf.concat(parseSources(schema));
			}, []);
		}
		return [];
	};

	const parseArrayItems = (schema: Schema["items"]) => {
		if (!schema) return [];
		const sources: ObservableColumnSource[] = [];
		const items = isArr(schema) ? schema : [schema];
		return items.reduce((columns, schema) => {
			const item = parseSources(schema);
			if (item) {
				return columns.concat(item);
			}
			return columns;
		}, sources);
	};

	if (!schema) throw new Error("can not found schema object");

	return parseArrayItems(schema.items);
};
