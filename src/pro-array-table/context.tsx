import { TableColumnType, TableProps } from "antd";
import type { ConfigProviderProps } from "antd/lib/config-provider";
import React, { createContext } from "react";

export interface IProArrayTableMaxContext {
  columns: TableColumnType<any>[];
  reset: () => void;
  size: ConfigProviderProps["componentSize"];
  paginationPosition: Exclude<
    Exclude<TableProps<any>["pagination"], boolean | undefined>["position"],
    undefined
  >[0];
}

export const getPaginationPosition = (
  pos: IProArrayTableMaxContext["paginationPosition"],
): React.CSSProperties["justifyContent"] => {
  return /center/.test(pos)
    ? "center"
    : /left/.test(pos)
      ? "flex-start"
      : "flex-end";
};

export const ProArrayTableMaxContext = createContext<IProArrayTableMaxContext>({
  reset() {},
  columns: [],
  size: "small",
  paginationPosition: "bottomRight",
});
