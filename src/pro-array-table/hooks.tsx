import { ArrayField, isArrayField } from "@formily/core";
import { Schema } from "@formily/json-schema";
import { RecursionField, useField, useFieldSchema } from "@formily/react";
import { isArr } from "@formily/shared";
import { ColumnsType } from "antd/es/table";
import { useContext, useMemo, useState } from "react";
import type { ResizeCallbackData } from "react-resizable";
import { ArrayBase } from "./array-base";

import { ArrayTableProContext } from "./context";
import {
  ObservableColumnSource,
  isAdditionComponent,
  isColumnComponent,
  isExpandComponent,
  isFootbarComponent,
  isOperationsComponent,
  isToolbarComponent,
} from "./helper";

const parseSources = (
  arrayField: ArrayField,
  schema: Schema,
): ObservableColumnSource[] => {
  if (
    isColumnComponent(schema) ||
    isOperationsComponent(schema) ||
    isAdditionComponent(schema) ||
    isToolbarComponent(schema) ||
    isExpandComponent(schema)
  ) {
    if (!schema["x-component-props"]?.dataIndex && !schema.name) return [];
    const name = schema["x-component-props"]?.dataIndex || schema.name;
    const field = arrayField.query(arrayField.address.concat(name)).take();
    const columnProps =
      (field?.component as any)?.[1] || schema["x-component-props"] || {};
    const display = field?.display || schema["x-display"];
    return [
      {
        name,
        display,
        field,
        schema,
        columnProps,
      },
    ];
  } else if (schema.properties) {
    return schema.reduceProperties<
      ObservableColumnSource[],
      ObservableColumnSource[]
    >((buf, schema) => {
      return buf.concat(parseSources(arrayField, schema));
    }, []);
  }
  return [];
};
const parseArrayItems = (arrayField: ArrayField, schema: Schema["items"]) => {
  if (!schema) return [];
  const sources: ObservableColumnSource[] = [];
  const items = isArr(schema) ? schema : [schema];
  return items.reduce((columns, schema) => {
    const item = parseSources(arrayField, schema);
    if (item) {
      return columns.concat(item);
    }
    return columns;
  }, sources);
};

const useColumns = (
  arrayField: ArrayField,
  sources: ObservableColumnSource[],
) => {
  const [resize, setResizes] = useState<number[]>([]);
  const proCtx = useContext(ArrayTableProContext);
  const prebuild = sources.filter((item) => {
    return (
      item.display === "visible" &&
      proCtx.columns.find((x) => x.dataIndex === item.name)?.show !== false &&
      isColumnComponent(item.schema)
    );
  });

  prebuild.sort((a, b) => {
    const pa = proCtx.columns.find((x) => x.dataIndex === a.name);
    const pb = proCtx.columns.find((x) => x.dataIndex === b.name);
    const rank = (pb?.order ?? 0) - (pa?.order ?? 0) > 0 ? -1 : 1;
    return rank;
  });

  const columns = useMemo(() => {
    const origin = prebuild.reduce<ColumnsType<any>>(
      (buf, { name, columnProps, schema, display }, key) => {
        // if (display !== "visible") return buf;
        // if (!isColumnComponent(schema)) return buf;
        return buf.concat({
          ...columnProps,
          key,
          width: resize[key] ?? columnProps.width,
          dataIndex: name,
          onHeaderCell() {
            return {
              width: resize[key] ?? columnProps.width,
              onResize(e: any, data: ResizeCallbackData) {
                setResizes((prev) => {
                  prev[key] = data.size.width;
                  return [...prev];
                });
              },
              // index: key,
            } as any;
          },
          render: (value: any, record: any) => {
            const index = arrayField.value.indexOf(record);
            const children = (
              <ArrayBase.Item
                index={index}
                record={() => arrayField?.value?.[index]}
              >
                <RecursionField
                  schema={schema}
                  name={index}
                  onlyRenderProperties
                />
              </ArrayBase.Item>
            );
            return children;
          },
        });
      },
      [],
    );
    return origin;
  }, [resize, prebuild, arrayField]);
  // console.log("__sources", sources, columns);

  return columns;
};

export const useArrayTableSources = () => {
  const arrayField = useField<ArrayField>();
  const schema = useFieldSchema();
  const sources = parseArrayItems(arrayField, schema.items);
  const columns = useColumns(arrayField, sources);

  return [columns, sources] as const;
};

export const useExpandRender = (index: number) => {
  const schema = useFieldSchema();
  const array = ArrayBase.useArray();

  return schema.reduceProperties((expand, schema, key) => {
    if (isExpandComponent(schema)) {
      return (
        <ArrayBase.Item index={index} record={() => array.field.value?.[index]}>
          <RecursionField onlyRenderProperties schema={schema} name={index} />
        </ArrayBase.Item>
      );
    }
    return expand;
  }, null);
};

export const useAddition = () => {
  const schema = useFieldSchema();
  return schema.reduceProperties((addition, schema, key) => {
    if (isAdditionComponent(schema)) {
      return <RecursionField schema={schema} name={key} />;
    }
    return addition;
  }, null);
};

export const useToolbar = () => {
  const schema = useFieldSchema();
  return schema.reduceProperties((toolbar, schema, key) => {
    if (isToolbarComponent(schema)) {
      return <RecursionField schema={schema} name={key} />;
    }
    return toolbar;
  }, null);
};

export const useFootbar = () => {
  const schema = useFieldSchema();
  return schema.reduceProperties((footer, schema, key) => {
    if (isFootbarComponent(schema)) {
      return <RecursionField schema={schema} name={key} />;
    }
    return footer;
  }, null);
};

export const useArrayField = () => {
  const field = useField();
  let array = field;
  while (array && !isArrayField(array)) {
    array = array.parent;
  }
  return array;
};
