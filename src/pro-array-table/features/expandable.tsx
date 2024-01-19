import React, { createContext, useEffect, useRef, useState } from "react";
import { useExpandRender } from "../hooks";
import { ProArrayTableProps, RowKey, RowKeyFn } from "../types";

export type IExpandableProps = Required<ProArrayTableProps>["expandable"] & {};

function expandedSchameRowRender(record: any, index: number) {
  return useExpandRender(index);
}

export interface ITableExpandableContext {
  expandedRowKeys: RowKey[];
  setExpandedRowKeys: React.Dispatch<React.SetStateAction<RowKey[]>>;
}

export const TableExpandableContext = createContext<ITableExpandableContext>({
  expandedRowKeys: [],
  setExpandedRowKeys: (x) => x,
});

export const useExpandable = (
  props: IExpandableProps | undefined,
  dataSlice: any[],
  rowKeyRef: React.MutableRefObject<RowKeyFn>,
  pageNo?: number,
) => {
  const [keys, setKeys] = useState([
    ...(props?.expandedRowKeys ?? []),
    ...(props?.defaultExpandedRowKeys ?? []),
  ] as RowKey[]);
  const inited = useRef(false);

  const expandAll = () => {
    setKeys(
      dataSlice.map((item) =>
        typeof rowKeyRef.current === "string"
          ? item[rowKeyRef.current]
          : rowKeyRef.current(item),
      ),
    );
  };
  // 处理 defaultExpandAllRows
  useEffect(() => {
    if (!props) return;
    if (inited.current) return;
    if (
      props.defaultExpandAllRows &&
      dataSlice.length > 0 &&
      keys.length !== dataSlice.length
    ) {
      inited.current = true;
      expandAll();
    }
  }, [props?.defaultExpandAllRows, keys, dataSlice?.length]);

  const ctx: ITableExpandableContext = {
    expandedRowKeys: keys,
    setExpandedRowKeys: setKeys,
  };

  const merged = props
    ? ({
        ...props,
        ...ctx,
        expandedRowKeys: keys,
        onExpandedRowsChange(expandedRowKeys) {
          // readonly
          setKeys(expandedRowKeys.slice());
          props?.onExpandedRowsChange?.(expandedRowKeys);
        },
        expandedRowRender: props.expandedRowRender ?? expandedSchameRowRender,
      } as IExpandableProps)
    : null;

  // 当页码变更的时候, 重置
  useEffect(() => {
    if (!pageNo) return;
    if (props?.defaultExpandAllRows) {
      expandAll();
    } else {
      setKeys([]);
    }
  }, [pageNo]);

  return [ctx, merged] as const;
};
