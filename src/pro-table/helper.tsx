import { FieldDisplayTypes, GeneralField } from "@formily/core";
import { Schema } from "@formily/json-schema";
import { ColumnProps } from "antd/es/table";

export interface ObservableColumnSource {
	field?: GeneralField;
	columnProps: ColumnProps<any>;
	schema: Schema;
	display: FieldDisplayTypes;
	name: string;
}

export const isColumnComponent = (schema: Schema) => {
	return schema["x-component"]?.indexOf("Column") > -1;
};

export const isOperationsComponent = (schema: Schema) => {
	return schema["x-component"]?.indexOf("Operations") > -1;
};

export const isAdditionComponent = (schema: Schema) => {
	return schema["x-component"]?.indexOf("Addition") > -1;
};

export const hasSortable = (schema: Schema): any => {
	const canMap = (schema.items || (schema as any)) as Schema;
	const ret = canMap.reduceProperties((sortable, propSchema) => {
		if (sortable) {
			// 被上面条件阻止的
			return sortable;
		}
		/** 嵌套的 子 QueryTable 忽略 */
		if (propSchema["x-component"] === "ProTable") {
			return null;
		} else if (propSchema["x-component"]?.indexOf("SortHandle") > -1) {
			return propSchema;
		} else if (propSchema.properties || propSchema.items) {
			return hasSortable(propSchema as any);
		}
		return sortable;
	});
	return ret;
};
