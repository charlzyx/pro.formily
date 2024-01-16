import { FieldDisplayTypes, GeneralField } from "@formily/core";
import { Schema } from "@formily/json-schema";
import type { ColumnProps, TableProps } from "../adaptor/adaptor";

type TableChangeParams = Parameters<Required<TableProps<any>>["onChange"]>;

type RequiredTableProps = Required<TableProps<any>>;

export type IChangeData = {
  pagination: TableChangeParams[0];
  filters: TableChangeParams[1];
  sorter: TableChangeParams[2];
  extra: TableChangeParams[3];
};

export type ArrayTableProProps = Omit<TableProps<any>, "title"> & {
  title: string | TableProps<any>["title"];
  footer: string | TableProps<any>["footer"];
  rowSelection?:
    | (Exclude<RequiredTableProps["rowSelection"], undefined> & {
        position?: "top" | "bottom";
      })
    | true;
  /** 列表配置齿轮, 默认 true */
  settings?: boolean;
  /** 在列表配置齿轮左边的位置 */
  extra?: React.ReactNode;
  /** 表头列宽是否可拖动, 默认 true, 整体配置,  column 配置中可以单独关闭  */
  resizeable?: boolean;
  /** 是否开启根据 page 信息 slice 性能优化, 默认开启  */
  slice?: boolean;
  /** onChange 与 formily#field 的 onChange 冲突，但很有用， 所以改个名字 */
  onTableChange?: TableProps<any>["onChange"];
};
export interface ObservableColumnSource {
  field?: GeneralField;
  columnProps: ColumnProps<any> & {
    /** 列宽是否可拖动, 默认开启 */
    resizeable?: boolean;
  };
  schema: Schema;
  display: FieldDisplayTypes;
  name: string;
}
