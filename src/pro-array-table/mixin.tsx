import { SettingOutlined } from "@ant-design/icons";
import {
	Checkbox,
	FormItem,
	FormLayout,
	Input,
	PreviewText,
	Radio,
} from "@formily/antd-v5";
import {
	ArrayField,
	createForm,
	onFieldChange,
	onFieldReact,
	onFieldValueChange,
	onFormValuesChange,
} from "@formily/core";
import {
	FormProvider,
	ISchema,
	ReactFC,
	createSchemaField,
	observer,
	useField,
} from "@formily/react";
import { toJS } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import {
	Button,
	ConfigProvider,
	Pagination,
	Popover,
	TableColumnType,
} from "antd";
import { ColumnProps } from "antd/es/table";
import { Fragment, useEffect } from "react";
import { usePrefixCls } from "src/__builtins__";
import { ArrayBase, ArrayBaseMixins } from "../array-base";
import {
	useArrayPagination,
	useArrayProSettings,
	useArrayRowSelection,
} from "./features";
import {
	IProSettings,
	IProSettingsProps,
	useProSettings,
} from "./features/pro-settings";
import { ProArrayTable } from "./index";

export const Column: ReactFC<ColumnProps<any>> = () => {
	return <Fragment />;
};

export const Addition: ArrayBaseMixins["Addition"] = observer((props) => {
	const array = ArrayBase.useArray();
	const page$ = useArrayPagination();
	return (
		<ArrayBase.Addition
			{...props}
			onClick={(e) => {
				// 如果添加数据后将超过当前页，则自动切换到下一页
				const total = array?.field?.value.length || 0;
				if (total >= page$.current * page$.pageSize + 1) {
					page$.current += 1;
				}
				props.onClick?.(e);
			}}
		/>
	);
});

export const renderPage = (state$: any) => {
	const cls = usePrefixCls("formily-array-table-formily-pagination");
	const shouldShow =
		(state$ as any) !== false ? state$.total > state$.pageSize : false;
	return !shouldShow ? null : (
		<div className={cls}>
			<Pagination
				size="small"
				{...state$}
				total={state$.total}
				current={state$.current}
				onChange={(next, pageSize) => {
					state$.current = next;
					state$.pageSize = pageSize;
				}}
			/>
		</div>
	);
};

export const ArrayPagination = observer(() => {
	const cls = usePrefixCls("formily-array-table-formily-pagination");
	const state$ = useArrayPagination();
	const settings$ = useArrayProSettings();

	const justifySelf = /start/.test(settings$.paginationPosition)
		? "flex-start"
		: /center/.test(settings$.paginationPosition)
		  ? "center"
		  : "flex-end";

	const shouldShow =
		(state$ as any) !== false ? state$.total > state$.pageSize : false;
	return !shouldShow ? null : (
		<div
			className={cls}
			style={{
				justifySelf,
			}}
		>
			<Pagination
				size="small"
				{...state$}
				total={state$.total}
				current={state$.current}
				onChange={(next, pageSize) => {
					state$.current = next;
					state$.pageSize = pageSize;
				}}
			/>
		</div>
	);
});

export const ProSettings = () => {
	const settings$ = useArrayProSettings();

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
			initialValues: settings$,
			effects() {
				onFormValuesChange(() => {
					settings$.settingsColumns = toJS(form.values.settingsColumns);
					settings$.size = form.values.size;
					console.log(settings$);
				});
			},
		});
	}, []);

	if (
		Array.isArray(settings$.settingsColumns) &&
		form.values.settingsColumns.length === 0
	) {
		form.setValues(toJS(settings$));
	}

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
			settingsColumns: {
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
						_hide: {
							type: "void",
							"x-component": "ProArrayTable.Column",
							"x-component-props": {
								width: 60,
							},
							properties: {
								hidden: {
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
	const content = (
		<ConfigProvider componentSize="small">
			<FormProvider form={form}>
				<SchemaField schema={schema} />
			</FormProvider>
		</ConfigProvider>
	);

	return (
		<Popover content={content} title="设置" trigger="click">
			<Button icon={<SettingOutlined />} type="link"></Button>
		</Popover>
	);
};
