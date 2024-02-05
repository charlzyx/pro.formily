import { ConfigProvider, Button } from "antd";
import "antd/dist/antd.css";

import { faker } from "@faker-js/faker";
import {
  DatePicker,
  Editable,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
} from "@formily/antd";
import { createForm } from "@formily/core";
import { FormProvider, ISchema, createSchemaField } from "@formily/react";
import zhCN from "antd/lib/locale/zh_CN";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

import {
  ProArrayTable,
  QueryForm,
  QueryList,
  ShadowForm,
  QueryTable,
} from "@pro.formily/antd";

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
    ProArrayTable,
    Button,
    ShadowForm,
    QueryList,
    QueryForm,
    QueryTable,
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
    "[start, end]": {
      title: "日期区间",
      type: "string",
      "x-decorator": "FormItem",
      "x-decorator-props": {
        gridSpan: 2,
      },
      "x-component": "DatePicker.RangePicker",
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
  },
};
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
      _status: {
        type: "void",
        "x-component": "ProArrayTable.Column",
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
        "x-component": "ProArrayTable.Column",
        "x-component-props": { title: "DOMAIN", align: "center" },
        properties: {
          domain: {
            type: "string",
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
          "x-component": "QueryTable",
          items: row.items,
          properties: {
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
          },
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
      </FormProvider>
    </ConfigProvider>
  );
};
