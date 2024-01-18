import { ArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import React, { createContext, useEffect, useState } from "react";
import { ArrayTableProProps, IChangeData } from "../types";

export type IPaginationProps = Required<ArrayTableProProps>["pagination"];

export type IPaginationOptions = Exclude<IPaginationProps, false | undefined>;

export interface IArraySelectionContext {
  current: number;
  pageSize: number;
  setPagination: React.Dispatch<
    React.SetStateAction<{ current: number; pageSize: number }>
  >;
}

export const ArrayPaginationContext = createContext<IArraySelectionContext>({
  current: 1,
  pageSize: 10,
  setPagination: (x) => x,
});

export const usePagination = (
  props: IPaginationProps | undefined,
  _onChange?: (
    current: number,
    pageSize: number,
    other: Omit<IPaginationOptions, "current" | "pageSize">,
  ) => void,
) => {
  const [page, setPage] = useState({
    current: props !== false ? props?.current ?? 1 : 1,
    pageSize: props !== false ? props?.pageSize ?? 10 : 10,
  });

  const merged: IPaginationProps | null = props
    ? {
        ...page,
        ...props,
        onChange(current, pageSize) {
          setPage({
            current,
            pageSize,
          });
          props.onChange?.(current, pageSize);
          _onChange?.(current, pageSize, props);
        },
        onShowSizeChange(current, pageSize) {
          setPage({
            current,
            pageSize,
          });
          props.onShowSizeChange?.(current, pageSize);
          _onChange?.(current, pageSize, props);
        },
      }
    : null;

  const ctx: IArraySelectionContext | null = props
    ? {
        ...page,
        setPagination: setPage,
      }
    : null;

  return [ctx, merged] as const;
};
