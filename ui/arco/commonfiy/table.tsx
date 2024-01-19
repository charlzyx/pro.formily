import {
  Table as ArcoTable,
  TableProps as ArcoTableProps,
} from "@arco-design/web-react";
import React from "react";

export interface TableProps<T>
  extends Omit<
    ArcoTableProps<T>,
    | "defaultExpandAllRows"
    | "defaultExpandedRowKeys"
    | "expandedRowKeys"
    | "expandedRowRender"
    | "onExpand"
    | "onExpandedRowsChange"
    | "onChange"
    | "pagination"
    | "rowSelection"
    | "data"
  > {
  dataSource?: T[];
  expandable?: {
    defaultExpandAllRows?: ArcoTableProps<T>["defaultExpandAllRows"];
    defaultExpandedRowKeys?: ArcoTableProps<T>["defaultExpandedRowKeys"];
    expandedRowKeys?: ArcoTableProps<T>["expandedRowKeys"];
    expandedRowRender?: (
      record: Parameters<Required<ArcoTableProps<T>>["expandedRowRender"]>[0],
      index: Parameters<Required<ArcoTableProps<T>>["expandedRowRender"]>[1],
      indent: number,
      expaneded: boolean,
    ) => React.ReactNode;
    onExpand?: ArcoTableProps<T>["onExpand"];
    onExpandedRowsChange?: ArcoTableProps<T>["onExpandedRowsChange"];
  };
  pagination:
    | (Omit<
        Exclude<Required<ArcoTableProps<T>>["pagination"], boolean>,
        "onPageSizeChange"
      > & {
        onShowSizeChange?: Exclude<
          Required<ArcoTableProps<T>>["pagination"],
          boolean
        >["onPageSizeChange"];
      })
    | false;
  rowSelection?: Omit<
    Required<ArcoTableProps<T>>["rowSelection"],
    "onChange"
  > & {
    onChange?: (
      selectedRowKeys: Parameters<
        Required<Required<ArcoTableProps<T>>["rowSelection"]>["onChange"]
      >[0],
      selectedRows: Parameters<
        Required<Required<ArcoTableProps<T>>["rowSelection"]>["onChange"]
      >[1],
      info: any,
    ) => void;
  };
  onChange?: (
    pagination: Parameters<Required<ArcoTableProps<T>>["onChange"]>[0],
    filters: Parameters<Required<ArcoTableProps<T>>["onChange"]>[1],
    sorter: Parameters<Required<ArcoTableProps<T>>["onChange"]>[2],
    extra: {
      action: Parameters<Required<ArcoTableProps<T>>["onChange"]>[3]["action"];
      currentDataSource: Parameters<
        Required<ArcoTableProps<T>>["onChange"]
      >[3]["currentData"];
    },
  ) => void;
  title?: (ds: T[]) => React.ReactNode;
}

export const Table = <T extends object>(props: TableProps<T>) => {
  const {
    expandable,
    pagination: _pagination,
    onChange: _onChange,
    dataSource,
    rowSelection,
    ...others
  } = props;
  const pagination = _pagination
    ? {
        ..._pagination,
        onPageSizeChange: _pagination.onShowSizeChange,
      }
    : _pagination;

  const onChange: ArcoTableProps<T>["onChange"] = _onChange
    ? (p, f, s, e) => {
        return _onChange(p, f, s, {
          action: e.action,
          currentDataSource: e.currentData,
        });
      }
    : undefined;

  return (
    <ArcoTable
      {...(expandable as any)}
      {...others}
      rowSelection={(rowSelection as any) === true ? {} : rowSelection}
      data={dataSource}
      onChange={onChange}
      pagination={pagination}
    ></ArcoTable>
  );
};
