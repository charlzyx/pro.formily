import { ArrayField } from "@formily/core";
import { ReactFC, RecursionField, observer, useField } from "@formily/react";
import useWhyDidYouUpdate from "ahooks/es/useWhyDidYouUpdate";
import { Space, Table, TableProps } from "antd";
import cls from "classnames";
import React, { useMemo, useRef } from "react";
import { noop, usePrefixCls } from "../__builtins__";
import { ArrayBase } from "../array-base";
import { useSortable } from "./features/sortable";
import { useExpandable } from "./features/use-expandable";
import { usePagination } from "./features/use-pagination";
import { useProSettings } from "./features/use-pro-settings";
import { useRowSelection } from "./features/use-row-selection";
import { isColumnComponent } from "./helper";
import {
	useAddition,
	useArrayTableColumns,
	useArrayTableSources,
} from "./hooks";
import { Addition, Column, ProSettings, TablePagination } from "./mixin";
import useStyle from "./style";

const InternalArrayTable: ReactFC<
	Omit<TableProps<any>, "title"> & {
		title: string | TableProps<any>["title"];
		footer: string | TableProps<any>["footer"];
		settings?: boolean;
	}
> = observer((props) => {
	const ref = useRef<HTMLDivElement>(null);
	const field = useField<ArrayField>();
	const prefixCls = usePrefixCls("formily-array-table");
	const [wrapSSR, hashId] = useStyle(prefixCls);
	const sources = useArrayTableSources();
	const dataSource = Array.isArray(field.value) ? field.value.slice() : [];

	const [columns, refColumns] = useArrayTableColumns(
		// field.value,
		field,
		sources,
	);
	const page = usePagination();

	const startIndex = page ? (page.current! - 1) * page.pageSize! : 0;

	const expandable = useExpandable();
	const settings = useProSettings(refColumns);

	const dataSlice = useMemo(() => {
		if (props.pagination !== false) {
			return dataSource.slice(startIndex, page.pageSize);
		} else {
			return dataSource;
		}
	}, [dataSource, props.pagination, page, startIndex]);

	const body = useSortable(dataSource, (from, to) => field.move(from, to), {
		ref,
		prefixCls,
		start: startIndex,
	});
	const addition = useAddition();

	const defaultRowKey = (record: any) => {
		return dataSource.indexOf(record);
	};

	const rowSelection = useRowSelection();

	const pagination = !props.pagination ? null : (
		<TablePagination {...page}></TablePagination>
	);

	const header = (
		<Space align="end">
			{props.title ? (
				typeof props.title === "function" ? (
					props.title(dataSource)
				) : (
					<h3>{props.title}</h3>
				)
			) : null}
			{/top/.test(settings.paginationPosition!) ? pagination : null}
			{addition}
			{props.settings !== false ? (
				<ProSettings settings={settings}></ProSettings>
			) : null}
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
			{/top/.test(settings.paginationPosition!) ? pagination : null}
		</Space>
	);
	useWhyDidYouUpdate("ProTable", {
		field,
		prefixCls,
		dataSource,
		dataSlice,
		// settings,
		columns,
		body,
		rowSelection,
		pagination,
		header,
		footer,
	});

	return wrapSSR(
		<div>
			{header}
			<ArrayBase>
				<div ref={ref} className={cls(prefixCls, hashId)}>
					<Table
						size={props.size ?? "small"}
						bordered
						rowKey={props.rowKey ?? defaultRowKey}
						{...props}
						title={undefined}
						footer={undefined}
						expandable={expandable}
						rowSelection={rowSelection}
						onChange={noop}
						pagination={false}
						columns={settings.columns}
						dataSource={dataSlice}
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

ProArrayTable.displayName = "ProArrayTable";
