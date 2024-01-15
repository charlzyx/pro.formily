import React from "react";
import { Typography } from "../adaptor";

const { Paragraph } = Typography;

export const LongText = (
  props: {
    value?: string;
  } & React.ComponentProps<typeof Paragraph>,
) => {
  return (
    <Paragraph copyable ellipsis {...props} style={{ marginBottom: 0 }}>
      {props.value}
    </Paragraph>
  );
};
