import { SettingOutlined } from "@ant-design/icons";
import {
	Checkbox,
	FormItem,
	Input,
	NumberPicker,
	PreviewText,
	Radio,
} from "@formily/antd-v5";
import { createForm, onFormValuesChange } from "@formily/core";
import {
	FormProvider,
	ISchema,
	ReactFC,
	connect,
	createSchemaField,
	observer,
} from "@formily/react";
import { toJS } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import { Button, ConfigProvider, Pagination, Popover, Row, Slider } from "antd";
import { ColumnProps } from "antd/es/table";
import { TablePaginationConfig } from "antd/lib";
import React, { Fragment, useEffect, useMemo } from "react";
import { usePrefixCls } from "src/__builtins__";
import { ArrayBase, ArrayBaseMixins } from "../array-base";
import { useArrayFeature } from "./features/hooks";
import { IProSettings } from "./features/use-pro-settings";
import { ProArrayTable } from "./index";
export const Column: ReactFC<ColumnProps<any>> = () => {
	return <Fragment />;
};

export const Addition: ArrayBaseMixins["Addition"] = observer((props) => {
	const array = ArrayBase.useArray();
	const [, $page] = useArrayFeature("pagination");
	return (
		<ArrayBase.Addition
			{...props}
			onClick={(e) => {
				// 如果添加数据后将超过当前页，则自动切换到下一页
				const total = array?.field?.value.length || 0;
				if (total >= $page.current! * $page.pageSize! + 1) {
					$page.current! += 1;
				}
				props.onClick?.(e);
			}}
		/>
	);
});

export const TablePagination = (props: TablePaginationConfig) => {
	const cls = usePrefixCls("formily-array-table-formily-pagination");
	return (
		<div className={cls}>
			<Pagination size="small" {...props} />
		</div>
	);
};

export const ProSettings = ({
	value,
	onChange,
}: {
	onChange: React.Dispatch<React.SetStateAction<IProSettings>>;
	value: IProSettings;
}) => {
	const SchemaField = useCreation(
		() =>
			createSchemaField({
				components: {
					Slider: connect(Slider),
					FormItem,
					Input,
					NumberPicker,
					Radio,
					ProArrayTable,
					PreviewText,
					Checkbox,
				},
			}),
		[],
	);

	const form = useCreation(() => {
		return createForm({
			initialValues: value,
			effects(form) {
				onFormValuesChange(() => {
					onChange((pre) => {
						return {
							...pre,
							...toJS(form.values),
						};
					});
				});
			},
		});
	}, []);

	useEffect(() => {
		if (form.values.columns.length > 0) return;
		setTimeout(() => {
			const clone = value;
			form.setValues(clone);
		});
	}, [value]);

	const schema: ISchema = {
		type: "object",
		properties: {
			size: {
				type: "string",
				"x-component": "Radio.Group",
				"x-component-props": {
					optionType: "button",
					buttonStyle: "solid",
				},
				enum: [
					{ label: "紧凑", value: "small" },
					{ label: "中等", value: "middle" },
					{ label: "默认", value: "large" },
				],
			},
			columns: {
				type: "array",
				"x-component": "ProArrayTable",
				"x-component-props": {
					bordered: false,
					settings: false,
					pagination: false,
					rowSelection: false,
					showHeader: false,
				},
				items: {
					type: "object",
					properties: {
						_sort: {
							type: "void",
							"x-component": "ProArrayTable.Column",
							"x-component-props": {
								width: 40,
							},
							properties: {
								sort: {
									type: "void",
									"x-component": "ProArrayTable.SortHandle",
								},
							},
						},
						_show: {
							type: "void",
							"x-component": "ProArrayTable.Column",
							"x-component-props": {
								width: 40,
							},
							properties: {
								show: {
									type: "boolean",
									"x-component": "Checkbox",
								},
							},
						},
						_title: {
							type: "void",
							"x-component": "ProArrayTable.Column",
							"x-component-props": {
								width: 60,
							},
							properties: {
								title: {
									type: "string",
									"x-component": "PreviewText",
								},
							},
						},
						_width: {
							type: "void",
							"x-component": "ProArrayTable.Column",
							"x-component-props": {
								width: 100,
							},
							properties: {
								width: {
									type: "string",
									"x-component": "Slider",
									"x-component-props": {
										min: 20,
										max: 400,
									},
								},
							},
						},
					},
				},
			},
		},
	};
	const content = useMemo(() => {
		return (
			<ConfigProvider componentSize="small">
				<FormProvider form={form}>
					<SchemaField schema={schema} />
				</FormProvider>
			</ConfigProvider>
		);
	}, []);
	const title = useMemo(() => {
		return (
			<Row justify="space-between">
				<h4>表格设置</h4>
				<Button
					onClick={() => {
						value.reset();
					}}
				>
					重置
				</Button>
			</Row>
		);
	}, []);
	return (
		<Popover content={content} title={title} trigger="click">
			<Button
				style={{ justifySelf: "flex-end" }}
				icon={<SettingOutlined />}
				type="link"
			></Button>
		</Popover>
	);
};
