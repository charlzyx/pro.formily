import { usePrefixCls } from "@formily/antd/esm/__builtins__";
import { ArrayField } from "@formily/core";
import { ReactFC, RecursionField, observer, useField } from "@formily/react";
import { Table, TableProps, Typography } from "antd";
import React, { useMemo, useRef } from "react";
import { noop } from "../__builtins__";
import { ArrayBase } from "./array-base";
import { useSortable } from "./features/sortable";
import { useExpandableAttach } from "./features/use-expandable-attach";
import { usePaginationAttach } from "./features/use-pagination-attach";
import { getPostion, useProSettings } from "./features/use-pro-settings";
import { useRowSelectionAttach } from "./features/use-row-selection-attach";
import { isColumnComponent } from "./helper";
import {
  useAddition,
  useArrayTableColumns,
  useArrayTableSources,
  useFootbar,
  useToolbar,
} from "./hooks";
import {
  Addition,
  Column,
  Flex,
  ProSettings,
  RowSelection,
  TablePagination,
} from "./mixin";
import "./style";
export { useArrayField } from "./hooks";

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
  const sources = useArrayTableSources();
  const dataSource = Array.isArray(field.value) ? field.value.slice() : [];

  const [, refColumns] = useArrayTableColumns(field, sources);
  usePaginationAttach(dataSource);
  useExpandableAttach();
  const page = props.pagination;
  const startIndex = page ? (page.current! - 1) * page.pageSize! : 0;

  const [settings, columns, setSettings] = useProSettings(
    refColumns,
    props as TableProps<any>,
  );

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
  const toolbar = useToolbar();
  const footbar = useFootbar();

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
        size={page.size || (settings.size as any)}
        position={undefined}
      ></TablePagination>
    </div>
  );

  const showHeader =
    props.title ||
    props.rowSelection ||
    (/top/.test(settings.paginationPosition!) && pagination) ||
    toolbar ||
    addition ||
    props.settings;

  const header = !showHeader ? null : (
    <Flex marginBottom={`${6}px`}>
      {props.title ? (
        typeof props.title === "function" ? (
          props.title(dataSource)
        ) : (
          <Typography.Title level={5} style={{ flex: 1 }}>
            {props.title}
          </Typography.Title>
        )
      ) : null}
      {props.rowSelection ? (
        <RowSelection ds={dataSlice} rowKey={rowKey}></RowSelection>
      ) : null}
      <Flex justifyContent={getPostion(settings.paginationPosition)}>
        {/top/.test(settings.paginationPosition!) ? pagination : null}
      </Flex>
      {toolbar}
      {addition}
      {props.settings !== false ? (
        <ProSettings value={settings} onChange={setSettings}></ProSettings>
      ) : null}
    </Flex>
  );

  const showFooter =
    props.footer ||
    footbar ||
    (/bottom/.test(settings.paginationPosition!) && pagination);
  const footer = !showFooter ? null : (
    <Flex marginTop={`${6}px`}>
      {props.footer ? (
        typeof props.footer === "function" ? (
          props.footer(dataSource)
        ) : (
          <Typography.Title level={5}>{props.footer}</Typography.Title>
        )
      ) : null}
      {footbar}
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

  return (
    <div>
      <ArrayBase>
        {header}
        <div ref={ref} className={prefixCls}>
          <Table
            bordered
            rowKey={rowKey}
            {...props}
            size={settings.size ?? "small"}
            title={undefined}
            footer={undefined}
            // TODO: 跟 查询表单联动
            onChange={noop}
            pagination={false}
            columns={columns}
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
    </div>
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
