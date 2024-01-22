import { faker } from "@faker-js/faker";
import { Editable, FormGrid, FormItem, FormLayout, Input } from "@formily/antd";
import { createForm } from "@formily/core";
import { FormProvider, ISchema, createSchemaField } from "@formily/react";
import { Button, ConfigProvider } from "antd";
import "antd/dist/antd.css";
// import "antd/dist/antd.css";
import zhCN from "antd/lib/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

import { ShadowForm, ShadowPopconfirm } from "@pro.formily/antd";

const form = createForm({
  initialValues: {
    info: { id: 1, domain: "www.baidu.com", desc: "ping" },
  },
});

const schema: ISchema = {
  type: "object",
  properties: {
    info: {
      type: "object",
      "x-read-pretty": "true",
      "x-component": "FormItem",
      properties: {
        id: {
          title: "ID",
          type: "string",
          "x-decorator": "FormItem",
          "x-component": "Input",
        },
        domain: {
          title: "域名",
          "x-decorator": "FormItem",
          type: "string",
          "x-component": "Input",
        },
        desc: {
          title: "描述",
          "x-decorator": "FormItem",
          type: "string",
          "x-component": "Input.TextArea",
          "x-component-props": {
            rows: 4,
          },
        },
        _shadow: {
          type: "void",
          title: "点我编辑",
          "x-decorator": "ShadowForm",
          "x-component": "ShadowPopconfirm",
          "x-decorator-props": {
            schema: {
              type: "void",
              properties: {
                id: {
                  title: "ID",
                  type: "string",
                  "x-decorator": "FormItem",
                  "x-component": "Input",
                },
                domain: {
                  title: "域名",
                  "x-decorator": "FormItem",
                  type: "string",
                  "x-component": "Input",
                },
                desc: {
                  title: "描述",
                  "x-decorator": "FormItem",
                  type: "string",
                  "x-component": "Input.TextArea",
                  "x-component-props": {
                    rows: 4,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Button,
    ShadowForm,
    ShadowPopconfirm,
  },
  scope: {},
});

export default () => {
  return (
    <ConfigProvider locale={zhCN}>
      <FormProvider form={form}>
        <SchemaField schema={schema} />
      </FormProvider>
    </ConfigProvider>
  );
};
