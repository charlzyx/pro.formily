import { ArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import { Table } from "antd";
import { useEffect } from "react";

export type IRowSelection = Exclude<
  Required<React.ComponentProps<typeof Table>>["rowSelection"],
  boolean
> & {
  selectedRows?: Parameters<Required<IRowSelection>["onChange"]>[1];
  info?: Parameters<Required<IRowSelection>["onChange"]>[2];
};

type RowKey = string | ((row: any) => React.Key);

const getRowsByKey = (array: any, keys: React.Key[], rowKey: RowKey) => {
  if (keys.length === 0) return [];
  return array.filter((item: any) => {
    const key = typeof rowKey === "function" ? rowKey(item) : item[rowKey];
    return keys.includes(key);
  });
};

export const useRowSelectionAttach = (rowKey?: RowKey) => {
  const array = useField<ArrayField>();
  useEffect(() => {
    array.setState((s) => {
      if (!s.componentProps) {
        s.componentProps = {};
      }
      if (s.componentProps?.rowSelection === true) {
        s.componentProps.rowSelection = {};
      }
      const $row: IRowSelection = s.componentProps?.rowSelection;
      if (!$row) return;

      const _onChange = $row?.onChange;

      const override: IRowSelection = {
        selectedRowKeys: [],
        selectedRows:
          $row?.selectedRowKeys && rowKey
            ? getRowsByKey(array.value, $row.selectedRowKeys, rowKey)
            : [],
        info: { type: "none" },
        onChange(keys, rows, info) {
          $row.selectedRowKeys = keys;
          $row.selectedRows = rows;
          $row.info = info;
          if (_onChange) {
            _onChange(keys, rows, info);
          }
        },
      };

      Object.keys(override).forEach((k) => {
        ($row as any)[k] = ($row as any)[k] || toJS((override as any)[k]);
      });

      console.debug(
        `feature of ${array.address.toString()}:row-selection turn on.`,
      );
    });
  }, [array, rowKey]);
};
