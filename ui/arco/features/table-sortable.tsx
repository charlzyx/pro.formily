import { TableProps } from "@arco-design/web-react";
import React from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

const SortableRow = SortableElement((props: any) => <tr {...props} />);
const SortableBody = SortableContainer((props: any) => (
  <tbody className="sortable-hoc" {...props} />
));

const RowComp = (props: any) => {
  return <SortableRow index={props["data-row-sort-index"] || 0} {...props} />;
};

const addTdStyles = (node: HTMLElement, prefixCls: string) => {
  const helper = document.body.querySelector(`.${prefixCls}-sort-helper`);
  if (helper) {
    const tds = node.querySelectorAll("td");
    requestAnimationFrame(() => {
      helper.querySelectorAll("td").forEach((td, index) => {
        if (tds[index]) {
          td.style.width = getComputedStyle(tds[index]).width;
        }
      });
    });
  }
};

export const getWrapperComp = (opts: {
  list: any[];
  start: number;
  prefixCls: string;
  onSortEnd: (oldIndex: number, newIndex: number) => void;
  wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const WrapperSortableBody = React.memo(
    (props: React.HTMLAttributes<HTMLTableSectionElement>) => {
      const { onSortEnd, wrapperRef, prefixCls } = opts;
      return (
        <SortableBody
          {...props}
          useDragHandle
          lockAxis="y"
          helperClass={`${prefixCls}-sort-helper`}
          helperContainer={() => {
            const helper = wrapperRef.current?.querySelector("tbody");
            return helper!;
          }}
          onSortStart={({ node }: any) => {
            addTdStyles(node as HTMLElement, prefixCls);
          }}
          onSortEnd={({ oldIndex, newIndex }: any) => {
            onSortEnd(oldIndex, newIndex);
          }}
        ></SortableBody>
      );
    },
  );
  return WrapperSortableBody;
};

export const useSortableBody = (
  dataSource: any[],
  onSortEnd: (from: number, to: number) => void,
  opts: {
    enable: boolean;
    wrapperRef: React.MutableRefObject<HTMLDivElement | null>;
    start: number;
    prefixCls: string;
  },
) => {
  const body: Required<TableProps<any>>["components"]["body"] = opts.enable
    ? {
        tbody: getWrapperComp({
          list: dataSource,
          start: opts.start,
          prefixCls: opts.prefixCls,
          onSortEnd: onSortEnd,
          wrapperRef: opts.wrapperRef,
        }),
        row: RowComp,
      }
    : {};

  return body;
};
