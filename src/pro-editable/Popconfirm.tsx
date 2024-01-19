import { useField } from "@formily/react";
import React, { useState } from "react";
import { BUTTON_TYPE, Button, Popconfirm, Typography } from "../adaptor";
import { RecordFormProps, useFieldRecordForm } from "./hooks";

export const ProPopconfirm: React.FC<
  RecordFormProps &
    React.ComponentProps<typeof Popconfirm> & {
      onCancel: () => void | Promise<void>;
      onConfirm: (data: any) => void | Promise<void>;
    }
> = ({ children, ...fieldProps }) => {
  const field = useField();
  const { body, form } = useFieldRecordForm(fieldProps);
  const [visible, setVisible] = useState(false);
  const props = field.componentProps;

  return (
    <Popconfirm
      icon={null}
      {...props}
      open={visible}
      cancelText={props.cancelText}
      okText={props.okText}
      onCancel={() => {
        return form
          .reset()
          .then(props.onCancel)
          .then(() => setVisible(false));
      }}
      onConfirm={() => {
        return form
          .submit()
          .then(props.onConfirm)
          .then(() => setVisible(false));
      }}
      title={
        <React.Fragment>
          <Typography.Title level={5}>{props.title as any}</Typography.Title>
          {body}
        </React.Fragment>
      }
      destroyTooltipOnHide
      disabled={!field.editable}
    >
      <Button
        onClick={() => setVisible(true)}
        type={BUTTON_TYPE}
        {...props.buttonProps}
        disabled={!field.editable}
      >
        {field.title}
      </Button>
    </Popconfirm>
  );
};
