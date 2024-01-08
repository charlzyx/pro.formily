import { SettingOutlined } from "@ant-design/icons";
import {
	Checkbox,
	FormItem,
	Input,
	PreviewText,
	Radio,
} from "@formily/antd-v5";
import { createForm, onFormValuesChange } from "@formily/core";
import {
	FormProvider,
	ISchema,
	ReactFC,
	createSchemaField,
	observer,
} from "@formily/react";
import { toJS } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import { Button, ConfigProvider, Pagination, Popover } from "antd";
import { ColumnProps } from "antd/es/table";
import { TablePaginationConfig } from "antd/lib";
import { Fragment, useEffect, useMemo } from "react";
import { usePrefixCls } from "src/__builtins__";
import { ArrayBase, ArrayBaseMixins } from "../array-base";
import { usePagination } from "./features/use-pagination";
import { IProSettingsProps } from "./features/use-pro-settings";
import { ProArrayTable } from "./index";
export const Column: ReactFC<ColumnProps<any>> = () => {
	return <Fragment />;
};

export const Addition: ArrayBaseMixins["Addition"] = observer((props) => {
	const array = ArrayBase.useArray();
	const page = usePagination();
	return (
		<ArrayBase.Addition
			{...props}
			onClick={(e) => {
				// 如果添加数据后将超过当前页，则自动切换到下一页
				const total = array?.field?.value.length || 0;
				if (total >= page.current! * page.pageSize! + 1) {
					page.current! += 1;
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
	settings,
}: {
	settings: IProSettingsProps;
}) => {
	const SchemaField = useCreation(
		() =>
			createSchemaField({
				components: {
					FormItem,
					Input,
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
			initialValues: settings,
			effects(form) {
				onFormValuesChange((field) => {
					settings._columns = toJS(form.values)._columns;
					settings.size = toJS(form.values).size;
					settings.indentSize = toJS(form.values).indentSize;
				});
			},
		});
	}, []);

	useEffect(() => {
		if (form.values._columns.length > 0) return;
		setTimeout(() => {
			const clone = toJS(settings);
			form.setValues(clone);
		});
	}, [settings]);

	const schema: ISchema = {
		type: "object",
		properties: {
			size: {
				type: "string",
				"x-component": "Radio.Group",
				"x-component-props": {
					type: "button",
				},
				enum: [
					{ label: "紧凑", value: "small" },
					{ label: "中等", value: "middle" },
					{ label: "默认", value: "large" },
				],
			},
			_columns: {
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
								width: 60,
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
								width: 60,
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
								width: 80,
							},
							properties: {
								width: {
									type: "string",
									"x-component": "Input",
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
	return (
		<Popover content={content} title="设置" trigger="click">
			<Button icon={<SettingOutlined />} type="link"></Button>
		</Popover>
	);
};
