import { Alert as ArcoAlert } from "@arco-design/web-react";
import React from "react";

export type AlertProps = Omit<
  React.ComponentProps<typeof ArcoAlert>,
  "content"
> & {
  message?: React.ComponentProps<typeof ArcoAlert>["content"];
};

export const Alert = React.forwardRef(
  ({ message, ...props }: AlertProps, ref) => {
    return <ArcoAlert {...props} content={message} ref={ref}></ArcoAlert>;
  },
);
