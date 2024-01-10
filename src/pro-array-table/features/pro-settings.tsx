import { SettingOutlined } from "@ant-design/icons";
import {
  Checkbox,
  FormItem,
  Input,
  NumberPicker,
  PreviewText,
  Radio,
} from "@formily/antd";
import { createForm } from "@formily/core";
import {
  FormProvider,
  ISchema,
  connect,
  createSchemaField,
  observer,
} from "@formily/react";
import useCreation from "ahooks/es/useCreation";
import { Button, ConfigProvider, Popover, Row, Slider } from "antd";
import { useContext, useMemo } from "react";
import { ProArrayTableMaxContext } from "../context";
import { ProArrayTable } from "../index";

const schema: ISchema = {
  type: "object",
  properties: {
    size: {
      type: "string",
      "x-component": "Radio.Group",
      "x-component-props": {
        optionType: "button",
        buttonStyle: "solid",
      },
      enum: [
        { label: "紧凑", value: "small" },
        { label: "中等", value: "middle" },
        { label: "默认", value: "large" },
      ],
    },
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
          _width: {
            type: "void",
            "x-component": "ProArrayTable.Column",
            "x-component-props": {
              width: 100,
            },
            properties: {
              width: {
                type: "string",
                "x-component": "Slider",
                "x-component-props": {
                  min: 20,
                  max: 400,
                },
              },
            },
          },
        },
      },
    },
  },
};

export const ProSettings = observer(() => {
  const $proCtx = useContext(ProArrayTableMaxContext);
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
      initialValues: $proCtx,
    });
  }, []);
  form.setValuesIn("columns", $proCtx.columns);
  form.setValuesIn("size", $proCtx.size);
  form.setValuesIn("paginationPosition", $proCtx.paginationPosition);

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
        <h4>表格设置</h4>
        <Button
          onClick={() => {
            $proCtx.reset();
          }}
        >
          重置
        </Button>
      </Row>
    );
  }, []);
  return (
    <ConfigProvider componentSize="small">
      <Popover content={content} title={title} trigger="click">
        <Button
          style={{ justifySelf: "flex-end" }}
          icon={<SettingOutlined />}
          type="link"
        ></Button>
      </Popover>
    </ConfigProvider>
  );
});
