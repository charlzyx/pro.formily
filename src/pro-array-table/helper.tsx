import { Schema } from "@formily/json-schema";

export const isColumnComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("Column") > -1;
};

export const isOperationsComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("Operations") > -1;
};

export const isAdditionComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("Addition") > -1;
};

export const isToolbarComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("Toolbar") > -1;
};

export const isFooterComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("Footer") > -1;
};

export const isExpandComponent = (schema: Schema) => {
  return schema["x-component"]?.indexOf("RowExpand") > -1;
};

export const hasSortable = (schema: Schema): boolean => {
  const canMap = (schema.items || (schema as any)) as Schema;
  const ret = canMap.reduceProperties((sortable: boolean, propSchema) => {
    if (sortable) {
      // 被上面条件阻止的
      return sortable;
    }
    const componentName = propSchema["x-component"];
    /** 嵌套的 子 ArrayLike 组件 忽略 */
    if (/Array/.test(componentName) && !/\./.test(componentName)) {
      return false;
    } else if (propSchema["x-component"]?.indexOf("SortHandle") > -1) {
      return true;
    } else if (propSchema.properties || propSchema.items) {
      return hasSortable(propSchema);
    }
    return sortable;
  });
  return ret;
};
