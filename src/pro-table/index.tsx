import { ArrayField } from "@formily/core";
import {
	ReactFC,
	RecursionField,
	observer,
	useField,
	useFieldSchema,
} from "@formily/react";
import { Table, TableProps } from "antd";
import cls from "classnames";
import React, { useRef } from "react";
import { empty, noop, usePrefixCls } from "../__builtins__";
import { ArrayBase } from "../array-base";
import { renderPage, usePagination$ } from "./features/pagination";
import { RowComp, getWrapperComp } from "./features/sortable";
import { hasSortable, isColumnComponent } from "./helper";
import {
	useAddition,
	useArrayTableColumns,
	useArrayTableSources,
} from "./hooks";
import { Addition, Column } from "./mixin";
import useStyle from "./style";

const InternalArrayTable: ReactFC<TableProps<any>> = observer(
	(props: TableProps<any>) => {
		const ref = useRef<HTMLDivElement>(null);
		const field = useField<ArrayField>();
		const schema = useFieldSchema();
		const prefixCls = usePrefixCls("formily-array-table");
		const [wrapSSR, hashId] = useStyle(prefixCls);
		const dataSource = Array.isArray(field.value) ? field.value.slice() : [];
		const sources = useArrayTableSources();
		const columns = useArrayTableColumns(dataSource, field, sources);
		const { page, dataSlice, startIndex } = usePagination$(
			field,
			dataSource,
			props.pagination!,
		);
		const addition = useAddition();
		const defaultRowKey = (record: any) => {
			return dataSource.indexOf(record);
		};

		const body = hasSortable(schema)
			? {
					body: {
						wrapper: getWrapperComp({
							list: dataSource,
							start: startIndex!,
							prefixCls,
							onSortEnd: field.move,
							ref,
						}),
						row: RowComp,
					},
			  }
			: (empty as any);

		return wrapSSR(
			<div ref={ref} className={cls(prefixCls, hashId)}>
				<ArrayBase>
					<Table
						size="small"
						bordered
						rowKey={defaultRowKey}
						{...props}
						onChange={noop}
						pagination={false}
						columns={columns}
						dataSource={dataSlice}
						components={body}
					/>
					{renderPage(page, props.pagination)}
					{sources.map((column, key) => {
						if (!isColumnComponent(column.schema)) return;
						return React.createElement(RecursionField, {
							name: column.name,
							schema: column.schema,
							onlyRenderSelf: true,
							key,
						});
					})}
					{addition}
				</ArrayBase>
			</div>,
		);
	},
);

export const ProTable = Object.assign(ArrayBase.mixin(InternalArrayTable), {
	Column,
	Addition,
});

ProTable.displayName = "ProTable";
