import { Typography as ArcoTypography } from "@arco-design/web-react";
import React from "react";

export type DrawerProps = Omit<
  React.ComponentProps<(typeof ArcoTypography)["Title"]>,
  "visible" | "afterClose"
> & {
  level?: React.ComponentProps<(typeof ArcoTypography)["Title"]>["heading"];
};

const ArcoTitle = ArcoTypography.Title;
export const Title = ({ level, ...props }: DrawerProps) => {
  return (
    <ArcoTitle {...props} heading={level}>
      {props.children}
    </ArcoTitle>
  );
};

export const Typography = ArcoTypography as Omit<
  typeof ArcoTypography,
  "Title"
> & {
  Title: typeof Title;
};

Typography.Title = Title;
