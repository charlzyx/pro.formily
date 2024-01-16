import { faker } from "@faker-js/faker";
import {
  Editable,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
} from "@formily/antd-v5";
import { createForm } from "@formily/core";
import { FormProvider, ISchema, createSchemaField } from "@formily/react";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
// import "antd/dist/antd.css";
import zhCN from "antd/lib/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

import {
  EditablePro,
  QueryForm,
  QueryList,
  QueryTable,
} from "@proformily/antd-v5";
import { useMemo } from "react";

const form = createForm({});

const editable = (
  comp: "EditablePro" | "EditablePro.Modal" | "EditablePro.Drawer",
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
        ...editable("EditablePro").properties,
        _editable1: editable("EditablePro"),
        _editable2: editable("EditablePro.Modal"),
        _editable3: editable("EditablePro.Drawer"),
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
    EditablePro,
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
