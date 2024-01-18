import { ArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import React, { useEffect } from "react";
import { ArrayTableProProps, IChangeData } from "../types";

export type IPaginationProps = Required<ArrayTableProProps>["pagination"] & {
  reset: () => void;
};

export const usePagination = (
  dataSource: any[],
  changeData: React.MutableRefObject<IChangeData>,
  onTableChange: ArrayTableProProps["onChange"],
) => {
  const array = useField<ArrayField>();

  useEffect(() => {
    if (
      array.componentProps?.pagination?.total !== 0 ||
      dataSource.length === array.componentProps?.pagination?.total
    )
      return;
    array.setState((s) => {
      if (s.componentProps?.pagination) {
        s.componentProps!.pagination.total = dataSource.length;
      }
    });
  }, [dataSource.length]);
  useEffect(() => {
    const init = {
      current: array.componentProps?.pagination?.current ?? 1,
      pageSize: array.componentProps?.pagination?.pageSize ?? 10,
    };

    array.setState((s) => {
      if (!s.componentProps) {
        s.componentProps = {};
      }
      // 默认开启
      if (s.componentProps?.pagination !== false) {
        s.componentProps.pagination = {};
      }
      const $page: IPaginationProps = s.componentProps?.pagination;
      if (!$page) return;

      const _onChange = $page?.onChange;
      const _onShowSizeChange = $page?.onShowSizeChange;
      // const _onTableChange = s.componentProps
      //   ?.onTableChange as TableProps<any>["onChange"];
      const override: IPaginationProps = {
        ...init,
        size: "small",
        hideOnSinglePage: true,
        get total() {
          return array.value.length;
        },
        onChange(page, pageSize) {
          $page.current = page;
          $page.pageSize = pageSize;

          if (_onChange) {
            _onChange(page, pageSize);
          }

          if (onTableChange) {
            changeData.current.pagination = {
              ...$page,
            };
            changeData.current.extra = {
              action: "paginate",
              currentDataSource: array.value,
            };
            onTableChange(
              changeData.current.pagination,
              changeData.current.filters,
              changeData.current.sorter,
              changeData.current.extra,
            );
          }
        },
        onShowSizeChange(current, size) {
          $page.current = 1;
          $page.pageSize = size;
          if (_onShowSizeChange) {
            _onShowSizeChange(current, size);
          }
          if (onTableChange) {
            changeData.current.pagination = {
              ...$page,
            };
            changeData.current.extra = {
              action: "paginate",
              currentDataSource: array.value,
            };
            onTableChange(
              changeData.current.pagination,
              changeData.current.filters,
              changeData.current.sorter,
              changeData.current.extra,
            );
          }
        },
        reset() {
          $page.current = init.current;
          // next tick
          return new Promise((resolve) => {
            setTimeout(resolve);
          });
        },
      };

      Object.keys(override).forEach((k) => {
        ($page as any)[k] = ($page as any)[k] || toJS((override as any)[k]);
      });

      console.debug(
        `feature of ${array.address.toString()}:pagination turn on.`,
      );
    });
  }, [array]);
};
