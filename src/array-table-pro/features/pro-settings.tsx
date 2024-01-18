import { createForm, onFieldInputValueChange } from "@formily/core";
import {
  FormProvider,
  ISchema,
  connect,
  createSchemaField,
} from "@formily/react";
import { toJS } from "@formily/reactive";
import { useCreation } from "ahooks";
import React, { useMemo } from "react";
import {
  BUTTON_TYPE,
  Button,
  ColumnHeightOutlined,
  ConfigProvider,
  Popover,
  Row,
  SettingOutlined,
  Slider,
  Space,
} from "../../adaptor";
import {
  Checkbox,
  FormItem,
  Input,
  NumberPicker,
  PreviewText,
  Radio,
} from "../../adaptor/adaptor";
import { useArrayTableColumns } from "../hooks";
import { ArrayTablePro } from "../pro";

const schema: ISchema = {
  type: "object",
  properties: {
    size: {
      type: "string",
      "x-component": "Radio.Group",
      "x-component-props": {
        optionType: "button",
        buttonStyle: "solid",
        size: "small",
      },
      enum: [
        { label: "紧凑", value: "small" },
        { label: "中等", value: "middle" },
        { label: "默认", value: "large" },
      ],
    },
    columns: {
      type: "array",
      "x-component": "ArrayTablePro",
      "x-component-props": {
        bordered: false,
        settings: false,
        pagination: false,
        rowSelection: false,
        showHeader: false,
      },
      items: {
        type: "object",
        properties: {
          _sort: {
            type: "void",
            "x-component": "ArrayTablePro.Column",
            "x-component-props": {
              width: 40,
            },
            properties: {
              order: {
                type: "number",
                "x-value": "{{$self.index}}",
              },
              sort: {
                type: "void",
                "x-component": "ArrayTablePro.SortHandle",
              },
            },
          },
          // TODO: pin left | right
          _show: {
            type: "void",
            "x-component": "ArrayTablePro.Column",
            "x-component-props": {
              width: 40,
            },
            properties: {
              show: {
                type: "boolean",
                "x-component": "Checkbox",
              },
            },
          },
          _title: {
            type: "void",
            "x-component": "ArrayTablePro.Column",
            "x-component-props": {
              width: 60,
            },
            properties: {
              title: {
                type: "string",
                "x-component": "PreviewText",
              },
            },
          },
        },
      },
    },
  },
};

export const ProSettings: React.FC<{
  columns: ReturnType<typeof useArrayTableColumns>[1];
}> = ({ columns }) => {
  const SchemaField = useCreation(
    () =>
      createSchemaField({
        components: {
          Slider: connect(Slider),
          FormItem,
          Input,
          NumberPicker,
          Radio,
          ArrayTablePro: ArrayTablePro,
          PreviewText,
          Checkbox,
        },
      }),
    [],
  );

  const form = useCreation(() => {
    return createForm({
      initialValues: {
        columns: columns.value,
      },
      effects() {
        onFieldInputValueChange("columns", (field) => {
          columns.onChange(toJS(form.values.columns));
        });
      },
    });
  }, []);

  const content = useMemo(() => {
    return (
      <FormProvider form={form}>
        <SchemaField schema={schema} />
      </FormProvider>
    );
  }, []);
  const title = useMemo(() => {
    return (
      <Row justify="space-between">
        <Button onClick={() => {}}>重置</Button>
      </Row>
    );
  }, []);
  return (
    <ConfigProvider
      // @ts-ignore for arco
      componentSize="small"
      // @ts-ignore for antd
      size="small"
    >
      <Space>
        <Button
          type={BUTTON_TYPE}
          icon={<ColumnHeightOutlined></ColumnHeightOutlined>}
        ></Button>
        <Popover content={content} title={title} trigger="click">
          <Button icon={<SettingOutlined />} type={BUTTON_TYPE}></Button>
        </Popover>
      </Space>
    </ConfigProvider>
  );
};
