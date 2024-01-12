import { usePrefixCls } from "@formily/antd/esm/__builtins__";
import { ArrayField } from "@formily/core";
import { ReactFC, RecursionField, observer, useField } from "@formily/react";
import { model } from "@formily/reactive";
import { clone } from "@formily/shared";
import useCreation from "ahooks/es/useCreation";
// import useWhyDidYouUpdate from "ahooks/es/useWhyDidYouUpdate";
import { Pagination, Table, Typography } from "antd";
import { TableProps } from "antd/es/table";
import React, { useContext, useEffect, useMemo, useRef } from "react";
import { useQueryListContext } from "src/query-list";
import { ArrayBase } from "./array-base";
import {
  ArrayTableProSettingsContext,
  IArrayTableProSettingsContext,
  columnPro,
  getPaginationPosition,
} from "./context";
import { ProSettings } from "./features/pro-settings";
import { ResizableTitle } from "./features/resizeable";
import { useSortable } from "./features/sortable";
import { useExpandableAttach } from "./features/use-expandable-attach";
import { usePaginationAttach } from "./features/use-pagination-attach";
import { useRowSelectionAttach } from "./features/use-row-selection-attach";
import { isColumnComponent } from "./helper";
import {
  useAddition,
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
  /** 是否是开启 slice 性能优化, 默认开启  */
  slice?: boolean;
};

const ArrayTableProSettings: ReactFC<ArrayTableProProps> = observer((props) => {
  const [columns] = useArrayTableSources();

  const init = useRef(columnPro(columns));

  const proSettings = useCreation(() => {
    return model<IArrayTableProSettingsContext>({
      columns: [],
      size: "small",
      paginationPosition: "bottomRight",
      reset() {
        this.size = "small";
        this.paginationPosition = "bottomRight";
        this.columns = clone(init.current);
      },
    });
  }, []);

  // if touched, skip, or maxium render oom.
  if (proSettings.columns.length === 0 && columns.length > 0) {
    proSettings.columns = columnPro(columns);
  }

  return (
    <ArrayTableProSettingsContext.Provider value={proSettings}>
      <InternalArrayTable
        size={proSettings.size}
        {...props}
      ></InternalArrayTable>
    </ArrayTableProSettingsContext.Provider>
  );
});

const InternalArrayTable: ReactFC<ArrayTableProProps> = observer((props) => {
  const ref = useRef<HTMLDivElement>(null);
  const field = useField<ArrayField>();
  const prefixCls = usePrefixCls("formily-array-table");
  const [columns, sources] = useArrayTableSources();
  const dataSource = Array.isArray(field.value) ? field.value.slice() : [];

  const querylist = useQueryListContext();

  useEffect(() => {
    if (querylist && field?.address) {
      querylist.setAddress(field.address.toString(), "table");
    }
  }, [querylist, field?.address]);

  usePaginationAttach(dataSource, querylist);

  const page = props.pagination;
  const startIndex = page ? (page.current! - 1) * page.pageSize! : 0;

  const proSettings = useContext(ArrayTableProSettingsContext);

  const dataSlice = useMemo(() => {
    if (page && props.slice !== false && querylist.none) {
      return (page as any)?.pageSize
        ? dataSource.slice(startIndex, startIndex + (page as any).pageSize)
        : dataSource;
    } else {
      return dataSource;
    }
  }, [dataSource, page, startIndex, querylist?.none]);

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
    const got = props.rowKey
      ? typeof props.rowKey === "function"
        ? props.rowKey(record)
        : record?.[props.rowKey]
      : dataSource.indexOf(record);
    return got;
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
        size={page.size || (proSettings.size as any)}
      ></Pagination>
    </div>
  );

  const showHeader =
    props.title ||
    props.rowSelection ||
    (/top/.test(proSettings.paginationPosition!) && pagination) ||
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
      <Flex
        justifyContent={getPaginationPosition(proSettings.paginationPosition)}
      >
        {/top/.test(proSettings.paginationPosition!) ? pagination : null}
      </Flex>
      {toolbar}
      {addition}
      {props.settings !== false ? <ProSettings></ProSettings> : null}
    </Flex>
  );

  const showFooter =
    props.footer ||
    footer ||
    (/bottom/.test(proSettings.paginationPosition!) && pagination);
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
      <Flex
        justifyContent={getPaginationPosition(proSettings.paginationPosition)}
      >
        {/bottom/.test(proSettings.paginationPosition!) ? pagination : null}
      </Flex>
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
          loading={props.loading ?? querylist?.loading}
          size={proSettings.size ?? "small"}
          title={undefined}
          footer={undefined}
          // 这里不处理 page 是因为 pagination 被我们重写了
          onChange={(_page, filters, sorter, extra) => {
            if (querylist.none) return;
            querylist.memo.current.data.filters = filters;
            querylist.memo.current.data.sorter = sorter;
            querylist.memo.current.data.extra = extra;
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

export const ArrayTablePro = Object.assign(
  ArrayBase.mixin(ArrayTableProSettings),
  {
    Column,
    Addition,
    RowExpand,
  },
);

ArrayTablePro.displayName = "ArrayTablePro";
