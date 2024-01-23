import { Editable, FormGrid, FormItem, FormLayout, Input } from "@formily/antd";
import { createForm } from "@formily/core";
import { FormProvider, ISchema, createSchemaField } from "@formily/react";
import { Button, ConfigProvider } from "antd";
import "antd/dist/antd.css";

import zhCN from "antd/lib/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

import { ProArrayTable, ShadowForm } from "@pro.formily/antd";

const form = createForm({
  initialValues: {
    list: [
      { id: 1, domain: "www.baidu.com", desc: "ping" },
      { id: 2, domain: "www.google.com", desc: "not found" },
    ],
  },
});

const row: ISchema = {
  items: {
    type: "object",
    properties: {
      _id: {
        type: "void",
        "x-component": "ProArrayTable.Column",
        "x-component-props": { width: 60, title: "ID", align: "center" },
        properties: {
          id: {
            type: "string",
            "x-component": "Input",
            "x-read-pretty": true,
          },
        },
      },
      _domain: {
        type: "void",
        "x-component": "ProArrayTable.Column",
        "x-component-props": { width: 200, title: "DOMAIN", align: "center" },
        properties: {
          domain: {
            type: "string",
            "x-read-pretty": true,
            "x-component": "Input",
          },
        },
      },
      _editable: {
        type: "void",
        "x-component": "ProArrayTable.Column",
        "x-component-props": { title: "编辑", align: "center" },
        properties: {
          _trigger: {
            type: "void",
            "x-decorator": "ProArrayTable.DelegateAction",
            "x-decorator-props": {
              act: "modal",
            },
            "x-component": "Button",
            "x-component-props": {
              type: "link",
              children: "编辑",
            },
          },
        },
      },
    },
  },
};

const schema: ISchema = {
  type: "object",
  properties: {
    list: {
      type: "array",
      "x-component": "ProArrayTable",
      items: row.items,
      properties: {
        // ↓ 不填写 act 属性的话, 就读这个 modal 字段
        modal: {
          type: "void",
          "x-component": "ProArrayTable.ShadowModal",
          "x-component-props": {
            // act: "modal", // 这里不填写的话, 就读取上面
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
        add: {
          type: "void",
          "x-component": "ProArrayTable.ProAddition",
          "x-component-props": {
            onOk: (
              data: any,
              ctx: ReturnType<typeof ProArrayTable.useProArrayTableContext>,
            ) => {
              // 如果添加数据后将超过当前页，则自动切换到下一页
              const total = ctx?.array.field?.value.length || 0;
              if (
                total >=
                ctx.pagination!.current! * ctx.pagination.pageSize!
              ) {
                ctx.pagination.setPagination((memo) => {
                  return { ...memo, current: memo.current + 1 };
                });
              }

              ctx.array.field.push(data);
              console.log(data);
            },
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
          title: "添加条目",
        },
      },
    },
  },
};
const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Editable,
    Input,
    Button,
    FormLayout,
    ShadowForm,
    ProArrayTable,
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
