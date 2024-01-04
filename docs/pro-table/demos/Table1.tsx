import {
	ArrayTable,
	Editable,
	FormButtonGroup,
	FormItem,
	Input,
	Submit,
} from "@formily/antd-v5";
import { createForm } from "@formily/core";
import { FormProvider, createSchemaField } from "@formily/react";
import { Button } from "antd";
import { ProTable } from "proformily";
import React from "react";

console.log("--ProTable", ArrayTable, ProTable);
const SchemaField = createSchemaField({
	components: {
		FormItem,
		Editable,
		Input,
		ArrayTable: ProTable,
	},
});

const form = createForm();

const schema = {
	type: "object",
	properties: {
		array: {
			type: "array",
			"x-decorator": "FormItem",
			"x-component": "ArrayTable",
			"x-component-props": {
				pagination: { pageSize: 10 },
				scroll: { x: "100%" },
			},
			items: {
				type: "object",
				properties: {
					column1: {
						type: "void",
						"x-component": "ArrayTable.Column",
						"x-component-props": { width: 50, title: "Sort", align: "center" },
						properties: {
							sort: {
								type: "void",
								"x-component": "ArrayTable.SortHandle",
							},
						},
					},
					column2: {
						type: "void",
						"x-component": "ArrayTable.Column",
						"x-component-props": { width: 80, title: "Index", align: "center" },
						properties: {
							index: {
								type: "void",
								"x-component": "ArrayTable.Index",
							},
						},
					},
					column3: {
						type: "void",
						"x-component": "ArrayTable.Column",
						"x-component-props": { width: 200, title: "A1" },
						properties: {
							a1: {
								type: "string",
								"x-decorator": "Editable",
								"x-component": "Input",
							},
						},
					},
					column4: {
						type: "void",
						"x-component": "ArrayTable.Column",
						"x-component-props": { width: 200, title: "A2" },
						properties: {
							a2: {
								type: "string",
								"x-decorator": "FormItem",
								"x-component": "Input",
							},
						},
					},
					column5: {
						type: "void",
						"x-component": "ArrayTable.Column",
						"x-component-props": { width: 200, title: "A3" },
						properties: {
							a3: {
								type: "string",
								"x-decorator": "FormItem",
								"x-component": "Input",
							},
						},
					},
					column6: {
						type: "void",
						"x-component": "ArrayTable.Column",
						"x-component-props": {
							title: "Operations",
							dataIndex: "operations",
							width: 200,
							fixed: "right",
						},
						properties: {
							item: {
								type: "void",
								"x-component": "FormItem",
								properties: {
									remove: {
										type: "void",
										"x-component": "ArrayTable.Remove",
									},
									moveDown: {
										type: "void",
										"x-component": "ArrayTable.MoveDown",
									},
									moveUp: {
										type: "void",
										"x-component": "ArrayTable.MoveUp",
									},
								},
							},
						},
					},
				},
			},
			properties: {
				add: {
					type: "void",
					"x-component": "ArrayTable.Addition",
					title: "添加条目",
				},
			},
		},
	},
};
const range = (count: number) =>
	Array.from(new Array(count)).map((_, key) => ({
		aaa: key,
	}));

export default () => {
	return (
		<FormProvider form={form}>
			<SchemaField schema={schema} />
			<FormButtonGroup>
				<Submit onSubmit={console.log}>提交</Submit>
			</FormButtonGroup>
			<Button
				block
				onClick={() => {
					form.setInitialValues({
						array: range(88),
					});
				}}
			>
				Load 10W pieces of large data
			</Button>
		</FormProvider>
	);
};
