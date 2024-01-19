import React from "react";
import { Typography } from "../adaptor";

const { Paragraph } = Typography;

export const LongText: React.FC<
  React.ComponentProps<typeof Paragraph> & {
    value?: string;
    maxRows?: number;
  }
> = (props) => {
  return (
    <Paragraph
      copyable={{
        tooltips: [props.value, "复制成功"],
      }}
      ellipsis
      {...props}
      style={{ marginBottom: 0, whiteSpace: "break-spaces" }}
    >
      {props.value}
    </Paragraph>
  );
};
