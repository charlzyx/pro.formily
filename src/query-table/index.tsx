import type { ArrayField } from "@formily/core";
import { observer, useField } from "@formily/react";
import { useEffect } from "react";
import { ProArrayTableProps } from "src/pro-array-table/types";
import {
  BUTTON_TYPE,
  Button,
  SyncOutlined,
  TablePaginationConfig,
} from "../adaptor";
import { ArrayBase } from "../adaptor/adaptor";
import { Addition, Column, RowExpand } from "../pro-array-table/mixin";
import { ProArrayTable } from "../pro-array-table/pro";
import { useQueryListContext } from "../query-list";

export const QueryTablePro = observer((overprops: ProArrayTableProps) => {
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

  const props: ProArrayTableProps = {
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
  const extra = (
    <Button
      size="small"
      type={BUTTON_TYPE}
      loading={querylist.loading}
      onClick={() => querylist.run()}
      icon={<SyncOutlined></SyncOutlined>}
    ></Button>
  );

  return (
    <ProArrayTable
      {...props}
      extra={extra}
      slice={false}
      loading={props.loading ?? querylist.loading}
    ></ProArrayTable>
  );
});

export const QueryTable = Object.assign(ArrayBase.mixin(QueryTablePro), {
  Column,
  Addition,
  RowExpand,
});

QueryTable.displayName = "QueryTable";
