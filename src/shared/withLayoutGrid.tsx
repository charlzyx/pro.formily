import { ISchema } from "@formily/react";
import { FormGrid, FormLayout } from "../adaptor/adaptor";

export const withLayoutGrid = <T extends ISchema["properties"]>(
  properties: T,
  layout?: React.ComponentProps<typeof FormLayout>,
  grid?: React.ComponentProps<typeof FormGrid>,
) => {
  return {
    _layout: {
      type: "void",
      "x-decorator": "FormLayout",
      "x-decorator-props": {
        labelCol: 5,
        wrapperCol: 19,
        ...layout,
      } as typeof layout,
      "x-component": "FormGrid",
      "x-component-props": {
        ...grid,
      } as typeof grid,
      properties: properties,
    },
  };
};
