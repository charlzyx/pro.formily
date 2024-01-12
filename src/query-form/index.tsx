import type { FormLayout } from "@formily/antd";
import { FormButtonGroup, FormGrid } from "@formily/antd";
import type { ObjectField } from "@formily/core";
import { observer, useField, useForm } from "@formily/react";
import { observe, toJS } from "@formily/reactive";
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

export const QueryForm = observer((props: QueryFormProps) => {
  const { resetText, submitText } = props;
  const field = useField<ObjectField>();
  const { grid, expanded, toggle } = useGrid(props.grid!);
  const querylist = useQueryListContext();

  useEffect(() => {
    if (field?.address && querylist) {
      querylist.setAddress(field.address.toString(), "table");
    }
  }, [querylist, field.address]);

  useEffect(() => {
    if (!querylist || !field.initialValue) return;
    querylist.memo.current.init.params = clone(field.initialValue);
  }, [querylist, field.initialValue]);

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
      <FormButtonGroup
        align="right"
        style={{
          width: "100%",
          marginBottom: "22px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {expanded !== undefined ? (
          <Button
            type="link"
            onClick={(e) => {
              e.preventDefault();
              toggle();
            }}
          >
            {expanded ? "收起" : "展开"}
          </Button>
        ) : null}
        <Button onClick={onReset}>{resetText || "重置"}</Button>
        <Button onClick={onSubmit} type="primary">
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
