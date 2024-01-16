import { ArrayField } from "@formily/core";
import { ReactFC, RecursionField, observer, useField } from "@formily/react";
import React, { useEffect, useRef } from "react";
// import useWhyDidYouUpdate from "ahooks/es/useWhyDidYouUpdate";
import { Pagination, Space, Table, Typography } from "../adaptor";
import { ArrayBase, builtins } from "../adaptor/adaptor";
import { ProSettings } from "./features/pro-settings";
import { ResizableTitle } from "./features/resizeable";
import { useSortable } from "./features/sortable";
import { useExpandableAttach } from "./features/use-expandable-attach";
import { usePagination } from "./features/use-pagination-attach";
import { useRowSelectionAttach } from "./features/use-row-selection-attach";
import { isColumnComponent } from "./helper";
import {
  useAddition,
  useArrayTableColumns,
  useArrayTableSources,
  useFooter,
  useToolbar,
} from "./hooks";
import { Addition, Column, Flex, RowExpand, RowSelectionPro } from "./mixin";
import { ArrayTableProProps, IChangeData } from "./types";
const { usePrefixCls } = builtins;
import useStyle from "../adaptor/themes/array-table-pro/useStyle";

const ProArrayTable: ReactFC<ArrayTableProProps> = observer((props) => {
  const ref = useRef<HTMLDivElement>(null);
  const field = useField<ArrayField>();
  const prefixCls = usePrefixCls("formily-array-table");

  const [wrapSSR, hasId] = useStyle(prefixCls);
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
      {(props.rowSelection as any)?.position === "top" ? (
        <RowSelectionPro ds={dataSlice} rowKey={rowKey}></RowSelectionPro>
      ) : null}
      {toolbar}
      {addition}
      {!props.extra && props.settings === false ? null : (
        <Space size="small">
          {props.extra}
          {props.settings !== false ? (
            <ProSettings columns={proColumns}></ProSettings>
          ) : null}
        </Space>
      )}
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
      {(props.rowSelection as any)?.position === "bottom" ? (
        <RowSelectionPro ds={dataSlice} rowKey={rowKey}></RowSelectionPro>
      ) : null}
      {footer}
      <Flex justifyContent={"flex-end"}>{pagination}</Flex>
    </Flex>
  );

  return wrapSSR(
    <ArrayBase>
      {_header}
      <div ref={ref} className={`${prefixCls} ${hasId}`}>
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
    </ArrayBase>,
  );
});

export const ArrayTablePro = Object.assign(ArrayBase.mixin(ProArrayTable), {
  Column,
  Addition,
  RowExpand,
});

ArrayTablePro.displayName = "ArrayTablePro";
