import { faker } from "@faker-js/faker";
import {
  DatePicker,
  Editable,
  FormButtonGroup,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  Submit,
} from "@formily/antd";
import { createForm } from "@formily/core";
import { FormProvider, ISchema, createSchemaField } from "@formily/react";
import { ConfigProvider, Divider } from "antd";
import "antd/dist/antd.css";
import zhCN from "antd/lib/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

import { ArrayTablePro, QueryForm, QueryList } from "proformily";

const log = (label: string, x: any) => {
  console.log("LABEL:", label);
  try {
    console.group(JSON.parse(JSON.stringify(x)));
  } catch (error) {
    console.log("stringify error, origin: ", x);
  }
  console.groupEnd();
};

export const service = ({
  params,
  pagination,
  sorter,
  filters,
  extra,
}: any) => {
  log("search sevice args ", { params, pagination, sorter, filters, extra });

  const {
    start = moment().toDate(),
    end = moment().add(1, "year").toDate(),
    classify,
    status,
    domain,
  } = params || {};
  const { current, pageSize } = pagination || {};

  return Promise.resolve().then(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = 45;
        const list = Array.from({
          length: current * pageSize > total ? total % pageSize : pageSize,
        }).map((_, idx) => {
          return {
            id: current * pageSize + idx,
            status: status ?? +faker.string.numeric(1) % 5,
            domain: `${
              domain ? `${domain}.` : ""
            }${faker.internet.domainName()}`,
            subdomains: Array.from(
              new Set(
                Array.from({
                  length: Math.floor(Math.random() * 3),
                }).map(() => faker.internet.domainName()),
              ),
            ).map((item) => {
              return {
                owner: faker.company.name(),
                domain: item,
              };
            }),
            classify:
              classify ??
              Array.from(
                new Set(
                  Array.from({ length: Math.floor(Math.random() * 3) }).map(
                    () => +faker.string.numeric(1) % 5,
                  ),
                ),
              ),
            date: moment(faker.date.between({ from: start, to: end })).format(
              "YYYY-MM-DD",
            ),
            img: faker.image.avatar(),
            desc: faker.lorem.paragraph(),
          };
        });
        log("search response ", { list, total });

        resolve({
          list,
          total,
        });
      }, 456);
    });
  });
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    DatePicker,
    FormGrid,
    Editable,
    Input,
    Select,
    FormLayout,
    QueryList,
    QueryForm,
    ArrayTablePro: ArrayTablePro,
  },
  scope: {
    service,
  },
});

const form = createForm({});
const query: ISchema = {
  type: "object",
  "x-decorator": "FormLayout",
  "x-decorator-props": {
    layout: "vertical",
  },
  "x-component": "QueryForm",
  "x-component-props": {
    grid: {
      maxRows: 1,
    },
  },
  properties: {
    domain: {
      title: "域名",
      type: "string",
      "x-decorator": "FormItem",
      "x-component": "Input",
    },
    some: {
      title: "查询",
      type: "string",
      "x-decorator": "FormItem",
      "x-component": "Input",
    },
    classify: {
      title: "分类",
      type: "string",
      "x-decorator": "FormItem",
      "x-component": "Select",
      "x-component-props": {
        mode: "multiple",
      },
    },
    status: {
      title: "状态",
      type: "string",
      "x-decorator": "FormItem",
      "x-component": "Select",
    },
    "[start, end]": {
      title: "日期区间",
      type: "string",
      "x-decorator": "FormItem",
      "x-decorator-props": {
        gridSpan: 2,
      },
      "x-component": "DatePicker.RangePicker",
    },
  },
};
const row: ISchema = {
  items: {
    type: "object",
    properties: {
      _id: {
        type: "void",
        "x-component": "ArrayTablePro.Column",
        "x-component-props": { width: 60, title: "ID", align: "center" },
        properties: {
          id: {
            type: "string",
            "x-component": "Input",
            "x-read-pretty": true,
          },
        },
      },
      _status: {
        type: "void",
        "x-component": "ArrayTablePro.Column",
        "x-component-props": { width: 60, title: "STATUS", align: "center" },
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
        "x-component": "ArrayTablePro.Column",
        "x-component-props": { title: "DOMAIN", align: "center" },
        properties: {
          domain: {
            type: "string",
            "x-component": "Input",
          },
        },
      },
    },
  },
};

const schema: ISchema = {
  type: "object",
  properties: {
    querylist: {
      type: "void",
      "x-component": "QueryList",
      "x-component-props": {
        service: "{{service}}",
      },
      properties: {
        query: query,
        list: {
          type: "array",
          "x-component": "ArrayTablePro",
          items: row.items,
        },
      },
    },
  },
};

export default () => {
  return (
    <ConfigProvider locale={zhCN}>
      <FormProvider form={form}>
        <SchemaField schema={schema} />
        <Divider orientation="right">
          <FormButtonGroup>
            <Submit onSubmit={console.log}>提交</Submit>
          </FormButtonGroup>
        </Divider>
      </FormProvider>
    </ConfigProvider>
  );
};
