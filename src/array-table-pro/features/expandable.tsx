import React, { createContext, useEffect, useRef, useState } from "react";
import { useExpandRender } from "../hooks";
import { ArrayTableProProps, RowKey } from "../types";

export type IExpandableProps = Required<ArrayTableProProps>["expandable"] & {};

type GetParamsAt<T extends 0 | 1 | 2 | 3 | 4> = Parameters<
  Required<IExpandableProps>["expandedRowRender"]
>[T];

function expandedSchameRowRender(
  record: GetParamsAt<0>,
  index: GetParamsAt<1>,
  indent: GetParamsAt<2>,
  expanded: GetParamsAt<3>,
) {
  const expand = useExpandRender(index);
  return expand;
}

export interface IArrayExpandableContext {
  expandedRowKeys: React.Key[];
  setExpandedRowKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
}

export const ArrayExpandableContext = createContext<IArrayExpandableContext>({
  expandedRowKeys: [],
  setExpandedRowKeys: (x) => x,
});

export const useExpandable = (
  props: IExpandableProps | undefined,
  dataSource: any[],
  rowKeyRef: React.MutableRefObject<RowKey>,
) => {
  const [keys, setKeys] = useState([
    ...(props?.expandedRowKeys ?? []),
    ...(props?.defaultExpandedRowKeys ?? []),
  ]);
  const inited = useRef(false);

  // 处理 defaultExpandAllRows
  useEffect(() => {
    if (!props) return;
    if (inited.current) return;
    if (
      props.defaultExpandAllRows &&
      dataSource.length > 0 &&
      keys.length !== dataSource.length
    ) {
      inited.current = true;
      setKeys(
        dataSource.map((item) =>
          typeof rowKeyRef.current === "string"
            ? item[rowKeyRef.current]
            : rowKeyRef.current(item),
        ),
      );
    }
  }, [props?.defaultExpandAllRows, keys, dataSource?.length]);

  const merged: IExpandableProps | null = props
    ? {
        ...props,
        expandedRowKeys: keys,
        onExpandedRowsChange(expandedRowKeys) {
          // readonly
          setKeys(expandedRowKeys.slice());
          props?.onExpandedRowsChange?.(expandedRowKeys);
        },
        expandedRowRender: props.expandedRowRender ?? expandedSchameRowRender,
      }
    : null;

  const ctx: IArrayExpandableContext = {
    expandedRowKeys: keys,
    setExpandedRowKeys: setKeys,
  };

  return [ctx, merged] as const;
};
