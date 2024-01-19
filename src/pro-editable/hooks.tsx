import { createForm } from "@formily/core";
import {
  FormProvider,
  SchemaOptionsContext,
  createSchemaField,
  useField,
  useFieldSchema,
} from "@formily/react";
import { toJS } from "@formily/reactive";
import React, { useContext, useMemo } from "react";
import { Button } from "../adaptor";
import { FormButtonGroup, FormGrid, FormLayout } from "../adaptor/adaptor";
import { useRecord } from "../shared/useRecord";
export const useRecordIsolationForm = () => {
  const parentField = useField();
  const schema = useFieldSchema();
  const options = useContext(SchemaOptionsContext);
  const record = useRecord();

  const form = createForm({
    ...parentField.data?.formOptions,
    initialValues: toJS(record ?? {}),
  });

  return { schema, form, options };
};

export type RecordFormProps = React.PropsWithChildren<{
  cancelText?: string;
  okText?: string;
  grid?: React.ComponentProps<typeof FormGrid>;
  layout?: React.ComponentProps<typeof FormLayout>;
  buttonProps?: React.ComponentProps<typeof Button>;
}>;

const buttonGroupStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

export const useFieldRecordForm = (props: RecordFormProps) => {
  const { cancelText, okText, grid, layout } = props;
  const { form, options, schema } = useRecordIsolationForm();

  const gridProps = useMemo(() => {
    return {
      ...grid,
      maxColumns: grid?.maxColumns || 1,
    };
  }, [grid]);

  const FormButtons: React.FC<{
    onReset: () => void | Promise<void>;
    onSubmit: (data: any) => void | Promise<void>;
  }> = (props) => (
    <FormGrid.GridColumn
      gridSpan={-1}
      style={{ display: "flex", justifyContent: "space-between" }}
    >
      <FormButtonGroup align="right" style={buttonGroupStyle}>
        <Button onClick={props.onReset}>{cancelText || "取消"}</Button>
        <Button onClick={props.onSubmit} type="primary">
          {okText || "确定"}
        </Button>
      </FormButtonGroup>
    </FormGrid.GridColumn>
  );

  const SchemaField = createSchemaField(options);

  const body = (
    <FormProvider form={form}>
      <FormLayout {...layout}>
        <FormGrid {...gridProps}>
          <SchemaField schema={schema}></SchemaField>
          {props.children}
        </FormGrid>
      </FormLayout>
    </FormProvider>
  );

  return { body, FormButtons, form };
};
