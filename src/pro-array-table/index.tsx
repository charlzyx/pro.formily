import { ArrayField } from "@formily/core";
import { ReactFC, RecursionField, observer, useField } from "@formily/react";
import { Space, Table, TableProps } from "antd";
import cls from "classnames";
import React, { useRef } from "react";
import { noop, usePrefixCls } from "../__builtins__";
import { ArrayBase } from "../array-base";
import { useExpandle } from "./features/expandable";
import { usePagination } from "./features/pagination";
import { IProSettingsProps, useProSettings } from "./features/pro-settings";
import { useRowSelection } from "./features/row-selection";
import { useSortable } from "./features/sortable";
import { isColumnComponent } from "./helper";
import { useAddition } from "./hooks";
import { Addition, Column, ProSettings, renderPage } from "./mixin";
import useStyle from "./style";

const InternalArrayTable: ReactFC<
	Omit<TableProps<any>, "title"> & {
		settings: IProSettingsProps | false;
		title: string | TableProps<any>["title"];
		footer: string | TableProps<any>["footer"];
	}
> = observer((props) => {
	const ref = useRef<HTMLDivElement>(null);
	const field = useField<ArrayField>();
	const prefixCls = usePrefixCls("formily-array-table");
	const [wrapSSR, hashId] = useStyle(prefixCls);

	const dataSource = Array.isArray(field.value) ? field.value.slice() : [];

	const [settings$, sources] = useProSettings(
		props.settings ? props.settings : {},
	);

	const [pageProps$, dataSlice] = usePagination(props.pagination);

	const rowSelection$ = useRowSelection(props.rowSelection);
	const expandable$ = useExpandle(props.expandable);

	const startIndex = pageProps$
		? (pageProps$.current - 1) * pageProps$.pageSize
		: 0;

	const body = useSortable(field, { ref, prefixCls, start: startIndex });
	const addition = useAddition();
	const defaultRowKey = (record: any) => {
		return dataSource.indexOf(record);
	};

	const pagination = !props.pagination ? null : renderPage(pageProps$);

	const header = (
		<Space>
			{props.title ? (
				typeof props.title === "function" ? (
					props.title(dataSource)
				) : (
					<h3>{props.title}</h3>
				)
			) : null}
			{/top/.test(settings$.paginationPosition) ? pagination : null}
			{addition}
			{props.settings !== false ? <ProSettings></ProSettings> : null}
		</Space>
	);
	const footer = (
		<Space>
			{props.footer ? (
				typeof props.footer === "function" ? (
					props.footer(dataSource)
				) : (
					<h3>{props.footer}</h3>
				)
			) : null}
			{/top/.test(settings$.paginationPosition) ? pagination : null}
		</Space>
	);

	console.log("ssss", settings$.size);

	return wrapSSR(
		<div>
			{header}
			<ArrayBase>
				<div ref={ref} className={cls(prefixCls, hashId)}>
					<Table
						size={settings$?.size || props.size}
						bordered
						rowKey={props.rowKey ?? defaultRowKey}
						{...props}
						title={undefined}
						footer={undefined}
						expandable={expandable$}
						rowSelection={rowSelection$}
						onChange={noop}
						pagination={false}
						columns={settings$.columns}
						dataSource={pageProps$ ? dataSlice : dataSource}
						components={{
							...props.components,
							body: {
								...body,
								...props.components?.body,
							},
						}}
					/>
				</div>
				{footer}
				{sources.map((column, key) => {
					if (!isColumnComponent(column.schema)) return;
					return React.createElement(RecursionField, {
						name: column.name,
						schema: column.schema,
						onlyRenderSelf: true,
						key,
					});
				})}
			</ArrayBase>
		</div>,
	);
});

export const ProArrayTable = Object.assign(
	ArrayBase.mixin(InternalArrayTable),
	{
		Column,
		Addition,
	},
);
ProArrayTable.defaultProps = {
	data: {},
} as any;

ProArrayTable.displayName = "ProArrayTable";
