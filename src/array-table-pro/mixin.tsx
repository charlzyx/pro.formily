import { ReactFC, observer } from "@formily/react";
import React, { Fragment, useContext } from "react";
import { Alert, BUTTON_TYPE, Button, Divider, Space } from "../adaptor";
import { ArrayBase, ArrayBaseMixins } from "../adaptor/adaptor";
import { ArrayPaginationContext } from "./features/pagination";
import { ArrayRowSelectionContext } from "./features/row-selection";
import type { ColumnProps } from "./types";

export const Column: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};
export const RowExpand: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};

export const Addition: ArrayBaseMixins["Addition"] = observer((props) => {
  const array = ArrayBase.useArray();
  const page = useContext(ArrayPaginationContext);
  return (
    <ArrayBase.Addition
      block={false}
      type={BUTTON_TYPE}
      {...props}
      onClick={(e) => {
        // 如果添加数据后将超过当前页，则自动切换到下一页
        if (!page) return;
        const total = array?.field?.value.length || 0;
        if (total >= page!.current! * page.pageSize!) {
          page.setPagination((memo) => {
            return { ...memo, current: memo.current + 1 };
          });
        }
        props.onClick?.(e);
      }}
    />
  );
});

export const Flex = (
  props: React.PropsWithChildren<
    {
      justifyContent?: React.CSSProperties["justifyContent"];
    } & Pick<React.CSSProperties, "marginTop" | "marginBottom">
  >,
) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        flex: 1,
        alignItems: "center",
        justifyContent: props.justifyContent || "flex-end",
      }}
    >
      {props.children}
    </div>
  );
};

export const RowSelectionPro = (props: {
  ds: any[];
  rowKey: (record: any) => string | number;
}) => {
  const { ds, rowKey } = props;
  const array = ArrayBase.useArray();
  const $row = useContext(ArrayRowSelectionContext);
  // const [, $row] = useArrayCompPropsOf(array?.field, "rowSelection");
  return ds.length > 0 ? (
    <Alert
      style={{ padding: "3px 4px" }}
      type="info"
      message={
        <Space size="small" split={<Divider type="vertical" />}>
          <Button
            type="text"
            size="small"
            style={{ width: "60px", textAlign: "left" }}
          >
            选中 {$row?.selectedRowKeys?.length} 项
          </Button>
          <Button
            size="small"
            onClick={() => {
              if (!$row) return;
              $row.setSelectedRowKeys([]);
            }}
            type={BUTTON_TYPE}
          >
            清空
          </Button>
          <Button
            size="small"
            onClick={() => {
              if (!$row) return;
              const keys: (string | number)[] = [];
              ds.forEach((item) => {
                const key = rowKey(item);
                keys.push(key);
              });
              $row.setSelectedRowKeys(keys);
            }}
            type={BUTTON_TYPE}
          >
            全选
          </Button>

          <Button
            size="small"
            onClick={() => {
              if (!$row) return;
              const selected = $row.selectedRowKeys.reduce(
                (m: Record<string | number, true>, i: any) => {
                  m[i] = true;
                  return m;
                },
                {},
              );
              const keys: (string | number)[] = [];
              ds.forEach((item) => {
                const key = rowKey(item);
                if (!selected[key]) {
                  keys.push(key);
                }
              });
              $row.setSelectedRowKeys(keys);
            }}
            type={BUTTON_TYPE}
          >
            反选
          </Button>
        </Space>
      }
    />
  ) : null;
};
