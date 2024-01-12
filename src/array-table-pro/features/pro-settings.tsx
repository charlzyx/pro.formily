import { SettingOutlined } from "@ant-design/icons";
import {
  Checkbox,
  FormItem,
  Input,
  NumberPicker,
  PreviewText,
  Radio,
} from "@formily/antd";
import { createForm, onFieldInputValueChange } from "@formily/core";
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
import { ArrayTableProSettingsContext } from "../context";
import { ArrayTablePro } from "../index";

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
              order: {
                type: "number",
                "x-value": "{{$self.index}}",
              },
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

export const ProSettings = observer(() => {
  const $proSettings = useContext(ArrayTableProSettingsContext);
  const SchemaField = useCreation(
    () =>
      createSchemaField({
        components: {
          Slider: connect(Slider),
          FormItem,
          Input,
          NumberPicker,
          Radio,
          ProArrayTable: ArrayTablePro,
          PreviewText,
          Checkbox,
        },
      }),
    [],
  );

  const form = useCreation(() => {
    return createForm({
      initialValues: $proSettings,
      effects() {
        onFieldInputValueChange("*", (field) => {
          const dataKey = field.address.toArr()[0] as string;
          if (/columns/.test(dataKey)) {
            // columns 是响应式的, 不需要关注啦
            return;
          }
          ($proSettings as any)[dataKey] = field.value;
        });
      },
    });
  }, []);
  form.setValuesIn("columns", $proSettings.columns);

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
            $proSettings.reset();
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
        <Button icon={<SettingOutlined />} type="link"></Button>
      </Popover>
    </ConfigProvider>
  );
});
