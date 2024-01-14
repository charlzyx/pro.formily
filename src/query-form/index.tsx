import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import type { FormLayout } from "@formily/antd";
import { FormButtonGroup, FormGrid } from "@formily/antd";
import type { ObjectField } from "@formily/core";
import { observer, useField } from "@formily/react";
import { clone } from "@formily/shared";
import { Button } from "antd";
import React, { useEffect } from "react";
import { useQueryListContext } from "../query-list";
import { useGrid } from "./useGrid";

type QueryFormProps = React.PropsWithChildren<{
  resetText?: string;
  submitText?: string;
  grid?: React.ComponentProps<typeof FormGrid>;
  layout?: React.ComponentProps<typeof FormLayout>;
}>;

const buttonGroupStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

export const QueryForm = observer((props: QueryFormProps) => {
  const { resetText, submitText } = props;
  const field = useField<ObjectField>();
  const { grid, expanded, toggle } = useGrid(props.grid!);
  const querylist = useQueryListContext();

  useEffect(() => {
    if (!querylist.none && field?.address) {
      querylist.setAddress(field.address.toString(), "query");
    }
  }, [querylist?.none, field.address]);

  useEffect(() => {
    if (!querylist.none || !field.initialValue) return;
    querylist.memo.current.init.params = clone(field.initialValue);
  }, [querylist.none, field.initialValue]);

  const onReset = () => {
    if (querylist?.loading) return;
    field.reset().then(() => {
      querylist?.reset();
    });
  };

  const onSubmit = () => {
    if (querylist?.loading) return;
    return field.submit((data) => {
      querylist.memo.current.data.params = data;
      querylist?.run();
    });
  };

  const renderActions = () => {
    return (
      <FormButtonGroup align="right" style={buttonGroupStyle}>
        {expanded !== undefined ? (
          <Button
            type="link"
            icon={
              expanded ? (
                <UpOutlined></UpOutlined>
              ) : (
                <DownOutlined></DownOutlined>
              )
            }
            onClick={(e) => {
              e.preventDefault();
              toggle();
            }}
          >
            {expanded ? "收起" : "展开"}
          </Button>
        ) : null}
        <Button disabled={querylist?.loading} onClick={onReset}>
          {resetText || "重置"}
        </Button>
        <Button disabled={querylist?.loading} onClick={onSubmit} type="primary">
          {submitText || "查询"}
        </Button>
      </FormButtonGroup>
    );
  };

  return props.children ? (
    <FormGrid {...grid} grid={grid}>
      {props.children}
      <FormGrid.GridColumn
        gridSpan={-1}
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        {renderActions()}
      </FormGrid.GridColumn>
    </FormGrid>
  ) : null;
});
