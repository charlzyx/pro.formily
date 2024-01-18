import React, { createContext, useState } from "react";
import { ArrayTableProProps } from "../types";

export type IRowSelectionProps = ArrayTableProProps["rowSelection"];

export type IRowSelectionOptions = Exclude<
  IRowSelectionProps,
  true | undefined
>;

export interface IArraySelectionContext {
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
}

export const ArrayRowSelectionContext = createContext<IArraySelectionContext>({
  selectedRowKeys: [],
  setSelectedRowKeys: (x) => x,
});

export const useRowSelection = (props: IRowSelectionProps) => {
  const [keys, setKeys] = useState([
    ...(props?.defaultSelectedRowKeys ?? []),
    ...(props?.selectedRowKeys ?? []),
  ]);

  const merged: IRowSelectionOptions | null = props
    ? {
        ...(props === true ? {} : props),
        selectedRowKeys: keys,
        onChange(selectedRowKeys, ...rest) {
          setKeys(selectedRowKeys);
          props?.onChange?.(selectedRowKeys, ...rest);
        },
      }
    : null;

  const ctx: IArraySelectionContext | null = props
    ? {
        selectedRowKeys: keys,
        setSelectedRowKeys: setKeys,
      }
    : null;

  return [ctx, merged] as const;
};
