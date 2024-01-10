import { ArrayBaseMixins } from "@formily/antd";
import { ReactFC, observer } from "@formily/react";
import { Alert, Button, Divider, Space } from "antd";
import { ColumnProps } from "antd/es/table";
import React, { Fragment } from "react";
import { ArrayBase } from "./array-base";
import { useCompPropsOf } from "./features/hooks";

export const Column: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};
export const Expand: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};

export const Addition: ArrayBaseMixins["Addition"] = observer((props) => {
  const array = ArrayBase.useArray();
  const [, $page] = useCompPropsOf(array.field, "pagination");
  return (
    <ArrayBase.Addition
      block={false}
      type="link"
      {...props}
      onClick={(e) => {
        // 如果添加数据后将超过当前页，则自动切换到下一页
        if (!$page) return;
        const total = array?.field?.value.length || 0;
        if (total >= $page!.current! * $page.pageSize!) {
          $page.current! += 1;
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
export const RowSelection = (props: {
  ds: any[];
  rowKey: (record: any) => string | number;
}) => {
  const { ds, rowKey } = props;
  const array = ArrayBase.useArray();
  const [, $row] = useCompPropsOf(array.field, "rowSelection");
  return (
    <Space size="small">
      {$row?.selectedRowKeys?.length ? (
        <Alert
          style={{ padding: "3px 4px" }}
          type="info"
          message={
            <Space size="small" split={<Divider type="vertical" />}>
              <Button type="text" size="small">
                选中 {$row?.selectedRowKeys?.length} 项
              </Button>
              <Button
                size="small"
                onClick={() => {
                  if (!$row) return;
                  $row.selectedRows = [];
                  $row.selectedRowKeys = [];
                }}
                type="link"
              >
                取消选择
              </Button>
              <Button
                size="small"
                onClick={() => {
                  if (!$row) return;
                  const selected = $row.selectedRowKeys!.reduce(
                    (m: Record<string, string>, i: any) => {
                      m[i] = i;
                      return m;
                    },
                    {},
                  );
                  const keys: (string | number)[] = [];
                  const rows: any[] = [];
                  ds.forEach((item) => {
                    const key = rowKey(item);
                    if (!selected[key]) {
                      keys.push(key);
                      rows.push(item);
                    }
                  });
                  $row.selectedRowKeys = keys;
                  $row.selectedRows = rows;
                }}
                type="link"
              >
                选择反向
              </Button>
            </Space>
          }
        />
      ) : null}
    </Space>
  );
};
