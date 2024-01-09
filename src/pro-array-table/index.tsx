import { ArrayField } from "@formily/core";
import { ReactFC, RecursionField, observer, useField } from "@formily/react";
import { Table, TableProps, Typography } from "antd";
import cls from "classnames";
import React, { useMemo, useRef } from "react";
import { noop, usePrefixCls } from "../__builtins__";
import { ArrayBase } from "../array-base";
import { useSortable } from "./features/sortable";
import { useExpandableAttach } from "./features/use-expandable";
import { usePaginationAttach } from "./features/use-pagination";
import { getPostion, useProSettings } from "./features/use-pro-settings";
import { useRowSelectionAttach } from "./features/use-row-selection";
import { isColumnComponent } from "./helper";
import {
	useAddition,
	useArrayTableColumns,
	useArrayTableSources,
} from "./hooks";
import { Addition, Column, ProSettings, TablePagination } from "./mixin";
import useStyle from "./style";

const Flex = (
	props: React.PropsWithChildren<{
		justifyContent?: React.CSSProperties["justifyContent"];
	}>,
) => {
	return (
		<div
			style={{
				display: "flex",
				flex: 1,
				alignItems: "center",
				justifyContent: props.justifyContent || "flex-end",
			}}
		>
			{props.children}
		</div>
	);
};

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

	const [, refColumns] = useArrayTableColumns(field, sources);
	usePaginationAttach(dataSource);
	useExpandableAttach();
	const page = props.pagination;
	const startIndex = page ? (page.current! - 1) * page.pageSize! : 0;

	const settings = useProSettings(refColumns);

	const dataSlice = useMemo(() => {
		if (page) {
			return (page as any)?.pageSize
				? dataSource.slice(startIndex, startIndex + (page as any).pageSize)
				: dataSource;
		} else {
			return dataSource;
		}
	}, [dataSource, page, startIndex]);

	const body = useSortable(dataSource, (from, to) => field.move(from, to), {
		ref,
		prefixCls,
		start: startIndex,
	});
	const addition = useAddition();

	const rowKey = (record: any) => {
		return props.rowKey
			? typeof props.rowKey === "function"
				? props.rowKey(record)
				: record?.[props.rowKey]
			: dataSource.indexOf(record);
	};

	useRowSelectionAttach(rowKey);

	const pagination = !page ? null : (
		<div>
			<TablePagination
				style={{
					padding: "8px 0",
				}}
				{...page}
				// total={dataSource.length}
				size={page.size || (settings.size as any)}
				position={undefined}
			></TablePagination>
		</div>
	);

	const header = (
		<Flex>
			{props.title ? (
				typeof props.title === "function" ? (
					props.title(dataSource)
				) : (
					<Typography.Title level={5} style={{ flex: 1 }}>
						{props.title}
					</Typography.Title>
				)
			) : null}
			<Flex justifyContent={getPostion(settings.paginationPosition)}>
				{/top-center/.test(settings.paginationPosition!) ? pagination : null}
			</Flex>
			{addition}
			{props.settings !== false ? (
				<ProSettings settings={settings}></ProSettings>
			) : null}
		</Flex>
	);
	const footer = (
		<Flex>
			{props.footer ? (
				typeof props.footer === "function" ? (
					props.footer(dataSource)
				) : (
					<Typography.Title level={5}>{props.footer}</Typography.Title>
				)
			) : null}
			<Flex justifyContent={getPostion(settings.paginationPosition)}>
				{/bottom/.test(settings.paginationPosition!) ? pagination : null}
			</Flex>
		</Flex>
	);
	// useWhyDidYouUpdate("ProTable", {
	// 	field,
	// 	prefixCls,
	// 	dataSource,
	// 	dataSlice,
	// 	// settings,
	// 	columns,
	// 	body,
	// 	// rowSelection,
	// 	pagination,
	// 	header,
	// 	footer,
	// });

	return wrapSSR(
		<div>
			<ArrayBase>
				{header}
				<div ref={ref} className={cls(prefixCls, hashId)}>
					<Table
						bordered
						rowKey={rowKey}
						{...props}
						size={settings.size ?? "small"}
						title={undefined}
						footer={undefined}
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
