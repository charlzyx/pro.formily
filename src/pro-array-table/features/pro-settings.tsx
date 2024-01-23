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
import { ProArrayTable } from "../pro";

const schema: ISchema = {
  type: "object",
  properties: {
    columns: {
      type: "array",
      "x-component": "ProArrayTable",
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
            "x-component": "ProArrayTable.Column",
            "x-component-props": {
              width: 40,
            },
            properties: {
              sort: {
                type: "void",
                "x-component": "ProArrayTable.SortHandle",
              },
            },
          },
          // TODO: pin left | right
          _show: {
            type: "void",
            "x-component": "ProArrayTable.Column",
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
            "x-component": "ProArrayTable.Column",
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
          ProArrayTable,
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
          const neo = toJS(field.value).map((item: any, idx: number) => {
            return {
              ...item,
              order: idx + 1,
            };
          });
          columns.onChange(neo);
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
        <Popover content={content} title={"列配置"} trigger="click">
          <Button icon={<SettingOutlined />} type={BUTTON_TYPE}></Button>
        </Popover>
      </Space>
    </ConfigProvider>
  );
};
