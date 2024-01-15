import {
  Checkbox,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Select,
  Space,
} from "@formily/antd";
import { createForm } from "@formily/core";
import { FormProvider, createSchemaField } from "@formily/react";
import { Dict, dict, dictEffects, registerDictLoader } from "@proformily/antd";
import React, { useMemo } from "react";

const loaders = {
  bool: () => {
    registerDictLoader("bool", (convert) => {
      return Promise.resolve([
        { label: "是", value: 1, color: "success" },
        { label: "否", value: 0, color: "error" },
      ]).then((list) => {
        return convert(list);
      });
    });
  },
  status: () => {
    registerDictLoader("status", (convert) => {
      return Promise.resolve([
        { label: "已上线", value: 0, color: "success" },
        { label: "运行中", value: 1, color: "processing" },
        { label: "关闭", value: 2, color: "default" },
        { label: "已宕机", value: 3, color: "error" },
        { label: "已超载", value: 4, color: "warning" },
      ]).then((list) => {
        return convert(list);
      });
    });
  },
  classify: () => {
    registerDictLoader("classify", (convert) => {
      return Promise.resolve([
        { label: "文艺", value: 0 },
        { label: "喜剧", value: 1 },
        { label: "爱情", value: 2 },
        { label: "动画", value: 3 },
        { label: "悬疑", value: 4 },
        { label: "科幻", value: 5 },
      ]).then((list) => {
        return convert(list);
      });
    });
  },
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Select,
    Radio,
    Checkbox,
    FormGrid,
    FormLayout,
    Dict,
    Space,
  },
  scope: {
    dict,
  },
});

loaders.bool();
loaders.status();
loaders.classify();

type SchemaShape = React.ComponentProps<typeof SchemaField>["schema"];

const schema: SchemaShape = {
  type: "object",
  properties: {
    layout: {
      type: "void",
      "x-decorator": "FormLayout",
      "x-decorator-props": {
        layout: "vertical",
      },
      "x-component": "FormGrid",
      "x-component-props": {
        maxColumns: 2,
        minColumns: 2,
      },
      properties: {
        dict: {
          title: "DICT 只读组件",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Dict",
          "x-data": {
            dict: "classify",
          },
          "x-value": [1, 3],
        },
        dict2: {
          title: "DICT 只读组件 TAG 形态",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Dict",
          "x-component-props": {
            type: "tag",
          },
          "x-data": {
            dict: "classify",
          },
          "x-value": [1, 3],
        },
        select1: {
          title: "多选 SELECT",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Select",
          "x-component-props": {
            mode: "multiple",
          },
          "x-data": {
            dict: "classify",
          },
        },
        select1badge: {
          title: "多选 SELECT READ PRETTY 徽章形态",
          type: "string",
          "x-read-pretty": true,
          "x-reactions": {
            dependencies: [".select1"],
            fulfill: {
              schema: {
                "x-value": "{{$deps[0]}}",
              },
            },
          },
          "x-decorator": "FormItem",
          "x-component": "Select",
          "x-component-props": {
            type: "badge",
          },
          "x-data": {
            dict: "classify",
          },
        },
        select2: {
          title: "单选 SELECT",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Select",
          "x-data": {
            dict: "classify",
          },
        },
        slect2tag: {
          title: "单选 SELECT pretty 标签形态",
          type: "string",
          "x-read-pretty": true,
          "x-reactions": {
            dependencies: [".select2"],
            fulfill: {
              schema: {
                "x-value": "{{$deps[0]}}",
              },
            },
          },
          "x-decorator": "FormItem",
          "x-component": "Select",
          "x-component-props": {
            type: "tag",
          },
          "x-data": {
            dict: "classify",
          },
        },
        radio: {
          title: "Radio 单选",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Radio.Group",
          "x-data": {
            dict: "status",
          },
        },
        radiobadge: {
          title: "Radio 单选 pretty 徽章形态",
          type: "string",
          "x-read-pretty": true,
          "x-reactions": {
            dependencies: [".radio"],
            fulfill: {
              schema: {
                "x-value": "{{$deps[0]}}",
              },
            },
          },
          "x-decorator": "FormItem",
          "x-component": "Radio.Group",
          "x-component-props": {
            type: "badge",
          },
          "x-data": {
            dict: "status",
          },
        },
        checkbox: {
          title: "Checkbox 多选",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Checkbox.Group",
          "x-data": {
            dict: "status",
          },
        },
        checkboxtag: {
          title: "Checkbox  多选 pretty 标签形态",
          type: "string",
          "x-read-pretty": true,
          "x-reactions": {
            dependencies: [".checkbox"],
            fulfill: {
              schema: {
                "x-value": "{{$deps[0]}}",
              },
            },
          },
          "x-decorator": "FormItem",
          "x-component": "Checkbox.Group",
          "x-component-props": {
            type: "tag",
          },
          "x-data": {
            dict: "status",
          },
        },
      },
    },
  },
};

const DictDemo = () => {
  const form = useMemo(() => {
    return createForm({
      effects(fform) {
        dictEffects(fform);
      },
    });
  }, []);
  return (
    <FormProvider form={form}>
      <SchemaField schema={schema} />
    </FormProvider>
  );
};

export default DictDemo;
