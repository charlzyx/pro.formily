import { useField } from "@formily/react";
import React, { useState } from "react";
import { Button, Popconfirm, PopconfirmProps, Typography } from "../adaptor";
import { RecordFormProps, useFieldRecordForm } from "./hooks";

export const ProPopconfirm: React.FC<
  RecordFormProps &
    PopconfirmProps & {
      onCancel: () => void | Promise<void>;
      onConfirm: (data: any) => void | Promise<void>;
    }
> = (props) => {
  const field = useField();
  const { FormBody, form } = useFieldRecordForm(props);
  const [visible, setVisible] = useState(false);

  return (
    <Popconfirm
      icon={null}
      {...props}
      open={visible}
      onOpenChange={(open, e) => {
        setVisible(open);
        if (props.onOpenChange) {
          props.onOpenChange(open, e);
        }
      }}
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
          <FormBody></FormBody>
        </React.Fragment>
      }
      destroyTooltipOnHide
      disabled={!field.editable}
    >
      <Button type="link" {...props.buttonProps} disabled={!field.editable}>
        {field.title}
      </Button>
    </Popconfirm>
  );
};
