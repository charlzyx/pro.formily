export * as builtins from "arco.formily/dist/esm/__builtins__";
export {
  FormGrid,
  FormButtonGroup,
  FormLayout,
  Checkbox,
  FormItem,
  Input,
  NumberPicker,
  PreviewText,
  Radio,
} from "arco.formily";

import {
  TableColumnProps,
  TableProps as ArcoTableProps,
} from "@arco-design/web-react";
import { ArrayBase as AntdArrayBase } from "arco.formily";
export type { ArrayBaseMixins } from "arco.formily";
// 类型fix
export const ArrayBase = AntdArrayBase as Required<typeof AntdArrayBase> &
  typeof AntdArrayBase;
export type ColumnProps<T> = TableColumnProps;

export type TableProps<T> = Omit<
  ArcoTableProps<T>,
  "pagination" | "rowSelection"
> & {
  title: (ds: T[]) => React.ReactNode;
  pagination?: Exclude<ArcoTableProps<T>["pagination"], boolean>;
  rowSelection?: Omit<
    Exclude<ArcoTableProps<T>["rowSelection"], undefined>,
    "onChange"
  > & {};
};
export type ColumnsType<T> = TableColumnProps[];
