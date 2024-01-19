import React, { createContext, useState } from "react";
import { ProArrayTableProps } from "../types";

export type IPaginationProps = Required<ProArrayTableProps>["pagination"];

export type IPaginationOptions = Exclude<IPaginationProps, false | undefined>;

export interface ITableSelectionContext {
  current: number;
  pageSize: number;
  total: number;
  setPagination: React.Dispatch<
    React.SetStateAction<{ current: number; pageSize: number }>
  >;
}

export const TablePaginationContext = createContext<ITableSelectionContext>({
  current: 1,
  pageSize: 10,
  total: 0,
  setPagination: (x) => x,
});

export const usePagination = (
  propPage: IPaginationProps | undefined,
  total: number,
  _onChange?: (
    current: number,
    pageSize: number,
    other: Omit<IPaginationOptions, "current" | "pageSize">,
  ) => void,
) => {
  // 默认开启, false 显式配置关闭
  const props =
    propPage === undefined
      ? ({
          hideOnSinglePage: true,
        } as IPaginationOptions)
      : propPage;
  const [page, setPage] = useState({
    current: props !== false ? props?.current ?? 1 : 1,
    pageSize: props !== false ? props?.pageSize ?? 10 : 10,
  });

  const ctx: ITableSelectionContext | null = props
    ? {
        ...page,
        total: props.total ?? total,
        setPagination: setPage,
      }
    : null;

  const merged = props
    ? ({
        size: "small",
        ...props,
        ...ctx,
        onChange(current, pageSize) {
          setPage({
            current,
            pageSize,
          });
          props.onChange?.(current, pageSize);
          _onChange?.(current, pageSize, props);
        },
        onShowSizeChange(_current, pageSize) {
          // reset to first
          const current = 1;
          setPage({
            current,
            pageSize,
          });
          props.onShowSizeChange?.(current, pageSize);
          _onChange?.(current, pageSize, props);
        },
      } as IPaginationProps)
    : null;

  return [ctx, merged] as const;
};
