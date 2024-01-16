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
  useQueryListRef,
} from "@proformily/antd-v5";
import { useMemo } from "react";

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
    id: {
      title: "ID",
      type: "string",
      "x-decorator": "FormItem",
      "x-component": "Input",
      "x-read-pretty": true,
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
});
const row: ISchema = {
  items: {
    type: "object",
    properties: {
      _id: {
        type: "void",
        "x-component": "QueryTable.Column",
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
        "x-component": "QueryTable.Column",
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
        "x-component": "QueryTable.Column",
        "x-component-props": { title: "编辑", align: "center" },
        properties: {
          popconfirm: editable("EditablePro"),
          modal: editable("EditablePro.Modal"),
          drawer: editable("EditablePro.Drawer"),
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
        queryRef: "{{queryRef}}",
        service: "{{service}}",
      },
      properties: {
        list: {
          type: "array",
          "x-component": "QueryTable",
          items: row.items,
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
    FormLayout,
    EditablePro,
    QueryList,
    QueryForm,
    QueryTable,
  },
});
export default () => {
  const queryRef = useQueryListRef();
  const onConfirm = (data: any) => {
    console.log("🚀 ~ onConfirm ~ data:", data);
    console.log("🚀 ~ onConfirm ~ queryRef:", queryRef);
    queryRef?.current?.run?.();
  };

  const scope = useMemo(() => {
    return {
      service,
      queryRef,
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
