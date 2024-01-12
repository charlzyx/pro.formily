import {
  ArrayBase,
  Editable,
  FormButtonGroup,
  FormItem,
  Input,
  Submit,
} from "@formily/antd";
import {
  createForm,
  onFieldValueChange,
  onFormValuesChange,
} from "@formily/core";
import { FormProvider, ISchema, createSchemaField } from "@formily/react";
import { Button, ConfigProvider, Divider, Space } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import {
  ArrayTablePro,
  useArrayCompPropsOf,
  useFormArrayProps,
} from "proformily";
import { useEffect } from "react";

const CustomeToolbar = () => {
  const array = ArrayBase.useArray!();
  const [, $row] = useArrayCompPropsOf(array.field, "rowSelection");
  return (
    <Space>
      <Button
        type="primary"
        onClick={() => {
          // ok
          console.log(array.field.componentProps.rowSelection.selectedRowKeys);
          if (!$row) return;
          // but quick
          console.log($row!.selectedRowKeys);
        }}
      >
        自定义 toolbar , 点我试试
      </Button>
    </Space>
  );
};
const CustomeFooter = () => {
  const array = ArrayBase.useArray!();
  const [, $page] = useArrayCompPropsOf(array.field, "pagination");
  const totalPage = (($page?.total || 0)! / ($page?.pageSize || 1)).toFixed(0);
  return (
    <Space>
      自定义底部
      {$page?.current}/{totalPage}, 共计{array.field.value.length}条数据
    </Space>
  );
};

const RowSummary = () => {
  const row = ArrayBase.useRecord!();
  const summary = row.a1 + row.a2 + row.a3;
  console.log("say hi", row);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "16px",
      }}
    >
      我是自定义 row render {summary} 👇🏻 是 schame 形式的 row render
    </div>
  );
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Editable,
    Input,
    ArrayTablePro: ArrayTablePro,
    // 组件名称必须包含 Toolbar
    CustomeToolbar,
    // 组件名称必须包含 Footer
    CustomeFooter,
    RowSummary,
  },
});

const form = createForm({
  effects() {
    onFormValuesChange(() => {
      console.log("form values change ");
    });
    onFieldValueChange("*", (field) => {
      console.log("change ", field.path.entire, (field as any).value);
    });
  },
});

const row: ISchema = {
  items: {
    type: "object",
    properties: {
      column1: {
        type: "void",
        "x-component": "ArrayTablePro.Column",
        "x-component-props": { width: 60, title: "Sort", align: "center" },
        properties: {
          sort: {
            type: "void",
            "x-component": "ArrayTablePro.SortHandle",
          },
        },
      },
      column2: {
        type: "void",
        "x-component": "ArrayTablePro.Column",
        "x-component-props": { width: 60, title: "Index", align: "center" },
        properties: {
          index: {
            type: "void",
            "x-component": "ArrayTablePro.Index",
          },
        },
      },
      column3: {
        type: "void",
        "x-component": "ArrayTablePro.Column",
        "x-component-props": { width: 120, title: "A1" },
        properties: {
          a1: {
            type: "string",
            "x-decorator": "Editable",
            "x-component": "Input",
          },
        },
      },
      column4: {
        type: "void",
        "x-component": "ArrayTablePro.Column",
        "x-component-props": { width: 120, title: "A2" },
        properties: {
          a2: {
            type: "string",
            "x-decorator": "FormItem",
            "x-component": "Input",
          },
        },
      },
      column5: {
        type: "void",
        "x-component": "ArrayTablePro.Column",
        "x-component-props": { width: 120, title: "A3" },
        properties: {
          a3: {
            type: "string",
            "x-decorator": "FormItem",
            "x-component": "Input",
          },
        },
      },
      column6: {
        type: "void",
        "x-component": "ArrayTablePro.Column",
        "x-component-props": {
          title: "Operations",
          dataIndex: "operations",
          fixed: "right",
        },
        properties: {
          item: {
            type: "void",
            "x-component": "FormItem",
            properties: {
              remove: {
                type: "void",
                "x-component": "ArrayTablePro.Remove",
              },
              moveDown: {
                type: "void",
                "x-component": "ArrayTablePro.MoveDown",
              },
              moveUp: {
                type: "void",
                "x-component": "ArrayTablePro.MoveUp",
              },
            },
          },
        },
      },
    },
  },
};

const subRow: ISchema = JSON.parse(JSON.stringify(row));
// biome-ignore lint/performance/noDelete: <explanation>
delete (subRow as any).items.properties.column1;
// biome-ignore lint/performance/noDelete: <explanation>
delete (subRow as any).items.properties.column6;

const schema: ISchema = {
  type: "object",
  properties: {
    array: {
      type: "array",
      title: "Array Table Pro Max",
      "x-component": "ArrayTablePro",
      "x-component-props": {
        rowSelection: true,
        expandable: {
          rowExpandable: (record: any) => Array.isArray(record.subitems),
        },
      },
      items: row.items,
      properties: {
        toolbar: {
          type: "void",
          "x-component": "CustomeToolbar",
        },
        add: {
          type: "void",
          "x-component": "ArrayTablePro.Addition",
          title: "添加条目",
        },
        footer: {
          type: "void",
          "x-component": "CustomeFooter",
        },
        expand: {
          type: "void",
          "x-component": "ArrayTablePro.RowExpand",
          properties: {
            summary: {
              type: "void",
              "x-component": "RowSummary",
            },
            subitems: {
              type: "array",
              "x-component": "ArrayTablePro",
              "x-read-pretty": true,
              "x-component-props": {
                showHeader: false,
                settings: false,
                bordered: false,
              },
              items: subRow.items,
            },
          },
        },
      },
    },
  },
};
const range = (count: number) =>
  Array.from(new Array(count)).map((_, key) => {
    const ret = {
      a1: `${key}.1`,
      a2: `${key}.2`,
      a3: `${key}.3`,
      subitems: [] as any[],
    };
    ret.subitems =
      Math.random() > 0.45
        ? [
            {
              a1: `c.${ret.a1}`,
              a2: `c.${ret.a2}`,
              a3: `c.${ret.a3}`,
            },
          ]
        : (undefined as any);
    return ret;
  });

export default () => {
  console.log("form", form);
  const [row, $row] = useFormArrayProps(form, "array", "rowSelection");
  useEffect(() => {
    console.log("row is change ", row);
  }, [row]);

  return (
    <ConfigProvider locale={zhCN}>
      <FormProvider form={form}>
        <SchemaField schema={schema} />
        <Divider orientation="right">
          <FormButtonGroup>
            <Submit onSubmit={console.log}>提交</Submit>
          </FormButtonGroup>
        </Divider>
        <Space>
          <Button
            onClick={() => {
              // simple way
              $row?.selectedRowKeys?.push(2);
              //  work but verbose
              // form
              // 	.query("array")
              // 	.take()
              // 	?.setState((s) => {
              // 		s.componentProps?.rowSelection?.selectedRowKeys?.push?.(2);
              // 	});
            }}
          >
            CHeck 2
          </Button>
          <Button
            onClick={() => {
              form.setInitialValues({
                array: range(88),
              });
            }}
          >
            Load 10W pieces of large data
          </Button>
        </Space>
      </FormProvider>
    </ConfigProvider>
  );
};
