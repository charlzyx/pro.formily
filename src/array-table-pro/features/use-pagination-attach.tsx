import { ArrayField } from "@formily/core";
import { useField } from "@formily/react";
import { toJS } from "@formily/reactive";
import { Table } from "antd";
import { useEffect, useRef } from "react";
import { IQueryListContext } from "src/query-list";

export type IPaginationProps = Exclude<
  Required<React.ComponentProps<typeof Table>>["pagination"],
  boolean
> & {
  reset: () => void;
};

export const usePaginationAttach = (
  dataSource: any[],
  querylist: IQueryListContext,
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
    // none or not me
    if (!querylist.none || querylist.table !== array) {
      querylist.memo.current.init.pagination!.current = init.current;
      querylist.memo.current.init.pagination!.pageSize = init.pageSize;
      querylist.memo.current.data.pagination!.current = init.current;
      querylist.memo.current.data.pagination!.pageSize = init.pageSize;
    }
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

      const override: IPaginationProps = {
        ...init,
        size: "small",
        position: ["bottomRight"],
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
          // none or not me
          if (!querylist.none || querylist.table === array) {
            querylist.memo.current.data.pagination!.current = page;
            querylist.memo.current.data.pagination!.pageSize = pageSize;
            querylist.run();
          }
        },
        onShowSizeChange(current, size) {
          $page.current = 1;
          $page.pageSize = size;
          if (_onShowSizeChange) {
            _onShowSizeChange(current, size);
          }
          // none or not me
          if (!querylist.none || querylist.table === array) {
            querylist.memo.current.data.pagination!.pageSize = size;
            querylist.run();
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
  }, [array, querylist.table]);
};
