import React, { createContext, useEffect, useState } from "react";
import { ProArrayTableProps, RowKey } from "../types";

export type IRowSelectionProps = ProArrayTableProps["rowSelection"];

export type IRowSelectionOptions = Exclude<
  IRowSelectionProps,
  true | undefined
>;

export interface ITableSelectionContext {
  selectedRowKeys: RowKey[];
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<RowKey[]>>;
}

export const TableRowSelectionContext = createContext<ITableSelectionContext>({
  selectedRowKeys: [],
  setSelectedRowKeys: (x) => x,
});

export const useRowSelection = (
  propRowSelection: IRowSelectionProps,
  pageNo?: number,
) => {
  const [keys, setKeys] = useState([
    // @ts-ignore for arco
    ...(propRowSelection?.defaultSelectedRowKeys ?? []),
    ...(propRowSelection?.selectedRowKeys ?? []),
  ]);

  const ctx: ITableSelectionContext | null = propRowSelection
    ? {
        selectedRowKeys: keys,
        setSelectedRowKeys: setKeys,
      }
    : null;

  const props =
    propRowSelection === true ? ({} as IRowSelectionOptions) : propRowSelection;

  const merged = props
    ? ({
        ...props,
        ...ctx,
        showPro: props.type === "radio" ? false : props.showPro ?? "top",
        onChange(selectedRowKeys, ...rest) {
          setKeys(selectedRowKeys);
          propRowSelection?.onChange?.(selectedRowKeys, ...rest);
        },
      } as IRowSelectionOptions)
    : null;

  // 当页码变更的时候, 重置选中
  useEffect(() => {
    if (!pageNo) return;
    setKeys([]);
  }, [pageNo]);

  return [ctx, merged] as const;
};
