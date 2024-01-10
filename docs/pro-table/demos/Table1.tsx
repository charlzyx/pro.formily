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
import { Button, Divider, Space } from "antd";
import { ProArrayTable } from "proformily";
import { useEffect } from "react";
import {
  useCompPropsOf,
  useFormArrayProps,
} from "src/pro-array-table/features/hooks";

const CustomeToolbar = () => {
  const array = ArrayBase.useArray!();
  const [, $row] = useCompPropsOf(array.field, "rowSelection");
  return (
    <Space>
      <Button
        size="small"
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
const CustomeFootbar = () => {
  const array = ArrayBase.useArray!();
  const [, $page] = useCompPropsOf(array.field, "pagination");
  const totalPage = (($page?.total || 0)! / ($page?.pageSize || 1)).toFixed(0);
  return (
    <Space>
      自定义底部
      {$page?.current}/{totalPage}, 共计{array.field.value.length}条数据
    </Space>
  );
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Editable,
    Input,
    ProArrayTable: ProArrayTable,
    // 组件名称必须包含 Toolbar
    CustomeToolbar,
    // 组件名称必须包含 Footbar
    CustomeFootbar,
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
        "x-component": "ProArrayTable.Column",
        "x-component-props": { width: 80, title: "Sort", align: "center" },
        properties: {
          sort: {
            type: "void",
            "x-component": "ProArrayTable.SortHandle",
          },
        },
      },
      column2: {
        type: "void",
        "x-component": "ProArrayTable.Column",
        "x-component-props": { width: 80, title: "Index", align: "center" },
        properties: {
          index: {
            type: "void",
            "x-component": "ProArrayTable.Index",
          },
        },
      },
      column3: {
        type: "void",
        "x-component": "ProArrayTable.Column",
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
        "x-component": "ProArrayTable.Column",
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
        "x-component": "ProArrayTable.Column",
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
        "x-component": "ProArrayTable.Column",
        "x-component-props": {
          title: "Operations",
          dataIndex: "operations",
          width: 160,
          fixed: "right",
        },
        properties: {
          item: {
            type: "void",
            "x-component": "FormItem",
            properties: {
              remove: {
                type: "void",
                "x-component": "ProArrayTable.Remove",
              },
              moveDown: {
                type: "void",
                "x-component": "ProArrayTable.MoveDown",
              },
              moveUp: {
                type: "void",
                "x-component": "ProArrayTable.MoveUp",
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
      "x-component": "ProArrayTable",
      "x-component-props": {
        rowSelection: true,
        expandable: true,
      },
      items: row.items,
      properties: {
        toolbar: {
          type: "void",
          "x-component": "CustomeToolbar",
        },
        add: {
          type: "void",
          "x-component": "ProArrayTable.Addition",
          title: "添加条目",
        },
        footbar: {
          type: "void",
          "x-component": "CustomeFootbar",
        },
        expand: {
          type: "void",
          "x-component": "ProArrayTable.Expand",
          properties: {
            subitems: {
              type: "array",
              "x-component": "ProArrayTable",
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
    ret.subitems = [
      {
        a1: `c.${ret.a1}`,
        a2: `c.${ret.a2}`,
        a3: `c.${ret.a3}`,
      },
    ];
    return ret;
  });

export default () => {
  console.log("form", form);
  const [row, $row] = useFormArrayProps(form, "array", "rowSelection");
  useEffect(() => {
    console.log("row is change ", row);
  }, [row]);

  return (
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
  );
};
