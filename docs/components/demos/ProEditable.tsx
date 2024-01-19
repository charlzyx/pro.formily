import { Editable, FormGrid, FormItem, FormLayout, Input } from "@formily/antd";
import { createForm } from "@formily/core";
import { FormProvider, ISchema, createSchemaField } from "@formily/react";
import { ConfigProvider } from "antd";
import "antd/dist/antd.css";
// import "antd/dist/antd.css";
// import zhCN from "antd/lib/locale/zh_CN";
import zhCN from "antd/lib/locale/zh_CN";

import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

import {
  ProEditable,
  QueryForm,
  QueryList,
  QueryTable,
} from "@pro.formily/antd";
import { useMemo } from "react";

const form = createForm({});

const editable = (
  comp: "ProEditable" | "ProEditable.Modal" | "ProEditable.Drawer",
) => ({
  type: "void",
  title: comp,
  "x-component": comp,
  "x-component-props": {
    title: `标题${comp}`,
    onConfirm: "{{onConfirm}}",
  },
  properties: {
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
});

const schema: ISchema = {
  type: "object",
  properties: {
    obj: {
      type: "object",
      properties: {
        ...editable("ProEditable").properties,
        _editable1: editable("ProEditable"),
        _editable2: editable("ProEditable.Modal"),
        _editable3: editable("ProEditable.Drawer"),
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
    FormLayout,
    ProEditable: ProEditable,
    QueryList,
    QueryForm,
    QueryTable,
  },
});
export default () => {
  const onConfirm = (data: any) => {
    console.log("🚀 ~ onConfirm ~ data:", data);
  };

  const scope = useMemo(() => {
    return {
      onConfirm,
    };
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <FormProvider form={form}>
        <SchemaField schema={schema} scope={scope} />
      </FormProvider>
    </ConfigProvider>
  );
};
