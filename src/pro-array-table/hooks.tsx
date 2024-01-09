import {
	ArrayField,
	FieldDisplayTypes,
	GeneralField,
	isArrayField,
} from "@formily/core";
import { Schema } from "@formily/json-schema";
import {
	RecursionField,
	useField,
	useFieldSchema,
	useForm,
} from "@formily/react";
import { isArr } from "@formily/shared";
import { ColumnProps, ColumnsType } from "antd/es/table";
import { useEffect, useRef, useState } from "react";
import { ArrayBase } from "../array-base";
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

export const useAddition = () => {
	const schema = useFieldSchema();
	return schema.reduceProperties((addition, schema, key) => {
		if (isAdditionComponent(schema)) {
			return <RecursionField schema={schema} name={key} />;
		}
		return addition;
	}, null);
};

export const useArrayTableColumns = (
	field: ArrayField,
	sources: ObservableColumnSource[],
): [ColumnsType<any>, React.MutableRefObject<ColumnsType<any>>] => {
	const columns = sources.reduce<ColumnsType<any>>(
		(buf, { name, columnProps, schema, display }, key) => {
			if (display !== "visible") return buf;
			if (!isColumnComponent(schema)) return buf;
			return buf.concat({
				...columnProps,
				key,
				dataIndex: name,
				render: (value: any, record: any) => {
					const index = field.value.indexOf(record);
					const children = (
						<ArrayBase.Item index={index} record={() => field?.value?.[index]}>
							<RecursionField
								schema={schema}
								name={index}
								onlyRenderProperties
							/>
						</ArrayBase.Item>
					);
					return children;
				},
			});
		},
		[],
	);
	const ref = useRef(columns);
	ref.current = columns;

	return [columns, ref] as const;
};

export const useArrayField = () => {
	const field = useField();
	let array = field;
	while (array && !isArrayField(array)) {
		array = array.parent;
	}
	return array;
};
