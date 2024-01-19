import { Cascader as ArcoCascader } from "@arco-design/web-react";
import React from "react";

export type CascaderProps = Omit<
  React.ComponentProps<typeof ArcoCascader>,
  "renderFormat" | "loadMore"
> & {
  multiple?: boolean;
  loadData?: Required<React.ComponentProps<typeof ArcoCascader>>["loadMore"];
  displayRender?: Required<
    React.ComponentProps<typeof ArcoCascader>
  >["renderFormat"];
};

export const Cascader = ({
  multiple,
  loadData,
  displayRender,
  ...props
}: React.PropsWithChildren<CascaderProps>) => {
  return (
    <ArcoCascader
      {...props}
      mode={multiple ? "multiple" : undefined}
      loadMore={loadData}
      renderFormat={displayRender}
    >
      {props.children}
    </ArcoCascader>
  );
};
