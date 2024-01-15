import { ArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import { useEffect } from "react";
import { ArrayTableProProps } from "../types";

export type IRowSelection = Required<ArrayTableProProps>["rowSelection"] & {
  selectedRows?: Parameters<Required<IRowSelection>["onChange"]>[1];
  info?: Parameters<Required<IRowSelection>["onChange"]>[2];
};

export type IRowSelectionConfig = Exclude<IRowSelection, true | undefined>;

type RowKey = string | ((row: any) => React.Key);

const getRowsByKey = (array: any, keys: React.Key[], rowKey: RowKey) => {
  if (keys.length === 0) return [];
  return array.filter((item: any) => {
    const key = typeof rowKey === "function" ? rowKey(item) : item[rowKey];
    return keys.includes(key);
  });
};

export const useRowSelectionAttach = (
  rowKeyRef?: React.MutableRefObject<RowKey>,
) => {
  const array = useField<ArrayField>();
  useEffect(() => {
    array.setState((s) => {
      if (!s.componentProps) {
        s.componentProps = {};
      }
      if (s.componentProps?.rowSelection === true) {
        s.componentProps.rowSelection = {};
      }
      const $row: IRowSelectionConfig = s.componentProps?.rowSelection;
      if (!$row) return;

      const _onChange = $row?.onChange;

      const override: IRowSelectionConfig = {
        selectedRowKeys: [],
        selectedRows:
          $row?.selectedRowKeys && rowKeyRef?.current
            ? getRowsByKey(array.value, $row.selectedRowKeys, rowKeyRef.current)
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
  }, [array]);
};
