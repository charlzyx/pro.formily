import { TableProps } from "@arco-design/web-react";
import React from "react";
import type { ResizeCallbackData } from "react-resizable";
import { Resizable } from "react-resizable";

const measureTableHeight = (el: HTMLElement) => {
  let table = el as any;
  while (table && table.tagName !== "TABLE") {
    table = table.parentElement!;
  }
  if (!table) return "100%";
  return (table as HTMLTableElement).clientHeight;
};

export class ResizableTitle extends React.Component<
  {
    width: number;
    onResize: (
      e: React.SyntheticEvent<Element>,
      data: ResizeCallbackData,
    ) => void;
    style: React.CSSProperties;
    resizeable?: boolean;
  },
  {
    width: number;
    resizing: boolean;
  }
> {
  state = {
    width: this.props.width,
    resizing: false,
  };

  onResize = (_: React.SyntheticEvent<Element>, data: ResizeCallbackData) => {
    const { size, node } = data;
    if (size.width === this.state.width) return;
    this.setState({ width: size.width, resizing: true });
    const offset = size.width - this.props.width;
    const tableH = measureTableHeight(node);
    node.classList.add("active");
    node.setAttribute(
      "style",
      `transform: translate3d(${offset}px, 0, 0); height: ${tableH}px`,
    );
  };
  onResizeStop = (
    _: React.SyntheticEvent<Element>,
    data: ResizeCallbackData,
  ) => {
    const { node } = data;
    this.setState((s) => ({ ...s, resizing: true }));
    node.classList.remove("active");
    node.setAttribute(
      "style",
      "transform: translate3d(0, 0, 0); height: 100%;",
    );
    this.props.onResize(_, data);
  };

  render() {
    const { width, resizeable, onResize, ...others } = this.props;

    return !width || !resizeable ? (
      <th {...others}></th>
    ) : (
      <Resizable
        width={this.state.width}
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
        onResize={this.onResize}
        onResizeStop={this.onResizeStop}
        draggableOpts={{ enableUserSelectHack: false }}
      >
        <th
          {...others}
          style={{
            ...others.style,
            userSelect: this.state.resizing ? "none" : "text",
          }}
        />
      </Resizable>
    );
  }
}
export const useResizeHeader = (opts: {
  enable?: boolean;
}) => {
  const header: Required<TableProps<any>>["components"]["header"] = opts.enable
    ? { th: ResizableTitle }
    : {};

  return header;
};
