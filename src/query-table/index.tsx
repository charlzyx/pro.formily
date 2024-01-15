import type { ArrayField } from "@formily/core";
import { observer, useField } from "@formily/react";
import { useEffect } from "react";
import { ArrayTableProProps } from "src/array-table-pro/types";
import { TablePaginationConfig } from "../adaptor";
import { ArrayBase } from "../adaptor/adaptor";
import { Addition, Column, RowExpand } from "../array-table-pro/mixin";
import { ArrayTablePro } from "../array-table-pro/pro";
import { useQueryListContext } from "../query-list";

export const QueryTablePro = observer((overprops: ArrayTableProProps) => {
  const field = useField<ArrayField>();
  const querylist = useQueryListContext();
  const page = {
    current: (overprops?.pagination as TablePaginationConfig)?.current ?? 1,
    pageSize: (overprops?.pagination as TablePaginationConfig)?.pageSize ?? 10,
  };
  useEffect(() => {
    if (field?.address && !querylist.none) {
      querylist.setAddress(field.address.toString(), "table");
      // init value
      querylist.memo.current.init.pagination!.current = page.current;
      querylist.memo.current.init.pagination!.pageSize = page.pageSize;
      querylist.memo.current.data.pagination!.current = page.current;
      querylist.memo.current.data.pagination!.pageSize = page.pageSize;
    }
  }, [querylist.none, field.address]);

  const props: ArrayTableProProps = {
    ...overprops,
    pagination: {
      ...overprops.pagination,
      ...page,
    },
    onTableChange(pagination, filters, sorter, extra) {
      if (overprops.onTableChange) {
        overprops.onTableChange(pagination, filters, sorter, extra);
      }
      if (querylist.none) return;
      querylist.memo.current.data.pagination = pagination;
      querylist.memo.current.data.filters = filters;
      querylist.memo.current.data.sorter = sorter;
      querylist.memo.current.data.extra = extra;
      querylist.run();
    },
  };

  return (
    <ArrayTablePro
      {...props}
      slice={false}
      loading={props.loading ?? querylist.loading}
    ></ArrayTablePro>
  );
});

export const QueryTable = Object.assign(ArrayBase.mixin(QueryTablePro), {
  Column,
  Addition,
  RowExpand,
});

QueryTable.displayName = "QueryTable";
