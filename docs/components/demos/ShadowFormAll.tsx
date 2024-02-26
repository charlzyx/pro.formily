import {
  FormButtonGroup,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Submit,
} from "@formily/antd";
import { createForm } from "@formily/core";
import {
  FormProvider,
  ISchema,
  createSchemaField,
  observer,
  useField,
} from "@formily/react";
import { Button, ConfigProvider } from "antd";
import "antd/dist/antd.css";
import zhCN from "antd/lib/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

import { toJS } from "@formily/reactive";
import {
  ShadowForm,
  ShadowFormWrappedProps,
  ShadowModal,
  ShadowPopconfirm,
  withLayoutGrid,
} from "@pro.formily/antd";
import { useEffect } from "react";

const form = createForm({
  initialValues: {
    info: { domain: "www.baidu.com", desc: "ping" },
  },
});

const shadowSchema = {
  type: "void",
  properties: {
    domain: {
      type: "string",
      title: "域名",
      "x-decorator": "FormItem",
      "x-component": "Input",
    },
    desc: {
      type: "string",
      title: "描述",
      "x-decorator": "FormItem",
      "x-component": "Input.TextArea",
    },
  },
};

const schema: ISchema = {
  type: "object",
  "x-component": "FormLayout",
  "x-component-props": {
    labelCol: 6,
    wrapperCol: 10,
    layout: "vertical",
  },
  properties: {
    info: {
      type: "object",
      "x-read-pretty": true,
      "x-component": "FormItem",
      properties: {
        layout: {
          type: "void",
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
        },
        _modal: {
          type: "void",
          title: "内置的Modal",
          "x-decorator": "ShadowForm",
          "x-component": "ShadowModal",
          "x-decorator-props": {
            schema: shadowSchema,
          },
        },
        _popconfirm: {
          type: "void",
          title: "内置的Popconfirm",
          "x-component": "ShadowPopconfirm",
          "x-decorator": "ShadowForm",
          "x-decorator-props": {
            schema: shadowSchema,
          },
        },
        _shadow2: {
          type: "void",
          title: "MyDecoratorIsShadowForm",
          "x-component": "MyDecoratorIsShadowForm",
          "x-decorator": "ShadowForm",
          "x-decorator-props": {
            schema: shadowSchema,
          },
        },
        _shadow3: {
          type: "void",
          title: "MyChildisShadowForm",
          "x-component": "ShadowForm",
          "x-component-props": {
            schema: shadowSchema,
          },
          "x-decorator": "MyChildisShadowForm",
        },
      },
    },
  },
};

const MyDecoratorIsShadowForm: React.FC<ShadowFormWrappedProps> = ({
  form,
  SchemaField,
  schema,
}) => {
  const field = useField();
  useEffect(() => {
    form.setValues(toJS(field.record));
  }, []);
  return (
    <div>
      <h2>ShadowForm 作为 x-decorator</h2>
      <FormProvider form={form}>
        <SchemaField schema={schema}></SchemaField>
        <FormButtonGroup>
          <Submit onSubmit={console.log}>查看</Submit>
        </FormButtonGroup>
      </FormProvider>
    </div>
  );
};

const MyChildisShadowForm: React.FC = observer((props) => {
  const field = useField();
  const form = field.data?._form as ReturnType<typeof createForm>;

  useEffect(() => {
    // 等子组件挂载, 所以不如上面那种方便对不对
    setTimeout(() => {
      const form = field.data?._form as ReturnType<typeof createForm>;
      form?.setValues(toJS(field.record));
    });
  }, []);
  return (
    <div>
      <h2>ShadowForm 作为 x-component</h2>
      {props.children}
      <Button
        onClick={() => {
          form.submit().then(console.log);
        }}
      >
        点我提交
      </Button>
    </div>
  );
});
const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    FormLayout,
    Input,
    Button,
    ShadowForm,
    ShadowModal,
    ShadowPopconfirm,
    MyDecoratorIsShadowForm,
    MyChildisShadowForm,
  },
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
