import { TableProps } from "@arco-design/web-react";
import React, { useState } from "react";
import type { ResizeCallbackData } from "react-resizable";
import { Resizable } from "react-resizable";
import { omit } from "src/__builtins__";

const measureTableHeight = (el: HTMLElement) => {
  let table = el as any;
  while (table && table.tagName !== "TABLE") {
    table = table.parentElement!;
  }
  if (!table) return "100%";
  return (table as HTMLTableElement).clientHeight;
};

export const ResizableTitle: React.FC<
  React.PropsWithChildren<{
    width: number;
    onResize: (
      e: React.SyntheticEvent<Element>,
      data: ResizeCallbackData,
    ) => void;
    style: React.CSSProperties;
    resizeable?: boolean;
  }>
> = (props) => {
  const [width, setWidth] = useState(props.width ?? 0);
  const [resizing, setResizing] = useState(false);

  const onResize = (
    _: React.SyntheticEvent<Element>,
    data: ResizeCallbackData,
  ) => {
    const { size, node } = data;
    if (size.width === width) return;

    setWidth(size.width);
    setResizing(true);
    const offset = size.width - props.width;
    const tableH = measureTableHeight(node);
    node.classList.add("active");
    node.setAttribute(
      "style",
      `transform: translate3d(${offset}px, 0, 0); height: ${tableH}px`,
    );
  };
  const onResizeStop = (
    _: React.SyntheticEvent<Element>,
    data: ResizeCallbackData,
  ) => {
    const { node } = data;
    setResizing(true);
    node.classList.remove("active");
    node.setAttribute(
      "style",
      "transform: translate3d(0, 0, 0); height: 100%;",
    );
    props.onResize(_, data);
  };

  const others = omit(props, "width", "onResize", "resizeable");
  return !width || !props.resizeable ? (
    <th
      {...(others as any)}
      style={{
        ...others.style,
        userSelect: resizing ? "none" : "text",
      }}
    ></th>
  ) : (
    <Resizable
      width={width}
      axis="x"
      height={0}
      // 默认的就是这个
      // handle={
      //   <span
      //     className="react-resizable-handle"
      //     onClick={(e) => {
      //       e.stopPropagation();
      //     }}
      //   />
      // }
      onResize={onResize}
      onResizeStop={onResizeStop}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th
        {...(others as any)}
        style={{
          ...others.style,
          userSelect: resizing ? "none" : "text",
        }}
      />
    </Resizable>
  );
};

export const useResizeHeader = (opts: {
  enable?: boolean;
}) => {
  const header: Required<TableProps<any>>["components"]["header"] = opts.enable
    ? { cell: ResizableTitle }
    : {};

  return header;
};
