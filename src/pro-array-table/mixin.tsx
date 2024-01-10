import { SettingOutlined } from "@ant-design/icons";
import {
  ArrayBaseMixins,
  Checkbox,
  FormItem,
  Input,
  NumberPicker,
  PreviewText,
  Radio,
} from "@formily/antd";
import { createForm, onFieldChange } from "@formily/core";
import {
  FormProvider,
  ISchema,
  ReactFC,
  connect,
  createSchemaField,
  observer,
} from "@formily/react";
import { toJS } from "@formily/reactive";
import useCreation from "ahooks/es/useCreation";
import {
  Alert,
  Button,
  ConfigProvider,
  Divider,
  Popover,
  Row,
  Slider,
  Space,
} from "antd";
import { ColumnProps } from "antd/es/table";
import React, { Fragment, useContext, useMemo } from "react";
import { ArrayBase } from "./array-base";
import { ProArrayTableMaxContext } from "./context";
import { useCompPropsOf } from "./features/hooks";
import { ProArrayTable } from "./index";

export const Column: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};
export const Expand: ReactFC<ColumnProps<any>> = () => {
  return <Fragment />;
};

export const Addition: ArrayBaseMixins["Addition"] = observer((props) => {
  const array = ArrayBase.useArray();
  const [, $page] = useCompPropsOf(array.field, "pagination");
  return (
    <ArrayBase.Addition
      block={false}
      type="link"
      {...props}
      onClick={(e) => {
        // 如果添加数据后将超过当前页，则自动切换到下一页
        if (!$page) return;
        const total = array?.field?.value.length || 0;
        if (total >= $page!.current! * $page.pageSize!) {
          $page.current! += 1;
        }
        props.onClick?.(e);
      }}
    />
  );
});

export const Flex = (
  props: React.PropsWithChildren<
    {
      justifyContent?: React.CSSProperties["justifyContent"];
    } & Pick<React.CSSProperties, "marginTop" | "marginBottom">
  >,
) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: props.marginTop,
        marginBottom: props.marginBottom,
        flex: 1,
        alignItems: "center",
        justifyContent: props.justifyContent || "flex-end",
      }}
    >
      {props.children}
    </div>
  );
};
export const RowSelection = (props: {
  ds: any[];
  rowKey: (record: any) => string | number;
}) => {
  const { ds, rowKey } = props;
  const array = ArrayBase.useArray();
  const [, $row] = useCompPropsOf(array.field, "rowSelection");
  return (
    <Space size="small">
      {$row?.selectedRowKeys?.length ? (
        <Alert
          style={{ padding: "3px 4px" }}
          type="info"
          message={
            <Space size="small" split={<Divider type="vertical" />}>
              <Button type="text" size="small">
                选中 {$row?.selectedRowKeys?.length} 项
              </Button>
              <Button
                size="small"
                onClick={() => {
                  if (!$row) return;
                  $row.selectedRows = [];
                  $row.selectedRowKeys = [];
                }}
                type="link"
              >
                取消选择
              </Button>
              <Button
                size="small"
                onClick={() => {
                  if (!$row) return;
                  const selected = $row.selectedRowKeys!.reduce(
                    (m: Record<string, string>, i: any) => {
                      m[i] = i;
                      return m;
                    },
                    {},
                  );
                  const keys: (string | number)[] = [];
                  const rows: any[] = [];
                  ds.forEach((item) => {
                    const key = rowKey(item);
                    if (!selected[key]) {
                      keys.push(key);
                      rows.push(item);
                    }
                  });
                  $row.selectedRowKeys = keys;
                  $row.selectedRows = rows;
                }}
                type="link"
              >
                选择反向
              </Button>
            </Space>
          }
        />
      ) : null}
    </Space>
  );
};

const schema: ISchema = {
  type: "object",
  properties: {
    size: {
      type: "string",
      "x-component": "Radio.Group",
      "x-component-props": {
        optionType: "button",
        buttonStyle: "solid",
      },
      enum: [
        { label: "紧凑", value: "small" },
        { label: "中等", value: "middle" },
        { label: "默认", value: "large" },
      ],
    },
    columns: {
      type: "array",
      "x-component": "ProArrayTable",
      "x-component-props": {
        bordered: false,
        settings: false,
        pagination: false,
        rowSelection: false,
        showHeader: false,
      },
      items: {
        type: "object",
        properties: {
          _sort: {
            type: "void",
            "x-component": "ProArrayTable.Column",
            "x-component-props": {
              width: 40,
            },
            properties: {
              sort: {
                type: "void",
                "x-component": "ProArrayTable.SortHandle",
              },
            },
          },
          _show: {
            type: "void",
            "x-component": "ProArrayTable.Column",
            "x-component-props": {
              width: 40,
            },
            properties: {
              show: {
                type: "boolean",
                "x-component": "Checkbox",
              },
            },
          },
          _title: {
            type: "void",
            "x-component": "ProArrayTable.Column",
            "x-component-props": {
              width: 60,
            },
            properties: {
              title: {
                type: "string",
                "x-component": "PreviewText",
              },
            },
          },
          _width: {
            type: "void",
            "x-component": "ProArrayTable.Column",
            "x-component-props": {
              width: 100,
            },
            properties: {
              width: {
                type: "string",
                "x-component": "Slider",
                "x-component-props": {
                  min: 20,
                  max: 400,
                },
              },
            },
          },
        },
      },
    },
  },
};
export const ProSettings = observer(() => {
  const proCtx = useContext(ProArrayTableMaxContext);
  const SchemaField = useCreation(
    () =>
      createSchemaField({
        components: {
          Slider: connect(Slider),
          FormItem,
          Input,
          NumberPicker,
          Radio,
          ProArrayTable,
          PreviewText,
          Checkbox,
        },
      }),
    [],
  );

  const form = useCreation(() => {
    return createForm({
      initialValues: toJS(proCtx),
      effects(form) {
        onFieldChange("*", (field) => {
          console.log("field", field.address.toString(), (field as any)?.value);
          // FIXME: 等待修复
          // Object.assign(proCtx, toJS(form.values));
        });
      },
    });
  }, []);
  form.setValuesIn("columns", proCtx.columns);

  const content = useMemo(() => {
    return (
      <FormProvider form={form}>
        <SchemaField schema={schema} />
      </FormProvider>
    );
  }, []);
  const title = useMemo(() => {
    return (
      <Row justify="space-between">
        <h4>表格设置</h4>
        <Button onClick={() => {}}>重置</Button>
      </Row>
    );
  }, []);
  return (
    <ConfigProvider componentSize="small">
      <Popover content={content} title={title} trigger="click">
        <Button
          style={{ justifySelf: "flex-end" }}
          icon={<SettingOutlined />}
          type="link"
        ></Button>
      </Popover>
    </ConfigProvider>
  );
});
