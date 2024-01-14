import { usePrefixCls } from "@formily/antd/esm/__builtins__";
import { ArrayField } from "@formily/core";
import { ReactFC, RecursionField, observer, useField } from "@formily/react";
// import useWhyDidYouUpdate from "ahooks/es/useWhyDidYouUpdate";
import { Pagination, Table, Typography } from "antd";
import { TableProps } from "antd/es/table";
import React, { useEffect, useRef } from "react";
import { ArrayBase } from "./array-base";
import { ProSettings } from "./features/pro-settings";
import { ResizableTitle } from "./features/resizeable";
import { useSortable } from "./features/sortable";
import { useExpandableAttach } from "./features/use-expandable-attach";
import { usePagination } from "./features/use-pagination";
import { useRowSelectionAttach } from "./features/use-row-selection-attach";
import { isColumnComponent } from "./helper";
import {
  useAddition,
  useArrayTableColumns,
  useArrayTableSources,
  useFooter,
  useToolbar,
} from "./hooks";
import { Addition, Column, Flex, RowExpand, RowSelection } from "./mixin";
import "./style";
export { useArrayField } from "./hooks";

export type ArrayTableProProps = Omit<TableProps<any>, "title"> & {
  title: string | TableProps<any>["title"];
  footer: string | TableProps<any>["footer"];
  /** 列表配置齿轮, 默认 true */
  settings?: boolean;
  /** 表头列宽是否可拖动, 默认 true */
  resizeable?: boolean;
  /** 是否开启根据 page 信息 slice 性能优化, 默认开启  */
  slice?: boolean;
  /** onChange 与 formily#field 的 onChange 冲突，但很有用， 所以改个名字 */
  onTableChange?: TableProps<any>["onChange"];
};

type TableChangeParams = Parameters<Required<TableProps<any>>["onChange"]>;

export type IChangeData = {
  pagination: TableChangeParams[0];
  filters: TableChangeParams[1];
  sorter: TableChangeParams[2];
  extra: TableChangeParams[3];
};

const ProArrayTable: ReactFC<ArrayTableProProps> = observer((props) => {
  const ref = useRef<HTMLDivElement>(null);
  const field = useField<ArrayField>();
  const prefixCls = usePrefixCls("formily-array-table");
  /**
   * 优化笔记：
   * 本来以为这个 slice 没什么用，直到我膝盖中了一箭
   * 联动: useArrayTableSources -> useColumns -> render -> indexOf
   */
  const dataSource = Array.isArray(field.value) ? field.value.slice() : [];
  const sources = useArrayTableSources();
  const [columns, proColumns] = useArrayTableColumns(
    field,
    sources,
    dataSource,
  );

  /** 因为 pagination 被我们重写了， 所以需要很啰嗦的处理一下 */
  const changeDataRef = useRef<IChangeData>({
    pagination: {},
    filters: {},
    sorter: {},
    extra: {} as any,
  });

  usePagination(dataSource, changeDataRef, props.onTableChange);

  const page = props.pagination;

  const startIndex = page ? (page.current! - 1) * page.pageSize! : 0;
  const endIndex = page ? startIndex + page.pageSize! : 0;

  const dataSlice =
    page && props.slice !== false
      ? dataSource.slice(startIndex, endIndex)
      : dataSource;

  const body = useSortable(dataSource, (from, to) => field.move(from, to), {
    ref,
    prefixCls,
    start: startIndex,
  });
  const addition = useAddition();
  const toolbar = useToolbar();
  const footer = useFooter();
  useExpandableAttach();

  const rowKey = (record: any) => {
    return props.rowKey
      ? typeof props.rowKey === "function"
        ? props.rowKey(record)
        : record?.[props.rowKey]
      : dataSource.indexOf(record);
  };

  const rowKeyRef = useRef(rowKey);
  useEffect(() => {
    rowKeyRef.current = rowKey;
  }, [rowKey]);

  useRowSelectionAttach(rowKeyRef);

  const pagination = !page ? null : (
    <div>
      <Pagination
        style={{
          padding: "8px 0",
        }}
        {...page}
        disabled={page.disabled ?? !!props.loading}
        size={page.size || (props.size as any)}
      ></Pagination>
    </div>
  );

  const showHeader =
    props.title ||
    props.rowSelection ||
    toolbar ||
    addition ||
    props.settings !== false;

  const _header = !showHeader ? null : (
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

      {toolbar}
      {addition}
      {props.settings !== false ? (
        <ProSettings columns={proColumns}></ProSettings>
      ) : null}
    </Flex>
  );

  const showFooter = props.footer || footer || pagination;
  const _footer = !showFooter ? null : (
    <Flex marginTop={`${6}px`}>
      {props.footer ? (
        typeof props.footer === "function" ? (
          props.footer(dataSource)
        ) : (
          <Typography.Title level={5}>{props.footer}</Typography.Title>
        )
      ) : null}
      {footer}
      <Flex justifyContent={"flex-end"}>{pagination}</Flex>
    </Flex>
  );

  return (
    <ArrayBase>
      {_header}
      <div ref={ref} className={prefixCls}>
        <Table
          bordered
          rowKey={rowKey}
          {...props}
          size={props.size ?? "small"}
          title={undefined}
          footer={undefined}
          // 这里不处理 page 是因为 pagination 被我们重写了
          onChange={(_page, filters, sorter, extra) => {
            if (!props.onTableChange) return;
            changeDataRef.current.filters = filters;
            changeDataRef.current.sorter = sorter;
            changeDataRef.current.extra = extra;
            props.onTableChange(
              changeDataRef.current.pagination,
              filters,
              sorter,
              extra,
            );
          }}
          pagination={false}
          columns={columns}
          dataSource={dataSlice}
          components={{
            ...props.components,
            header: {
              ...props.components?.header,
              cell:
                props.resizeable !== false
                  ? ResizableTitle
                  : props.components?.header?.cell,
            },
            body: {
              ...body,
              ...props.components?.body,
            },
          }}
        />
      </div>
      {_footer}
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
  );
});

export const ArrayTablePro = Object.assign(ArrayBase.mixin(ProArrayTable), {
  Column,
  Addition,
  RowExpand,
});

ArrayTablePro.displayName = "ArrayTablePro";
